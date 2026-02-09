import { Condition, ConditionOperator, AnswerValue } from '@/types/questionnaire';

/**
 * Evaluates a single condition against an answer value
 */
function evaluateCondition(
  condition: Condition,
  answerValue: AnswerValue | undefined
): boolean {
  if (!answerValue || answerValue.value === null || answerValue.value === undefined) {
    return false;
  }

  const { operator, value, values } = condition;
  const answer = answerValue.value;

  switch (operator) {
    case 'equals':
      return answer === value;

    case 'not_equals':
      return answer !== value;

    case 'lt':
      return typeof answer === 'number' && typeof value === 'number' && answer < value;

    case 'lte':
      return typeof answer === 'number' && typeof value === 'number' && answer <= value;

    case 'gt':
      return typeof answer === 'number' && typeof value === 'number' && answer > value;

    case 'gte':
      return typeof answer === 'number' && typeof value === 'number' && answer >= value;

    case 'includes':
      if (values && Array.isArray(values)) {
        return values.includes(answer);
      }
      return false;

    default:
      return false;
  }
}

/**
 * Checks if a question should be visible based on its condition
 * 
 * @param condition - The show_if condition from the question
 * @param answers - Record of question_id to AnswerValue
 * @returns boolean - Whether the question should be shown
 */
export function isQuestionVisible(
  condition: Condition | undefined,
  answers: Record<string, AnswerValue>
): boolean {
  // No condition means always visible
  if (!condition) {
    return true;
  }

  const sourceAnswer = answers[condition.source_question_id];
  return evaluateCondition(condition, sourceAnswer);
}

/**
 * Filters answers to only include visible questions
 * This should be called before saving to remove answers for hidden questions
 */
export function filterVisibleAnswers(
  answers: Record<string, AnswerValue>,
  questions: { id: string; show_if?: Condition }[]
): Record<string, AnswerValue> {
  const filtered: Record<string, AnswerValue> = {};

  for (const question of questions) {
    if (isQuestionVisible(question.show_if, answers) && answers[question.id]) {
      filtered[question.id] = answers[question.id];
    }
  }

  return filtered;
}

/**
 * Gets all question IDs that should be hidden based on current answers
 */
export function getHiddenQuestionIds(
  questions: { id: string; show_if?: Condition }[],
  answers: Record<string, AnswerValue>
): string[] {
  return questions
    .filter(q => !isQuestionVisible(q.show_if, answers))
    .map(q => q.id);
}
