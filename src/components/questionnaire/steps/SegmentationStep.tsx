import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import QuestionGroup from '@/components/questionnaire/QuestionGroup';
import { questionnaireConfig } from '@/config/questionnaireConfig';
import { AnswerValue } from '@/types/questionnaire';

interface SegmentationStepProps {
  answers: Record<string, AnswerValue>;
  onAnswerChange: (key: string, value: AnswerValue) => void;
  onConditionalClear: (key: string) => void;
}

const SegmentationStep = ({ answers, onAnswerChange, onConditionalClear }: SegmentationStepProps) => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const cases = questionnaireConfig.segmentation_cases;
  const currentCase = cases[currentCaseIndex];
  const totalCases = cases.length;

  // Extract answers for current case
  const caseAnswers = useMemo(() => {
    const filtered: Record<string, AnswerValue> = {};
    const prefix = `segmentation.${currentCase.case_id}.`;
    
    Object.entries(answers).forEach(([key, value]) => {
      if (key.startsWith(prefix)) {
        filtered[key.replace(prefix, '')] = value;
      }
    });
    
    return filtered;
  }, [answers, currentCase.case_id]);

  const handleChange = (questionId: string, value: AnswerValue) => {
    onAnswerChange(`segmentation.${currentCase.case_id}.${questionId}`, value);
  };

  const handleClear = (questionId: string) => {
    onConditionalClear(`segmentation.${currentCase.case_id}.${questionId}`);
  };

  const handlePrevCase = () => {
    if (currentCaseIndex > 0) {
      setCurrentCaseIndex(currentCaseIndex - 1);
    }
  };

  const handleNextCase = () => {
    if (currentCaseIndex < totalCases - 1) {
      setCurrentCaseIndex(currentCaseIndex + 1);
    }
  };

  return (
    <div>
      <header className="study-header">
        <h2 className="text-xl font-semibold text-foreground">
          {questionnaireConfig.steps[1].title}
        </h2>
        <p className="text-muted-foreground mt-1">
          Rate the quality of AI-generated segmentations for each case. You will evaluate {totalCases} cases total.
        </p>
      </header>

      {/* Case navigation */}
      <div className="flex items-center justify-between mb-6 p-4 bg-secondary rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevCase}
          disabled={currentCaseIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="text-center">
          <span className="text-sm font-medium text-foreground">
            {currentCase.display_name || `Case ${currentCaseIndex + 1}`}
          </span>
          <p className="text-xs text-muted-foreground">
            {currentCaseIndex + 1} of {totalCases}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextCase}
          disabled={currentCaseIndex === totalCases - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Case progress indicator */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {cases.map((c, index) => {
          // Check if case has any answers
          const casePrefix = `segmentation.${c.case_id}.`;
          const hasAnswers = Object.keys(answers).some(k => k.startsWith(casePrefix));
          
          return (
            <button
              key={c.case_id}
              onClick={() => setCurrentCaseIndex(index)}
              className={`
                min-w-8 h-8 rounded text-xs font-medium transition-colors
                ${index === currentCaseIndex 
                  ? 'bg-primary text-primary-foreground' 
                  : hasAnswers 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }
              `}
              title={c.display_name || `Case ${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Case description */}
      {currentCase.description && (
        <p className="text-sm text-muted-foreground mb-6 p-3 bg-muted rounded">
          {currentCase.description}
        </p>
      )}

      {/* Questions */}
      <div className="question-group">
        <QuestionGroup
          questions={currentCase.questions}
          answers={caseAnswers}
          onAnswerChange={handleChange}
          onConditionalClear={handleClear}
        />
      </div>
    </div>
  );
};

export default SegmentationStep;
