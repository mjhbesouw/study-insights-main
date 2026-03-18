// ============================================
// QUESTIONNAIRE CONFIGURATION TYPES
// ============================================

/**
 * Condition operators for conditional logic
 */
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'includes';

/**
 * Condition for showing/hiding questions
 */
export interface Condition {
  source_question_id: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
  values?: (string | number | boolean)[];
}

/**
 * Question types supported in the questionnaire
 */
export type QuestionType =
  | 'likert'
  | 'choice'
  | 'text'
  | 'slider'
  | 'toggle'
  | 'dropdown'
  | 'checkbox';

/**
 * Likert scale configuration
 */
export interface LikertConfig {
  min: number;
  max: number;
  min_label?: string;
  max_label?: string;
  labels?: Record<number, string>;
}

/**
 * Choice option for dropdown/radio/checkbox
 */
export interface ChoiceOption {
  value: string;
  label: string;
}

/**
 * Slider configuration
 */
export interface SliderConfig {
  min: number;
  max: number;
  step?: number;
  min_label?: string;
  max_label?: string;
}

/**
 * Individual question item
 */
export interface QuestionItem {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required?: boolean;

  // Type-specific configs
  likert_config?: LikertConfig;
  choices?: ChoiceOption[];
  slider_config?: SliderConfig;

  // Conditional display
  show_if?: Condition;

  // Additional options
  allow_comment?: boolean;
  comment_label?: string;
  placeholder?: string;
}

/**
 * Config for a specific variant (e.g. A or B) of a patient case
 */
export interface CaseVariant {
  variant_id: string; // 'A' or 'B'
  case_id: string; // the database identifier, e.g. 'patient_01_a'
  display_name?: string;
  description?: string;
  questions: QuestionItem[];
}

/**
 * Patient configuration grouping multiple variants
 */
export interface PatientConfig {
  patient_id: string;
  display_name?: string;
  variants: CaseVariant[];
}

/**
 * Turing test case configuration
 */
export interface TuringTestCase {
  case_id: string;
  display_name?: string;
  question_text: string;
  options: ChoiceOption[];
  show_confidence_slider?: boolean;
  show_reasoning?: boolean;
}

/**
 * Step configuration
 */
export interface StepConfig {
  id: string;
  title: string;
  description?: string;
}

/**
 * Complete questionnaire configuration
 */
export interface QuestionnaireConfig {
  version: string;

  // Participant profile step
  profile_questions: QuestionItem[];

  // Segmentation rating patients (Step 2)
  segmentation_patients: PatientConfig[];

  // Turing test cases (Step 3)
  turing_cases: TuringTestCase[];

  // Overall feedback questions (Step 4)
  feedback_questions: QuestionItem[];

  // Step metadata
  steps: StepConfig[];
}

// ============================================
// ANSWER/RESPONSE TYPES
// ============================================

/**
 * Single answer value
 */
export interface AnswerValue {
  value: string | number | boolean | string[] | null;
  comment?: string;
  timestamp: string;
}

/**
 * Answers organized by step, case, and question
 */
export interface Answers {
  profile: Record<string, AnswerValue>;
  segmentation: Record<string, Record<string, AnswerValue>>; // case_id -> question_id -> value
  turing: Record<string, {
    choice: string | null;
    confidence: number | null;
    reasoning?: string;
    timestamp: string;
  }>;
  feedback: Record<string, AnswerValue>;
}

// ============================================
// PARTICIPANT/SESSION TYPES
// ============================================

export interface ParticipantSession {
  session_id: string;
  participant_id?: string;
  created_at: string;
  current_step: number;
  current_case_index: number;
  consent_given: boolean; // Note: although we're removing the step, keeping the property for schema fallback
  is_submitted: boolean;
}

export interface ConsentData {
  items: {
    id: string;
    label: string;
    checked: boolean;
  }[];
  name: string;
  email?: string;
  center: string;
  consented_at: string;
}

// ============================================
// OFFLINE QUEUE TYPES
// ============================================

export interface QueuedAction {
  id: string;
  action: 'upsert_answer' | 'hide_answer' | 'finalise_submission';
  payload: unknown;
  timestamp: string;
  retries: number;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface QuestionnaireState {
  session: ParticipantSession | null;
  answers: Answers;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  offlineQueue: QueuedAction[];
}
