import QuestionGroup from '@/components/questionnaire/QuestionGroup';
import { questionnaireConfig } from '@/config/questionnaireConfig';
import { AnswerValue } from '@/types/questionnaire';

interface ProfileStepProps {
  answers: Record<string, AnswerValue>;
  onAnswerChange: (key: string, value: AnswerValue) => void;
  onConditionalClear: (key: string) => void;
}

const ProfileStep = ({ answers, onAnswerChange, onConditionalClear }: ProfileStepProps) => {
  // Extract profile answers only
  const profileAnswers: Record<string, AnswerValue> = {};
  Object.entries(answers).forEach(([key, value]) => {
    if (key.startsWith('profile.')) {
      profileAnswers[key.replace('profile.', '')] = value;
    }
  });

  const handleChange = (questionId: string, value: AnswerValue) => {
    onAnswerChange(`profile.${questionId}`, value);
  };

  const handleClear = (questionId: string) => {
    onConditionalClear(`profile.${questionId}`);
  };

  return (
    <div>
      <header className="study-header">
        <h2 className="text-xl font-semibold text-foreground">
          {questionnaireConfig.steps[0].title}
        </h2>
        <p className="text-muted-foreground mt-1">
          {questionnaireConfig.steps[0].description}
        </p>
      </header>

      <div className="question-group">
        <QuestionGroup
          questions={questionnaireConfig.profile_questions}
          answers={profileAnswers}
          onAnswerChange={handleChange}
          onConditionalClear={handleClear}
        />
      </div>
    </div>
  );
};

export default ProfileStep;
