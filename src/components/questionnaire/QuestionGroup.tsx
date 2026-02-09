import { useMemo, useCallback } from 'react';
import { QuestionItem, AnswerValue } from '@/types/questionnaire';
import { isQuestionVisible } from '@/lib/conditionEvaluator';
import QuestionRenderer from './QuestionRenderer';

interface QuestionGroupProps {
  questions: QuestionItem[];
  answers: Record<string, AnswerValue>;
  onAnswerChange: (questionId: string, value: AnswerValue) => void;
  onConditionalClear?: (questionId: string) => void;
  disabled?: boolean;
}

const QuestionGroup = ({
  questions,
  answers,
  onAnswerChange,
  onConditionalClear,
  disabled = false,
}: QuestionGroupProps) => {
  // Calculate visible questions
  const visibleQuestions = useMemo(() => {
    return questions.filter((q) => isQuestionVisible(q.show_if, answers));
  }, [questions, answers]);

  // Track which questions are conditional (have show_if)
  const conditionalQuestionIds = useMemo(() => {
    return new Set(questions.filter((q) => q.show_if).map((q) => q.id));
  }, [questions]);

  // Handle answer change and check for conditional questions that need clearing
  const handleAnswerChange = useCallback(
    (questionId: string, value: AnswerValue) => {
      // First update the answer
      onAnswerChange(questionId, value);

      // Check if any conditional questions depend on this question
      // and are now hidden - if so, clear them
      const dependentQuestions = questions.filter(
        (q) => q.show_if?.source_question_id === questionId
      );

      // Create a temporary answers object with the new value
      const tempAnswers = { ...answers, [questionId]: value };

      for (const depQ of dependentQuestions) {
        if (!isQuestionVisible(depQ.show_if, tempAnswers)) {
          // Question is now hidden, clear its value
          onConditionalClear?.(depQ.id);
        }
      }
    },
    [questions, answers, onAnswerChange, onConditionalClear]
  );

  return (
    <div className="space-y-6">
      {visibleQuestions.map((question) => (
        <QuestionRenderer
          key={question.id}
          question={question}
          value={answers[question.id]}
          onChange={(value) => handleAnswerChange(question.id, value)}
          isConditional={conditionalQuestionIds.has(question.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default QuestionGroup;
