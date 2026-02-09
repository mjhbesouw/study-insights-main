import QuestionGroup from '@/components/questionnaire/QuestionGroup';
import { questionnaireConfig } from '@/config/questionnaireConfig';
import { AnswerValue } from '@/types/questionnaire';

interface FeedbackStepProps {
  answers: Record<string, AnswerValue>;
  onAnswerChange: (key: string, value: AnswerValue) => void;
  onConditionalClear: (key: string) => void;
}

const FeedbackStep = ({ answers, onAnswerChange, onConditionalClear }: FeedbackStepProps) => {
  // Extract feedback answers
  const feedbackAnswers: Record<string, AnswerValue> = {};
  Object.entries(answers).forEach(([key, value]) => {
    if (key.startsWith('feedback.')) {
      feedbackAnswers[key.replace('feedback.', '')] = value;
    }
  });

  const handleChange = (questionId: string, value: AnswerValue) => {
    onAnswerChange(`feedback.${questionId}`, value);
  };

  const handleClear = (questionId: string) => {
    onConditionalClear(`feedback.${questionId}`);
  };

  return (
    <div>
      <header className="study-header">
        <h2 className="text-xl font-semibold text-foreground">
          {questionnaireConfig.steps[3].title}
        </h2>
        <p className="text-muted-foreground mt-1">
          Please share your overall experience and any recommendations.
        </p>
      </header>

      <div className="question-group">
        <QuestionGroup
          questions={questionnaireConfig.feedback_questions}
          answers={feedbackAnswers}
          onAnswerChange={handleChange}
          onConditionalClear={handleClear}
        />
      </div>

      {/* Final confirmation note */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Important:</strong> After clicking "Submit questionnaire", your responses will 
          be finalized and you will receive a completion code. Please ensure you have completed 
          all sections before submitting.
        </p>
      </div>
    </div>
  );
};

export default FeedbackStep;
