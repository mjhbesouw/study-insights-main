import { supabase, isSupabaseConfigured } from "./supabase";
import { turingQuestionnaireConfig } from "@/config/turingConfig";
import {
  ParticipantSession,
  ConsentData,
  AnswerValue,
  QueuedAction,
} from "@/types/questionnaire";

// ============================================
// LOCAL STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  SESSION_ID: "session_id", // Set by Access.tsx
  PARTICIPANT_ID: "participant_id", // Uniquely identifies user across sessions
  SESSION_META: "turing_session", // For progress tracking
  ANSWERS: "turing_answers",
  OFFLINE_QUEUE: "turing_offline_queue",
};

let isProcessingQueue = false;

// ============================================
// SESSION MANAGEMENT
// ============================================

export function getOrCreateSession(): ParticipantSession {
  const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  const storedMeta = localStorage.getItem(STORAGE_KEYS.SESSION_META);

  let meta = {
    current_step: 0,
    current_case_index: 0,
    consent_given: true,
    is_submitted: false,
    created_at: new Date().toISOString(),
  };

  if (storedMeta) {
    try {
      meta = { ...meta, ...JSON.parse(storedMeta) };
    } catch {
      // ignore invalid
    }
  }

  const session: ParticipantSession = {
    session_id: sessionId || '',
    ...meta
  };

  localStorage.setItem(STORAGE_KEYS.SESSION_META, JSON.stringify(meta));
  return session;
}

export async function setSessionState(step: number, caseIndex: number): Promise<void> {
  const sessionId = requireSessionId();
  if (!isSupabaseConfigured()) return;

  // 1. First try to update (will quietly do 0 rows if RLS blocks update or row is missing)
  const { data } = await supabase
    .from("sessions_turing")
    .update({
      current_step: step,
      current_case_index: caseIndex,
      updated_at: new Date().toISOString()
    })
    .eq("id", sessionId)
    .select("id");

  // 2. If 0 rows updated, force an insert! (This guarantees the row exists even if UPDATE RLS is missing)
  if (!data || data.length === 0) {
    const { error: insertError } = await supabase
      .from("sessions_turing")
      .insert({
        id: sessionId,
        participant_id: requireParticipantId(),
        current_step: step,
        current_case_index: caseIndex,
        updated_at: new Date().toISOString()
      });
      
    if (insertError && !insertError.message.includes("duplicate key")) {
      console.error("Failed to insert sessions_turing row:", insertError);
    }
  }
}

/**
 * Fetches session state from Supabase and updates local storage.
 */
export async function fetchSessionFromSupabase(sessionId: string): Promise<Partial<ParticipantSession>> {
  if (!isSupabaseConfigured()) return {};

  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions_turing")
    .select("current_step, current_case_index")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    console.error("Failed to fetch session from Supabase:", sessionError);
  }

  // This allows the user to delete a row in Supabase and instantly unlock their frontend.
  const participantId = localStorage.getItem(STORAGE_KEYS.PARTICIPANT_ID);
  let isSubmitted = false;

  if (participantId) {
    const { data: subData, error: subError } = await supabase
      .from("submissions_turing")
      .select("id")
      .eq("participant_id", participantId)
      .limit(1);

    if (!subError && subData && subData.length > 0) {
      isSubmitted = true;
    }
  }

  // Clean out any lingering ghost submissions from the offline queue
  const queue = getOfflineQueue();
  const cleanedQueue = queue.filter(q => q.action !== "finalise_submission");
  if (queue.length !== cleanedQueue.length) {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(cleanedQueue));
  }

  const updates: Partial<ParticipantSession> = {
    is_submitted: isSubmitted
  };

  if (sessionData) {
    updates.current_step = sessionData.current_step;
    updates.current_case_index = sessionData.current_case_index;
  }

  updateSession(updates);
  return updates;
}

export function updateSession(updates: Partial<ParticipantSession>): ParticipantSession {
  const session = getOrCreateSession();
  const updated = { ...session, ...updates };

  // Split meta from session_id
  const { session_id, ...meta } = updated;
  localStorage.setItem(STORAGE_KEYS.SESSION_META, JSON.stringify(meta));

  if (updates.current_step !== undefined || updates.current_case_index !== undefined) {
    setSessionState(updated.current_step, updated.current_case_index).catch(console.error);
  }

  return updated;
}

export function clearSession(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

// ============================================
// SESSION HELPERS
// ============================================

function requireSessionId(): string {
  const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) throw new Error("Geen actieve sessie gevonden. Log opnieuw in met uw code.");
  return sessionId;
}

function requireParticipantId(): string {
  const participantId = localStorage.getItem(STORAGE_KEYS.PARTICIPANT_ID);
  if (!participantId) throw new Error("Participant ID ontbreekt. Log opnieuw in.");
  return participantId;
}

// ============================================
// OFFLINE QUEUE
// ============================================

type OfflineAction =
  | { action: "upsert_answer"; payload: UpsertAnswerPayload }
  | { action: "hide_answer"; payload: HideAnswerPayload }
  | { action: "finalise_submission"; payload: FinaliseSubmissionPayload };

function getOfflineQueue(): QueuedAction[] {
  const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function addToOfflineQueue(action: OfflineAction): void {
  const queue = getOfflineQueue();

  const queuedAction: QueuedAction = {
    ...(action as unknown as Omit<QueuedAction, "id" | "timestamp" | "retries">),
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    retries: 0,
  };

  queue.push(queuedAction);
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
}

function removeFromQueue(actionId: string): void {
  const queue = getOfflineQueue().filter((a) => a.id !== actionId);
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
}

import { isQuestionVisible } from "./conditionEvaluator";

/**
 * Checks if all required questions for a specific segmentation case are answered.
 * Evaluates visibility (show_if) to ensure only applicable questions are required.
 */
export function isPatientComplete(caseId: string, answers: Record<string, AnswerValue>): boolean {
  const caseCfg = turingQuestionnaireConfig.segmentation_patients
    .flatMap(p => p.variants)
    .find(c => c.case_id === caseId);
  if (!caseCfg) return true;

  // Create a record of answers for visibility evaluation
  // Include both case-specific answers and profile answers
  const evaluationContext: Record<string, AnswerValue> = {};
  const prefix = `segmentation.${caseId}.`;

  Object.entries(answers).forEach(([key, val]) => {
    if (key.startsWith(prefix)) {
      evaluationContext[key.replace(prefix, '')] = val;
    } else if (key.startsWith('profile.')) {
      evaluationContext[key.replace('profile.', '')] = val;
    } else {
      // Also include global keys (e.g. feedback)
      evaluationContext[key] = val;
    }
  });

  return caseCfg.questions
    .filter(q => q.required)
    .every(q => {
      // If the question is hidden by its show_if condition, it's not required for completeness
      if (!isQuestionVisible(q.show_if, evaluationContext)) {
        return true;
      }

      // If visible and required, check if answer exists and is not empty
      const key = `${prefix}${q.id}`;
      const answer = answers[key];
      if (!answer) return false;

      const val = answer.value;
      if (val === null || val === undefined) return false;
      if (typeof val === 'string' && val.trim().length === 0) return false;
      if (Array.isArray(val) && val.length === 0) return false;

      return true;
    });
}

/**
 * Checks if the profile section is complete.
 */
export function isProfileComplete(answers: Record<string, AnswerValue>): boolean {
  return turingQuestionnaireConfig.profile_questions
    .filter(q => q.required)
    .every(q => {
      const key = `profile.${q.id}`;
      const answer = answers[key];
      if (!answer) return false;
      const val = answer.value;
      if (val === null || val === undefined) return false;
      if (typeof val === 'string' && val.trim().length === 0) return false;
      return true;
    });
}

/**
 * Generates a report of missing required questions.
 */
export interface CompletenessReport {
  profile: string[];
  cases: { id: string; name: string; missing: string[] }[];
  isComplete: boolean;
}

export function getMissingQuestionsReport(answers: Record<string, AnswerValue>): CompletenessReport {
  const report: CompletenessReport = {
    profile: [],
    cases: [],
    isComplete: true
  };

  // Check Profile
  const profileAnswers: Record<string, AnswerValue> = {};
  Object.entries(answers).forEach(([k, v]) => {
    if (k.startsWith('profile.')) {
      profileAnswers[k.replace('profile.', '')] = v;
    }
  });

  turingQuestionnaireConfig.profile_questions.forEach(q => {
    if (q.required) {
      if (!isQuestionVisible(q.show_if, profileAnswers)) return;

      const val = answers[`profile.${q.id}`]?.value;
      if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
        report.profile.push(q.label);
        report.isComplete = false;
      }
    }
  });

  // Check Cases
  turingQuestionnaireConfig.segmentation_patients.forEach(p => {
    p.variants.forEach(c => {
      const missing: string[] = [];
      const prefix = `segmentation.${c.case_id}.`;

      // Non-prefixed mapping for visibility check
      const evaluationContext: Record<string, AnswerValue> = {};
      Object.entries(answers).forEach(([k, v]) => {
        if (k.startsWith(prefix)) {
          evaluationContext[k.replace(prefix, '')] = v;
        } else if (k.startsWith('profile.')) {
          evaluationContext[k.replace('profile.', '')] = v;
        } else {
          evaluationContext[k] = v;
        }
      });

      c.questions.forEach(q => {
        if (q.required) {
          // Skip hidden questions
          if (!isQuestionVisible(q.show_if, evaluationContext)) {
            return;
          }

          const val = answers[`${prefix}${q.id}`]?.value;
          const isEmpty = val === null ||
            val === undefined ||
            (typeof val === 'string' && val.trim() === '') ||
            (Array.isArray(val) && val.length === 0);

          if (isEmpty) {
            missing.push(q.label.replace(/<[^>]*>?/gm, ''));
          }
        }
      });

      if (missing.length > 0) {
        report.cases.push({
          id: c.case_id,
          name: `${p.display_name} - ${c.display_name}`,
          missing
        });
        report.isComplete = false;
      }
    });
  });

  return report;
}

/**
 * Processes the offline queue of actions.
 */
export async function processOfflineQueue(): Promise<void> {
  if (isProcessingQueue || !isSupabaseConfigured()) return;

  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  isProcessingQueue = true;
  console.log(`Processing offline queue: ${queue.length} items`);

  const remainingQueue: QueuedAction[] = [];

  for (const action of queue) {
    try {
      if (action.action === "upsert_answer") {
        await upsertAnswerToSupabase(action.payload as UpsertAnswerPayload);
      } else if (action.action === "hide_answer") {
        await hideAnswerInSupabase(action.payload as HideAnswerPayload);
      } else if (action.action === "finalise_submission") {
        await finaliseSubmissionToSupabase(action.payload as FinaliseSubmissionPayload);
        updateSession({ is_submitted: true });
      }
    } catch (error) {
      console.error(`Failed to process action ${action.id}:`, error);
      if (action.retries < 5) {
        remainingQueue.push({ ...action, retries: action.retries + 1 });
      }
    }
  }

  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remainingQueue));
  isProcessingQueue = false;
}

// ============================================
// PROFILE
// ============================================

export async function saveProfile(
  experience: string,
  aiExperience: string
): Promise<void> {
  // Save profile items as normal answers. 
  // Passing null for case_id ensures "profile.item_id" key format in local storage.
  const timestamp = new Date().toISOString();

  await Promise.all([
    upsertAnswer("profile", null, "experience", { value: experience, timestamp }),
    upsertAnswer("profile", null, "ai_experience", { value: aiExperience, timestamp })
  ]);
}

// ============================================
// ANSWERS
// ============================================

interface UpsertAnswerPayload {
  step: string;
  case_id: string | null;
  item_id: string;
  value: AnswerValue;
}

async function upsertAnswerToSupabase(payload: UpsertAnswerPayload): Promise<void> {
  const sessionId = requireSessionId();
  const participantId = requireParticipantId();

  console.log("[save profile/single] Sending payload to Supabase:");
  console.log(JSON.stringify({
    session_id: sessionId,
    participant_id: participantId,
    case_id: payload.case_id ?? "__profile__",
    group_code: payload.step,
    question_code: payload.item_id,
    answer: payload.value.value,
    hidden: false,
    comment: payload.value.comment || null,
    step: payload.step,
    item_id: payload.item_id,
    value_json: payload.value
  }, null, 2));

  const dbPayload = {
    session_id: sessionId,
    participant_id: participantId,
    group_code: payload.step,
    case_id: payload.case_id ?? "__profile__",
    question_code: payload.item_id,
    answer: payload.value.value,
    comment: payload.value.comment || null,
    hidden: false,
    updated_at: payload.value.timestamp,
  };

  const { data, error, status, statusText } = await supabase.from("answers_turing").upsert(
    dbPayload,
    { onConflict: "participant_id,group_code,case_id,question_code" }
  ).select();

  if (error) {
    console.error("[SUPABASE ERROR: upsertAnswerToSupabase]");
    console.error("Status:", status, statusText);
    console.error("Payload:", payload);
    console.error("Error details:", error);
    throw error;
  }
}

export async function saveSurveyProgress(
  sessionId: string,
  answers: Record<string, AnswerValue>,
  currentStep: number,
  currentCaseIndex: number,
  isSubmitted: boolean = false
): Promise<boolean> {
  console.log(`[saveSurveyProgress] STARTED for participant! Step: ${currentStep}, CaseIdx: ${currentCaseIndex}, Keys: ${Object.keys(answers).length}`);
  // 1. Sync session state first
  try {
    if (isSupabaseConfigured()) {
      // Try to update first
      const { data } = await supabase
        .from("sessions_turing")
        .update({
          current_step: currentStep,
          current_case_index: currentCaseIndex,
          updated_at: new Date().toISOString()
        })
        .eq("id", sessionId)
        .select("id");

      // If no row updated, force insert it!
      if (!data || data.length === 0) {
        await supabase.from("sessions_turing").insert({
          id: sessionId,
          participant_id: requireParticipantId(),
          current_step: currentStep,
          current_case_index: currentCaseIndex,
          updated_at: new Date().toISOString()
        });
      }
    }

    updateSession({
      current_step: currentStep,
      current_case_index: currentCaseIndex,
      is_submitted: isSubmitted
    });
    console.log(`[saveSurveyProgress] Session state synced successfully!`);
  } catch (err) {
    console.error("[saveSurveyProgress] FATAL ERROR syncing session state:", err);
    return false;
  }

  // 2. Prepare all answers for bulk upsert
  const answersArray = [];
  console.log(`[saveSurveyProgress] Preparing bulk array...`);

  const participantId = requireParticipantId();
  for (const [key, answerObj] of Object.entries(answers)) {
    const parts = key.split('.');
    const step = parts[0];

    // Ignore stray profile answers — those are not part of the Turing test.
    // Feedback answers (step === 'feedback') ARE intentionally saved.
    if (step === 'profile') {
      continue;
    }

    let caseId: string | null = null;
    let itemId: string;

    // Feedback and profile-style answers use a 2-part key (step.questionId).
    // Map these to '__profile__' so they share the same DB pattern as profile rows.
    const isFlatKey = step === 'feedback' || parts.length === 2;

    if (!isFlatKey && parts.length === 3) {
      caseId = parts[1];
      itemId = parts[2];
    } else {
      caseId = '__profile__';
      itemId = parts[1];
    }

    // Completely ignore any old answers from before we separated the Turing test
    // This cleans up old test data remaining in the browser
    if (caseId !== '__profile__' && !caseId.endsWith('_turing')) {
      continue;
    }

    answersArray.push({
      session_id: sessionId,
      participant_id: participantId,
      group_code: step,
      case_id: caseId,
      question_code: itemId,
      answer: answerObj.value,
      comment: answerObj.comment || null,
      hidden: false,
      updated_at: answerObj.timestamp || new Date().toISOString(),
    });
  }

  // 3. Upsert all answers to Supabase
  if (isSupabaseConfigured() && answersArray.length > 0) {
    try {
      // DEDUPLICATE: Supabase bulk upserts cannot contain two rows with the exact same unique constraint columns.
      // E.g. If the answers dictionary has obsolete or duplicate mappings that resolve to the same DB row.
      const uniqueMap = new Map<string, typeof answersArray[0]>();

      answersArray.forEach(ans => {
        const uniqueKey = `${ans.participant_id}_${ans.group_code}_${ans.case_id}_${ans.question_code}`;

        if (uniqueMap.has(uniqueKey)) {
          // If we have a duplicate mapping, taking the one with the newest timestamp is safest
          const existing = uniqueMap.get(uniqueKey)!;
          if (new Date(ans.updated_at) > new Date(existing.updated_at)) {
            uniqueMap.set(uniqueKey, ans);
          }
        } else {
          uniqueMap.set(uniqueKey, ans);
        }
      });

      const deduplicatedArray = Array.from(uniqueMap.values());

      console.log(`[saveSurveyProgress] Attempting to bulk upsert ${deduplicatedArray.length} answers... (reduced from ${answersArray.length})`);
      console.log("Bulk Payload exactly as sent to DB:");
      deduplicatedArray.forEach(ans => {
        console.log(JSON.stringify({
          session_id: ans.session_id,
          participant_id: ans.participant_id,
          case_id: ans.case_id,
          group_code: ans.group_code,
          question_code: ans.question_code,
          answer: ans.answer,
          hidden: ans.hidden,
          comment: ans.comment,
        }, null, 2));
      });

      const { data, error, status, statusText } = await supabase.from("answers_turing").upsert(
        deduplicatedArray,
        { onConflict: "participant_id,group_code,case_id,question_code" }
      ).select();

      if (error) {
        console.error("[SUPABASE ERROR: saveSurveyProgress BULK UPSERT]");
        console.error("Status:", status, statusText);
        console.error("Error details:", error);
        window.alert(`Database error: ${error.message}\nDetails: ${error.details}\nHint: ${error.hint}`);
        throw error;
      }
      console.log("[saveSurveyProgress] Bulk upsert successful! Data:", data);
    } catch (err: any) {
      console.error("[saveSurveyProgress] Exception during bulk upsert!", err);
      // We also alert the outer catch in case it's a network issue
      if (!err.message?.includes("Database error")) {
        window.alert(`Save Exception: ${err.message}`);
      }
      return false;
    }
  } else {
    console.log(`[saveSurveyProgress] Skipped bulk upsert. Configured: ${isSupabaseConfigured()}, Array Length: ${answersArray.length}`);
  }

  return true;
}

export async function upsertAnswer(
  step: string,
  case_id: string | null,
  item_id: string,
  value: AnswerValue
): Promise<boolean> {
  const storedAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
  const answers = storedAnswers ? JSON.parse(storedAnswers) : {};

  // Unify Key Format:
  // Use 2-part keys for Profile/Feedback (step.id)
  // Use 3-part keys for Segmentation (step.case_id.id)
  const isProfile = step === 'profile' || case_id === '__profile__';
  const localKey = (isProfile || !case_id)
    ? `${step}.${item_id}`
    : `${step}.${case_id}.${item_id}`;

  answers[localKey] = value;
  localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));

  if (!isSupabaseConfigured()) return true;

  try {
    await upsertAnswerToSupabase({ step, case_id, item_id, value });
    return true;
  } catch (error: any) {
    if (error?.message?.includes("already_submitted")) {
      console.warn("Write rejected: submission is final");
      return false;
    }

    console.error("Failed to upsert answer to Supabase, queuing for retry:", error);
    addToOfflineQueue({ action: "upsert_answer", payload: { step, case_id, item_id, value } });
    return true;
  }
}

// ============================================
// CONDITIONAL HIDING
// ============================================

interface HideAnswerPayload {
  step: string;
  case_id: string | null;
  item_id: string;
}

async function hideAnswerInSupabase(payload: HideAnswerPayload): Promise<void> {
  // Non-destructive: We no longer delete the value or set hidden = true in Supabase.
  // The value is preserved in the database in case the user navigates back and the condition
  // becomes true again.
  console.log('Skipping Supabase hide for:', payload);
}

export async function hideAnswer(
  step: string,
  case_id: string | null,
  item_id: string
): Promise<void> {
  // Non-destructive locally as well. We want to retain the answers in our state
  // and local storage so they aren't lost if the user toggles a conditional back on.
  console.log('Skipping local hide for:', step, case_id, item_id);
}

export function getStoredAnswers(): Record<string, AnswerValue> {
  const stored = localStorage.getItem(STORAGE_KEYS.ANSWERS);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

/**
 * Fetches all answers for a session from Supabase and merges them into local storage.
 * Ensures consistent key mapping so UI can rehydrate correctly.
 */
export async function fetchAnswersFromSupabase(participantId?: string, sessionId?: string): Promise<Record<string, AnswerValue>> {
  if (!isSupabaseConfigured()) return {};

  const activeParticipantId = participantId || localStorage.getItem(STORAGE_KEYS.PARTICIPANT_ID);

  if (!activeParticipantId) {
    console.error("fetchAnswersFromSupabase aborted: No participant_id available");
    return getStoredAnswers();
  }

  console.log(`[fetchAnswersFromSupabase] Requesting answers for EXACT participant_id: "${activeParticipantId}"`);

  const { data, error } = await supabase
    .from("answers_turing")
    .select("group_code, case_id, question_code, answer, comment, updated_at")
    .eq("participant_id", activeParticipantId);

  if (error) {
    console.error("Failed to fetch answers from Supabase:", error);
    return getStoredAnswers(); // Fallback to local on error
  }

  const remoteAnswers: Record<string, AnswerValue> = {};
  console.log(`[fetchAnswersFromSupabase] Fetched ${data?.length || 0} rows from Supabase`);
  if (data?.length) {
    console.log("First fetched row as example:", data[0]);
  }

  // Build a set of valid case_ids from current config to reject stale rows
  const validCaseIds = new Set<string | null>([
    '__profile__', null,
    ...turingQuestionnaireConfig.segmentation_patients.flatMap(p => p.variants.map(v => v.case_id))
  ]);

  data?.forEach((row) => {
    const isProfile = row.group_code === "profile" || row.group_code === "feedback" || row.case_id === "__profile__" || row.case_id === null;

    // Skip rows with unrecognized case_ids (legacy data like 'case_01')
    if (!isProfile && !validCaseIds.has(row.case_id)) {
      console.warn(`[fetchAnswersFromSupabase] Skipping legacy row with case_id="${row.case_id}"`);
      return;
    }

    // Construct key using the same logic as upsertAnswer
    const key = isProfile
      ? `${row.group_code}.${row.question_code}`
      : `${row.group_code}.${row.case_id}.${row.question_code}`;

    let parsedAnswer = row.answer;
    // Handle potential stringified JSON in the DB column if applicable
    try {
      if (typeof row.answer === 'string' && (row.answer.startsWith('{') || row.answer.startsWith('['))) {
        parsedAnswer = JSON.parse(row.answer);
      }
    } catch (e) { }

    remoteAnswers[key] = {
      value: parsedAnswer,
      comment: row.comment || "",
      timestamp: row.updated_at,
    };
  });

  console.log("[fetchAnswersFromSupabase] Mapped remote answers to keys:", Object.keys(remoteAnswers));

  // Supabase succeeded → it's the authoritative source. Replace local entirely.
  // (We do NOT merge with localStorage here — that would allow stale local data
  //  to survive after the user deletes rows from Supabase.)
  localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(remoteAnswers));

  return remoteAnswers;
}

export { isSupabaseConfigured };

// ============================================
// TEMPORARY MANUAL TEST
// ============================================

export async function testManualSupabaseSave() {
  console.log("--- RUNNING MANUAL SUPABASE TEST ---");
  try {
    const sessionId = requireSessionId();
    const participantId = requireParticipantId();

    // 1. Test the exact RLS policy condition
    console.log(`[TEST] Calling RPC "session_is_active" with ID: ${sessionId}`);
    const rpcResult = await supabase.rpc('session_is_active', { session_id: sessionId });
    console.log("[TEST] RPC Result:", rpcResult);

    const payload = {
      session_id: sessionId,
      participant_id: participantId,
      group_code: 'segmentation',
      case_id: 'patient_01_a',
      question_code: 'TEST_Q1',
      answer: { value: 'test' },
      comment: null,
      hidden: false,
      updated_at: new Date().toISOString()
    };

    console.log("PAYLOAD:", JSON.stringify(payload, null, 2));

    const { data, error, status, statusText } = await supabase.from('answers_turing').upsert(
      [payload],
      { onConflict: 'participant_id,group_code,case_id,question_code' }
    ).select();

    if (error) {
      console.error("TEST FAILED:", error);
      console.error("STATUS:", status, statusText);
    } else {
      console.log("TEST SUCCESS! UPSERT DATA:", data);

      // 2. Test SELECT with new policy AFTER upsert to prove we can read what we wrote
      console.log(`[TEST] Attempting DIRECT SELECT for session: ${sessionId}`);
      const selectResult = await supabase.from('answers_turing').select('*').eq('session_id', sessionId);
      console.log("[TEST] SELECT Result (Should not be empty!):", selectResult);
    }
    return { success: !error, error, data };
  } catch (err) {
    console.error("TEST FATAL ERROR:", err);
    return { success: false, error: err };
  }
}

// ============================================
// FINAL SUBMISSION
// ============================================

interface FinaliseSubmissionPayload {
  submission_payload: {
    app_version: string;
    timestamp: string;
    final_answers?: Record<string, any>;
  };
}

async function finaliseSubmissionToSupabase(payload: FinaliseSubmissionPayload): Promise<void> {
  const sessionId = requireSessionId();
  const participantId = requireParticipantId();

  // Check if already submitted to prevent duplicates in the frontend
  const { data: existingSub } = await supabase
    .from('submissions_turing')
    .select('id')
    .eq('participant_id', participantId)
    .limit(1);

  if (existingSub && existingSub.length > 0) {
    throw new Error("already_submitted");
  }

  // Try to update first, if 0 rows, force insert.
  const { data: sessData } = await supabase.from("sessions_turing")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId).select("id");
    
  if (!sessData || sessData.length === 0) {
    await supabase.from("sessions_turing").insert({
      id: sessionId,
      participant_id: participantId,
      current_step: 1,
      current_case_index: 0,
      updated_at: new Date().toISOString()
    });
  }

  // First insert into submissions table
  const { error: insertError } = await supabase.from('submissions_turing').insert({
    session_id: sessionId,
    participant_id: participantId,
    submitted_at: new Date().toISOString(),
    status: 'completed',
    completion_snapshot: payload.submission_payload
  });

  if (insertError) {
    console.error("Error inserting submission:", insertError);
    if (insertError.message?.includes("duplicate key") || insertError.code === "23505") {
      throw new Error("already_submitted");
    }
    window.alert(`Submission Error: ${insertError.message}\nDetails: ${insertError.details || ''}`);
    throw insertError;
  }

  // If there's still an RPC "finalise_submission" we can call it, but if it expects `metadata`, it might fail.
  // We will selectively try it and ignore PGRST204 errors safely if the user didn't update the RPC yet.
  const { data, error } = await supabase.rpc("finalise_submission", {
    session_id: sessionId,
    submission_payload: payload.submission_payload,
  });

  if (error) {
    if (error.message.includes("already_submitted")) {
      throw new Error("already_submitted");
    }
    console.warn("RPC finalise_submission failed (non-critical if insert succeeded):", error);
  }

  if (data?.reason === "already_submitted") {
    throw new Error("already_submitted");
  }
}

export async function finaliseSubmission(): Promise<"submitted" | "already_submitted" | "queued"> {
  const currentAnswers = getStoredAnswers();

  const payload: FinaliseSubmissionPayload = {
    submission_payload: {
      app_version: "1.0.0",
      timestamp: new Date().toISOString(),
      final_answers: currentAnswers
    }
  };

  if (!isSupabaseConfigured()) {
    // Only local mode
    updateSession({ is_submitted: true });
    return "submitted";
  }

  try {
    await finaliseSubmissionToSupabase(payload);
    updateSession({ is_submitted: true }); // only after success
    return "submitted";
  } catch (error: any) {
    if (error.message === "already_submitted") {
      updateSession({ is_submitted: true }); // ok to lock locally too
      return "already_submitted";
    }

    console.error("Failed to finalise submission, queuing for retry:", error);
    addToOfflineQueue({ action: "finalise_submission", payload });

    // Do NOT set is_submitted true here
    return "queued";
  }
}
