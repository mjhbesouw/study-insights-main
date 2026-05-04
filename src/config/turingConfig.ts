import { PatientConfig, QuestionItem, QuestionnaireConfig } from '@/types/questionnaire';
import { questionnaireConfig } from './questionnaireConfig';

const generateTuringPatients = (): PatientConfig[] => {
  // Mapping from Turing patient number (1-21) to Scoring patient_id
  const turingToScoringMap: Record<number, string> = {
    1: 'patient_14',
    2: 'patient_11', //doesnt work 
    3: 'patient_01',
    4: 'patient_08',
    5: 'patient_21',
    6: 'patient_09',
    7: 'patient_19',
    8: 'patient_22',
    9: 'patient_18',
    10: 'patient_03',
    11: 'patient_17',
    12: 'patient_04',
    13: 'patient_20',
    14: 'patient_13',
    15: 'patient_10',
    16: 'patient_05',
    17: 'patient_02',
    18: 'patient_15',
    19: 'patient_12',
    20: 'patient_07',
    21: 'patient_06'
  };

  const turingPatients: PatientConfig[] = [];

  for (let i = 1; i <= 21; i++) {
    const scoringPatientId = turingToScoringMap[i];
    const sourcePatient = questionnaireConfig.segmentation_patients.find(p => p.patient_id === scoringPatientId);

    if (!sourcePatient) {
      console.warn(`Could not find source scoring patient ${scoringPatientId} for Turing patient ${i}`);
      continue;
    }

    const newPatientId = `patient_${i.toString().padStart(2, '0')}`;
    const newDisplayName = `Patient ${i.toString().padStart(2, '0')} T`;

    // Extract all structures from variant A of the mapped scoring patient
    const variantA = sourcePatient.variants.find(v => v.variant_id === 'A');
    const structures: string[] = [];

    if (variantA) {
      variantA.questions.forEach(q => {
        if (q.type === 'choice' && q.label.includes('<p>')) {
          const match = q.label.match(/<p>(.+?)_[AB]<\/p>/);
          if (match && match[1]) {
            structures.push(match[1]);
          } else {
            const rawMatch = q.label.match(/<p>(.+?)<\/p>/);
            if (rawMatch && rawMatch[1]) {
              structures.push(rawMatch[1].replace(/_[AB]$/, ''));
            }
          }
        }
      });
    }

    // Deduplicate structures
    const uniqueStructures = Array.from(new Set(structures));

    const questions: QuestionItem[] = [
      {
        id: 'AI_SELECTION',
        type: 'choice',
        label: 'Welke set is gegenereerd door AI?',
        required: true,
        choices: [
          { value: 'A', label: 'Set A is DLS' },
          { value: 'B', label: 'Set B is DLS' },
        ],
      },
      {
        id: 'STRUCTURES',
        type: 'checkbox',
        label: 'Op basis van welke structuren heeft u deze keuze gemaakt? (Meerdere antwoorden mogelijk)',
        required: true,
        choices: uniqueStructures.map(s => ({ value: s, label: s })),
        // Optional: show only if they selected something
        // show_if: { source_question_id: 'AI_SELECTION', operator: 'not_equals', value: '' }
      },
      {
        id: 'COMMENT',
        type: 'text',
        label: 'Toelichting / Vrije opmerkingen (optioneel)',
        required: false,
        placeholder: 'Typ hier uw opmerkingen...',
      }
    ];

    turingPatients.push({
      patient_id: newPatientId,
      display_name: newDisplayName,
      variants: [
        {
          variant_id: 'TURING',
          case_id: `${newPatientId}_turing`,
          display_name: 'Turing Test',
          questions: questions,
        }
      ]
    });
  }

  return turingPatients;
};

export const turingQuestionnaireConfig: QuestionnaireConfig = {
  ...questionnaireConfig,
  profile_questions: [],
  steps: [
    { id: 'turing', title: 'Turing Test', description: 'Beoordeel welke set AI is' },
    { id: 'feedback', title: 'Definitief indienen', description: 'Algehele ervaring en feedback' },
  ],
  segmentation_patients: generateTuringPatients()
};
