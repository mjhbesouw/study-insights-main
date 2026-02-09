import { supabase, isSupabaseConfigured } from './supabase';
import { 
  ParticipantSession, 
  ConsentData, 
  AnswerValue, 
  QueuedAction 
} from '@/types/questionnaire';

// ============================================
// LOCAL STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  SESSION: 'dls_study_session',
  ANSWERS: 'dls_study_answers',
  OFFLINE_QUEUE: 'dls_study_offline_queue',
  CONSENT: 'dls_study_consent',
};

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get or create a participant session
 */
export function getOrCreateSession(): ParticipantSession {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid stored session, create new
    }
  }

  const session: ParticipantSession = {
    session_id: generateSessionId(),
    created_at: new Date().toISOString(),
    current_step: 0,
    current_case_index: 0,
    consent_given: false,
  };

  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  return session;
}

/**
 * Update session in localStorage
 */
export function updateSession(updates: Partial<ParticipantSession>): ParticipantSession {
  const session = getOrCreateSession();
  const updated = { ...session, ...updates };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updated));
  return updated;
}

/**
 * Clear session (for development/testing)
 */
export function clearSession(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

// ============================================
// OFFLINE QUEUE MANAGEMENT
// ============================================

/**
 * Get the offline queue
 */
function getOfflineQueue(): QueuedAction[] {
  const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Add action to offline queue
 */
function addToOfflineQueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>): void {
  const queue = getOfflineQueue();
  const queuedAction: QueuedAction = {
    ...action,
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    retries: 0,
  };
  queue.push(queuedAction);
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
}

/**
 * Remove action from queue
 */
function removeFromQueue(actionId: string): void {
  const queue = getOfflineQueue().filter(a => a.id !== actionId);
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
}

/**
 * Process offline queue - retry failed requests
 */
export async function processOfflineQueue(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const queue = getOfflineQueue();
  
  for (const action of queue) {
    try {
      switch (action.action) {
        case 'upsert_answer':
          await upsertAnswerToSupabase(action.payload as UpsertAnswerPayload);
          break;
        case 'save_consent':
          await saveConsentToSupabase(action.payload as SaveConsentPayload);
          break;
        case 'submit_final':
          await submitFinalToSupabase(action.payload as SubmitFinalPayload);
          break;
      }
      removeFromQueue(action.id);
    } catch (error) {
      console.error(`Failed to process queued action ${action.id}:`, error);
      // Keep in queue for next retry
    }
  }
}

// ============================================
// CONSENT
// ============================================

interface SaveConsentPayload {
  session_id: string;
  consent_data: ConsentData;
}

async function saveConsentToSupabase(payload: SaveConsentPayload): Promise<void> {
  const { error } = await supabase.from('consent').insert({
    participant_id: payload.session_id,
    consented_at: payload.consent_data.consented_at,
    items_json: payload.consent_data.items,
    name: payload.consent_data.name,
    email: payload.consent_data.email,
    center: payload.consent_data.center,
  });

  if (error) throw error;
}

export async function saveConsent(consentData: ConsentData): Promise<boolean> {
  const session = getOrCreateSession();
  
  // Always save locally first
  localStorage.setItem(STORAGE_KEYS.CONSENT, JSON.stringify(consentData));
  updateSession({ consent_given: true });

  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured - consent saved locally only');
    return true;
  }

  try {
    await saveConsentToSupabase({ session_id: session.session_id, consent_data: consentData });
    return true;
  } catch (error) {
    console.error('Failed to save consent to Supabase, queuing for retry:', error);
    addToOfflineQueue({
      action: 'save_consent',
      payload: { session_id: session.session_id, consent_data: consentData },
    });
    return true; // Still return true as it's saved locally
  }
}

// ============================================
// ANSWERS
// ============================================

interface UpsertAnswerPayload {
  session_id: string;
  step: string;
  case_id: string | null;
  item_id: string;
  value: AnswerValue;
}

async function upsertAnswerToSupabase(payload: UpsertAnswerPayload): Promise<void> {
  const { error } = await supabase.from('answers').upsert(
    {
      participant_id: payload.session_id,
      step: payload.step,
      case_id: payload.case_id,
      item_id: payload.item_id,
      value_json: payload.value.value,
      comment: payload.value.comment || null,
      updated_at: payload.value.timestamp,
    },
    {
      onConflict: 'participant_id,step,case_id,item_id',
    }
  );

  if (error) throw error;
}

/**
 * Upsert a single answer
 */
export async function upsertAnswer(
  step: string,
  case_id: string | null,
  item_id: string,
  value: AnswerValue
): Promise<boolean> {
  const session = getOrCreateSession();

  // Update local storage
  const storedAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
  const answers = storedAnswers ? JSON.parse(storedAnswers) : {};
  
  const key = case_id ? `${step}.${case_id}.${item_id}` : `${step}.${item_id}`;
  answers[key] = value;
  localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));

  if (!isSupabaseConfigured()) {
    return true;
  }

  try {
    await upsertAnswerToSupabase({
      session_id: session.session_id,
      step,
      case_id,
      item_id,
      value,
    });
    return true;
  } catch (error) {
    console.error('Failed to upsert answer to Supabase, queuing for retry:', error);
    addToOfflineQueue({
      action: 'upsert_answer',
      payload: { session_id: session.session_id, step, case_id, item_id, value },
    });
    return true;
  }
}

/**
 * Delete an answer (for conditional questions that become hidden)
 */
export async function deleteAnswer(
  step: string,
  case_id: string | null,
  item_id: string
): Promise<void> {
  const session = getOrCreateSession();

  // Remove from local storage
  const storedAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
  if (storedAnswers) {
    const answers = JSON.parse(storedAnswers);
    const key = case_id ? `${step}.${case_id}.${item_id}` : `${step}.${item_id}`;
    delete answers[key];
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
  }

  if (!isSupabaseConfigured()) return;

  try {
    await supabase
      .from('answers')
      .delete()
      .match({
        participant_id: session.session_id,
        step,
        case_id: case_id || '',
        item_id,
      });
  } catch (error) {
    console.error('Failed to delete answer from Supabase:', error);
  }
}

/**
 * Get all stored answers from localStorage
 */
export function getStoredAnswers(): Record<string, AnswerValue> {
  const stored = localStorage.getItem(STORAGE_KEYS.ANSWERS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  return {};
}

// ============================================
// FINAL SUBMISSION
// ============================================

interface SubmitFinalPayload {
  session_id: string;
  completion_code: string;
}

async function submitFinalToSupabase(payload: SubmitFinalPayload): Promise<void> {
  const { error } = await supabase.from('submissions').insert({
    participant_id: payload.session_id,
    submitted_at: new Date().toISOString(),
    completion_code: payload.completion_code,
  });

  if (error) throw error;
}

/**
 * Generate a completion code
 */
function generateCompletionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Submit final questionnaire
 */
export async function submitFinal(): Promise<string> {
  const session = getOrCreateSession();
  const completionCode = generateCompletionCode();

  // Update session
  updateSession({ current_step: -1 }); // Mark as completed

  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured - submission marked locally only');
    return completionCode;
  }

  try {
    await submitFinalToSupabase({
      session_id: session.session_id,
      completion_code: completionCode,
    });
    return completionCode;
  } catch (error) {
    console.error('Failed to submit to Supabase, queuing for retry:', error);
    addToOfflineQueue({
      action: 'submit_final',
      payload: { session_id: session.session_id, completion_code: completionCode },
    });
    return completionCode;
  }
}

/**
 * Create participant session in Supabase (called after consent)
 */
export async function createParticipantSession(
  role: string,
  experience: string,
  familiarity: number,
  center: string
): Promise<void> {
  const session = getOrCreateSession();

  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured - participant session saved locally only');
    return;
  }

  try {
    const { error } = await supabase.from('participants').upsert(
      {
        id: session.session_id,
        created_at: session.created_at,
        center,
        role,
        experience,
        familiarity,
      },
      { onConflict: 'id' }
    );

    if (error) throw error;
  } catch (error) {
    console.error('Failed to create participant session in Supabase:', error);
  }
}
