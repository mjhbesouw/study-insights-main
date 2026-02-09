import { QuestionnaireConfig, CaseConfig, TuringTestCase } from '@/types/questionnaire';

// ============================================
// MOCK QUESTIONNAIRE CONFIGURATION
// 
// Replace this with your actual configuration.
// The structure supports:
// - Up to 30 segmentation cases
// - Up to 9 questions per case
// - Conditional logic via show_if
// ============================================

/**
 * Generate mock segmentation cases
 * Replace this with your actual case configuration
 */
function generateMockCases(count: number): CaseConfig[] {
  const cases: CaseConfig[] = [];
  
  for (let i = 1; i <= count; i++) {
    cases.push({
      case_id: `case_${i.toString().padStart(2, '0')}`,
      display_name: `Case ${i}`,
      description: `Segmentation quality assessment for case ${i}`,
      questions: [
        {
          id: 'overall_quality',
          type: 'likert',
          label: 'Overall segmentation quality',
          description: 'Rate the overall quality of the segmentation',
          required: true,
          likert_config: {
            min: 1,
            max: 5,
            min_label: 'Poor',
            max_label: 'Excellent',
          },
          allow_comment: false,
        },
        {
          id: 'quality_explanation',
          type: 'text',
          label: 'Please explain what was insufficient',
          description: 'Provide details about quality issues',
          required: true,
          placeholder: 'Describe the issues observed...',
          show_if: {
            source_question_id: 'overall_quality',
            operator: 'lte',
            value: 3,
          },
        },
        {
          id: 'boundary_accuracy',
          type: 'likert',
          label: 'Boundary accuracy',
          description: 'How accurate are the segmentation boundaries?',
          required: true,
          likert_config: {
            min: 1,
            max: 5,
            min_label: 'Inaccurate',
            max_label: 'Very accurate',
          },
        },
        {
          id: 'clinical_acceptability',
          type: 'likert',
          label: 'Clinical acceptability',
          description: 'Would this segmentation be acceptable for clinical use without modification?',
          required: true,
          likert_config: {
            min: 1,
            max: 5,
            min_label: 'Not acceptable',
            max_label: 'Fully acceptable',
          },
        },
        {
          id: 'editing_needed',
          type: 'likert',
          label: 'Amount of editing required',
          description: 'How much manual editing would be needed?',
          required: false,
          likert_config: {
            min: 1,
            max: 5,
            min_label: 'Extensive editing',
            max_label: 'No editing',
          },
        },
        {
          id: 'flag_for_review',
          type: 'toggle',
          label: 'Flag this case for review',
          description: 'Mark if this case requires further discussion',
          required: false,
        },
        {
          id: 'flag_reason',
          type: 'text',
          label: 'Reason for flagging',
          description: 'Please explain why this case needs review',
          required: true,
          placeholder: 'Explain the reason for flagging...',
          show_if: {
            source_question_id: 'flag_for_review',
            operator: 'equals',
            value: true,
          },
        },
        {
          id: 'additional_comments',
          type: 'text',
          label: 'Additional comments',
          description: 'Any other observations about this case',
          required: false,
          placeholder: 'Optional comments...',
        },
      ],
    });
  }
  
  return cases;
}

/**
 * Generate mock Turing test cases
 * Replace with your actual configuration
 */
function generateMockTuringCases(count: number): TuringTestCase[] {
  const cases: TuringTestCase[] = [];
  
  for (let i = 1; i <= count; i++) {
    cases.push({
      case_id: `turing_${i.toString().padStart(2, '0')}`,
      display_name: `Comparison ${i}`,
      question_text: 'Which segmentation was created by the AI system?',
      options: [
        { value: 'A', label: 'Segmentation A' },
        { value: 'B', label: 'Segmentation B' },
        { value: 'unsure', label: 'Cannot determine' },
      ],
      show_confidence_slider: true,
      show_reasoning: true,
    });
  }
  
  return cases;
}

/**
 * Main questionnaire configuration
 * 
 * CUSTOMIZE THIS FOR YOUR STUDY:
 * - Update profile_questions for participant demographics
 * - Replace segmentation_cases with your actual cases
 * - Modify turing_cases for your comparison questions
 * - Adjust feedback_questions as needed
 */
export const questionnaireConfig: QuestionnaireConfig = {
  version: '1.0.0',

  steps: [
    { id: 'profile', title: 'Profile', description: 'Your background information' },
    { id: 'segmentation', title: 'Segmentation Rating', description: 'Evaluate segmentation quality' },
    { id: 'turing', title: 'Comparison Test', description: 'Identify AI vs clinical segmentations' },
    { id: 'feedback', title: 'Feedback', description: 'Overall experience and recommendations' },
  ],

  profile_questions: [
    {
      id: 'role',
      type: 'dropdown',
      label: 'What is your current role?',
      required: true,
      choices: [
        { value: 'radiation_oncologist', label: 'Radiation Oncologist' },
        { value: 'resident', label: 'Resident' },
        { value: 'medical_physicist', label: 'Medical Physicist' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'role_other',
      type: 'text',
      label: 'Please specify your role',
      required: true,
      placeholder: 'Enter your role...',
      show_if: {
        source_question_id: 'role',
        operator: 'equals',
        value: 'other',
      },
    },
    {
      id: 'experience',
      type: 'dropdown',
      label: 'Years of experience in radiation oncology',
      required: true,
      choices: [
        { value: '0-2', label: '0–2 years' },
        { value: '3-5', label: '3–5 years' },
        { value: '6-10', label: '6–10 years' },
        { value: '10+', label: 'More than 10 years' },
      ],
    },
    {
      id: 'familiarity',
      type: 'likert',
      label: 'Familiarity with auto-segmentation tools',
      description: 'How familiar are you with auto-segmentation in clinical practice?',
      required: true,
      likert_config: {
        min: 1,
        max: 5,
        min_label: 'Not familiar',
        max_label: 'Very familiar',
        labels: {
          1: 'Never used',
          2: 'Rarely used',
          3: 'Sometimes used',
          4: 'Frequently used',
          5: 'Daily use',
        },
      },
    },
  ],

  // Mock cases - replace with your actual case configuration
  // Supports up to 30 cases, each with up to 9 questions
  segmentation_cases: generateMockCases(5), // Change to your desired count (max 30)

  turing_cases: generateMockTuringCases(5), // Change to your desired count

  feedback_questions: [
    {
      id: 'worked_well',
      type: 'text',
      label: 'What worked well?',
      description: 'Please share any positive aspects of the segmentation system',
      required: false,
      placeholder: 'Describe what worked well...',
    },
    {
      id: 'difficulties',
      type: 'text',
      label: 'What was difficult or could be improved?',
      description: 'Please share any challenges or suggestions for improvement',
      required: false,
      placeholder: 'Describe any difficulties or suggestions...',
    },
    {
      id: 'clinical_recommendation',
      type: 'choice',
      label: 'Would you recommend using this system clinically?',
      required: true,
      choices: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'unsure', label: 'Unsure' },
      ],
    },
    {
      id: 'recommendation_reasoning',
      type: 'text',
      label: 'Please explain your recommendation',
      required: false,
      placeholder: 'Provide your reasoning...',
    },
    {
      id: 'additional_feedback',
      type: 'text',
      label: 'Any additional comments or feedback?',
      required: false,
      placeholder: 'Optional additional feedback...',
    },
  ],
};

// ============================================
// HELPER TO GET COUNTS
// ============================================

export function getQuestionnaireStats() {
  return {
    totalSegmentationCases: questionnaireConfig.segmentation_cases.length,
    totalTuringCases: questionnaireConfig.turing_cases.length,
    maxQuestionsPerCase: Math.max(
      ...questionnaireConfig.segmentation_cases.map(c => c.questions.length)
    ),
  };
}
