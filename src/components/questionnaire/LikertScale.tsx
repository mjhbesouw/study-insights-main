import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { LikertConfig } from '@/types/questionnaire';

interface LikertScaleProps {
  id: string;
  label: string;
  description?: string;
  config: LikertConfig;
  value: number | null;
  onChange: (value: number) => void;
  required?: boolean;
  disabled?: boolean;
}

const LikertScale = ({
  id,
  label,
  description,
  config,
  value,
  onChange,
  required,
  disabled,
}: LikertScaleProps) => {
  const { min, max, min_label, max_label, labels } = config;
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {/* Scale buttons */}
        <div className="flex gap-1 sm:gap-2" role="radiogroup" aria-labelledby={id}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={value === option}
              disabled={disabled}
              onClick={() => onChange(option)}
              className={cn(
                'flex-1 py-2 px-1 sm:px-3 text-sm font-medium rounded border transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                value === option
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:bg-accent hover:border-accent-foreground/20',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Min/max labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{min_label || `${min}`}</span>
          <span>{max_label || `${max}`}</span>
        </div>

        {/* Optional value labels */}
        {labels && value !== null && labels[value] && (
          <p className="text-xs text-center text-muted-foreground">
            {labels[value]}
          </p>
        )}
      </div>
    </div>
  );
};

export default LikertScale;
