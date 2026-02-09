import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { questionnaireConfig } from '@/config/questionnaireConfig';
import { AnswerValue } from '@/types/questionnaire';

interface TuringStepProps {
  answers: Record<string, AnswerValue>;
  onAnswerChange: (key: string, value: AnswerValue) => void;
}

const TuringStep = ({ answers, onAnswerChange }: TuringStepProps) => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const cases = questionnaireConfig.turing_cases;
  const currentCase = cases[currentCaseIndex];
  const totalCases = cases.length;

  // Get current case answers
  const caseKey = `turing.${currentCase.case_id}`;
  const choiceValue = answers[`${caseKey}.choice`]?.value as string || '';
  const confidenceValue = answers[`${caseKey}.confidence`]?.value as number | null;
  const reasoningValue = answers[`${caseKey}.reasoning`]?.value as string || '';

  // Check if "unsure" requires reasoning
  const showReasoningForUnsure = choiceValue === 'unsure';

  const handleChoiceChange = (value: string) => {
    onAnswerChange(`${caseKey}.choice`, {
      value,
      timestamp: new Date().toISOString(),
    });
  };

  const handleConfidenceChange = (value: number) => {
    onAnswerChange(`${caseKey}.confidence`, {
      value,
      timestamp: new Date().toISOString(),
    });
  };

  const handleReasoningChange = (value: string) => {
    onAnswerChange(`${caseKey}.reasoning`, {
      value,
      timestamp: new Date().toISOString(),
    });
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
          {questionnaireConfig.steps[2].title}
        </h2>
        <p className="text-muted-foreground mt-1">
          For each case, identify which segmentation was created by the AI system. You will evaluate {totalCases} comparisons.
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
            {currentCase.display_name || `Comparison ${currentCaseIndex + 1}`}
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

      {/* Case progress */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {cases.map((c, index) => {
          const hasAnswer = !!answers[`turing.${c.case_id}.choice`]?.value;
          
          return (
            <button
              key={c.case_id}
              onClick={() => setCurrentCaseIndex(index)}
              className={`
                min-w-8 h-8 rounded text-xs font-medium transition-colors
                ${index === currentCaseIndex 
                  ? 'bg-primary text-primary-foreground' 
                  : hasAnswer 
                    ? 'bg-accent text-accent-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }
              `}
              title={c.display_name || `Comparison ${index + 1}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Question */}
      <div className="question-group space-y-6">
        {/* Choice question */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {currentCase.question_text}
            <span className="text-destructive ml-1">*</span>
          </Label>
          
          <RadioGroup
            value={choiceValue}
            onValueChange={handleChoiceChange}
            className="flex flex-col gap-2"
          >
            {currentCase.options.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem 
                  value={option.value} 
                  id={`${currentCase.case_id}-${option.value}`} 
                />
                <Label 
                  htmlFor={`${currentCase.case_id}-${option.value}`}
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Confidence slider */}
        {currentCase.show_confidence_slider && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">
                Confidence in your answer
              </Label>
              <span className="text-sm text-muted-foreground">
                {confidenceValue !== null ? `${confidenceValue}%` : '—'}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={confidenceValue !== null ? [confidenceValue] : [50]}
              onValueChange={(v) => handleConfidenceChange(v[0])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </div>
        )}

        {/* Reasoning - conditional on "unsure" or always shown */}
        {(currentCase.show_reasoning || showReasoningForUnsure) && (
          <div className={showReasoningForUnsure ? 'conditional-question' : ''}>
            <div className="space-y-2">
              <Label htmlFor={`${currentCase.case_id}-reasoning`} className="text-sm font-medium">
                {showReasoningForUnsure 
                  ? 'Please explain why you are unsure'
                  : 'Reasoning (optional)'
                }
                {showReasoningForUnsure && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Textarea
                id={`${currentCase.case_id}-reasoning`}
                value={reasoningValue}
                onChange={(e) => handleReasoningChange(e.target.value)}
                placeholder="Explain your reasoning..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TuringStep;
