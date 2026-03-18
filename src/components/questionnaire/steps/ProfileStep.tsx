import { useState } from 'react';
import QuestionGroup from '@/components/questionnaire/QuestionGroup';
import { questionnaireConfig } from '@/config/questionnaireConfig';
import { AnswerValue } from '@/types/questionnaire';
import { Button } from '@/components/ui/button';
import { isProfileComplete } from '@/lib/dataLayer';

interface ProfileStepProps {
  answers: Record<string, AnswerValue>;
  onAnswerChange: (key: string, value: AnswerValue) => void;
  onConditionalClear: (key: string) => void;
  onNext?: () => void;
  disabled?: boolean;
}

const ProfileStep = ({ answers, onAnswerChange, onConditionalClear, onNext, disabled }: ProfileStepProps) => {
  const [showErrors, setShowErrors] = useState(false);
  // Extract profile answers only
  const profileAnswers: Record<string, AnswerValue> = {};
  Object.entries(answers).forEach(([key, value]) => {
    if (key.startsWith('profile.')) {
      profileAnswers[key.replace('profile.', '')] = value;
    }
  });

  const handleChange = (questionId: string, value: AnswerValue) => {
    setShowErrors(false);
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
        {localStorage.getItem('user_email') && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md border border-border inline-flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ingelogd als:</span>
            <span className="text-sm font-medium text-foreground">{localStorage.getItem('user_email')}</span>
          </div>
        )}
      </header>

      <div className="question-group">
        <QuestionGroup
          questions={questionnaireConfig.profile_questions}
          answers={profileAnswers}
          onAnswerChange={handleChange}
          onConditionalClear={handleClear}
          disabled={disabled}
          showErrors={showErrors}
        />
      </div>

      <div className="flex justify-end mt-10">
        <Button
          onClick={() => {
            if (!isProfileComplete(answers)) {
              setShowErrors(true);
            }
            onNext?.();
          }}
          className="min-w-[140px]"
        >
          Start beoordeling
        </Button>
      </div>
    </div>
  );
};

export default ProfileStep;
