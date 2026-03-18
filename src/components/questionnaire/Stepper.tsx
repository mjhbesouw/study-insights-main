import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps {
  steps: { id: string; title: string }[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
  disabled?: boolean;
}

const Stepper = ({ steps, currentStep, onStepClick, className, disabled }: StepperProps) => {
  return (
    <nav className={cn('w-full', className)} aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;
          const isClickable = onStepClick && !disabled;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center flex-1 last:flex-none transition-all",
                isClickable && "cursor-pointer group"
              )}
              onClick={() => isClickable && onStepClick(index)}
            >
              <div className="flex flex-col items-center">
                {/* Step indicator */}
                <div
                  className={cn(
                    'stepper-step-indicator transition-transform duration-200',
                    isCompleted && 'stepper-step-indicator--completed',
                    isCurrent && 'stepper-step-indicator--active',
                    isPending && 'stepper-step-indicator--pending',
                    isClickable && 'group-hover:scale-110'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step title - hide on mobile */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium hidden sm:block transition-colors',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                    isClickable && 'group-hover:text-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'stepper-connector flex-1 mx-2 sm:mx-4',
                    isCompleted && 'stepper-connector--completed'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
