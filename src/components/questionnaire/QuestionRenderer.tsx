import { QuestionItem, AnswerValue } from '@/types/questionnaire';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LikertScale from './LikertScale';
import { cn } from '@/lib/utils';

interface QuestionRendererProps {
  question: QuestionItem;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  isConditional?: boolean;
  disabled?: boolean;
}

const QuestionRenderer = ({
  question,
  value,
  onChange,
  isConditional = false,
  disabled = false,
}: QuestionRendererProps) => {
  const currentValue = value?.value ?? null;
  const currentComment = value?.comment ?? '';

  const handleValueChange = (newValue: string | number | boolean | null) => {
    onChange({
      value: newValue,
      comment: currentComment,
      timestamp: new Date().toISOString(),
    });
  };

  const handleCommentChange = (comment: string) => {
    onChange({
      value: currentValue,
      comment,
      timestamp: new Date().toISOString(),
    });
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'likert':
        if (!question.likert_config) return null;
        return (
          <LikertScale
            id={question.id}
            label={question.label}
            description={question.description}
            config={question.likert_config}
            value={currentValue as number | null}
            onChange={(v) => handleValueChange(v)}
            required={question.required}
            disabled={disabled}
          />
        );

      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id} className="text-sm font-medium">
              {question.label}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-xs text-muted-foreground">{question.description}</p>
            )}
            <Textarea
              id={question.id}
              value={(currentValue as string) || ''}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={question.placeholder}
              disabled={disabled}
              rows={3}
              className="resize-none"
            />
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor={question.id} className="text-sm font-medium">
                {question.label}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {question.description && (
                <p className="text-xs text-muted-foreground">{question.description}</p>
              )}
            </div>
            <Switch
              id={question.id}
              checked={(currentValue as boolean) || false}
              onCheckedChange={(checked) => handleValueChange(checked)}
              disabled={disabled}
            />
          </div>
        );

      case 'dropdown':
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id} className="text-sm font-medium">
              {question.label}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-xs text-muted-foreground">{question.description}</p>
            )}
            <Select
              value={(currentValue as string) || ''}
              onValueChange={(v) => handleValueChange(v)}
              disabled={disabled}
            >
              <SelectTrigger id={question.id}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {question.choices?.map((choice) => (
                  <SelectItem key={choice.value} value={choice.value}>
                    {choice.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'choice':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {question.label}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {question.description && (
              <p className="text-xs text-muted-foreground">{question.description}</p>
            )}
            <RadioGroup
              value={(currentValue as string) || ''}
              onValueChange={(v) => handleValueChange(v)}
              disabled={disabled}
              className="flex flex-col gap-2"
            >
              {question.choices?.map((choice) => (
                <div key={choice.value} className="flex items-center gap-2">
                  <RadioGroupItem value={choice.value} id={`${question.id}-${choice.value}`} />
                  <Label 
                    htmlFor={`${question.id}-${choice.value}`}
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    {choice.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'slider':
        if (!question.slider_config) return null;
        const { min, max, step = 1, min_label, max_label } = question.slider_config;
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor={question.id} className="text-sm font-medium">
                {question.label}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {currentValue !== null && (
                <span className="text-sm font-medium text-muted-foreground">
                  {currentValue}
                </span>
              )}
            </div>
            {question.description && (
              <p className="text-xs text-muted-foreground">{question.description}</p>
            )}
            <Slider
              id={question.id}
              min={min}
              max={max}
              step={step}
              value={currentValue !== null ? [currentValue as number] : [Math.round((min + max) / 2)]}
              onValueChange={(v) => handleValueChange(v[0])}
              disabled={disabled}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{min_label || min}</span>
              <span>{max_label || max}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(isConditional && 'conditional-question')}>
      {renderQuestion()}
      
      {/* Optional comment field */}
      {question.allow_comment && (
        <div className="mt-3 space-y-2">
          <Label htmlFor={`${question.id}-comment`} className="text-xs text-muted-foreground">
            {question.comment_label || 'Additional comments (optional)'}
          </Label>
          <Input
            id={`${question.id}-comment`}
            value={currentComment}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder="Enter any additional comments..."
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;
