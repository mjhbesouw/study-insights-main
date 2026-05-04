import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import QuestionGroup from '@/components/questionnaire/QuestionGroup';
import { turingQuestionnaireConfig } from '@/config/turingConfig';
import { AnswerValue } from '@/types/questionnaire';
import { getMissingQuestionsReport, processOfflineQueue } from '@/lib/dataLayerTuring';

interface FeedbackStepProps {
  answers: Record<string, AnswerValue>;
  onAnswerChange: (key: string, value: AnswerValue) => void;
  onConditionalClear: (key: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
}

const FeedbackStep = ({
  answers,
  onAnswerChange,
  onConditionalClear,
  onSubmit,
  isSubmitting,
  disabled
}: FeedbackStepProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const report = getMissingQuestionsReport(answers);

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

  const handleFinalSubmitAttempt = () => {
    if (!report.isComplete) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirm(false);
    // Before calling finalise_submission, flush pending saves and process offline queue
    await processOfflineQueue();
    await onSubmit();
  };

  return (
    <div className="space-y-10">
      <header className="study-header">
        <h2 className="text-xl font-semibold text-foreground">
          {turingQuestionnaireConfig.steps[2]?.title || 'Definitief indienen'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {turingQuestionnaireConfig.steps[2]?.description || 'Deel uw algehele ervaring en eventuele aanbevelingen.'}
        </p>
      </header>

      {!report.isComplete && (
        <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-destructive font-bold">
            <AlertTriangle className="w-5 h-5" />
            <h3>Nog niet alle verplichte onderdelen zijn ingevuld</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {report.profile.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground underline decoration-destructive/30">Algemeen/Profiel</h4>
                <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                  {report.profile.map((label, i) => <li key={i}>{label}</li>)}
                </ul>
              </div>
            )}

            {report.cases.map(c => (
              <div key={c.id} className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground underline decoration-destructive/30">{c.name}</h4>
                <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                  {c.missing.map((label, i) => <li key={i}>{label}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-xs text-destructive mt-2 italic">
            Ga a.u.b. terug naar de betreffende stappen om de ontbrekende informatie aan te vullen.
          </p>
        </div>
      )}

      {report.isComplete && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium">Alle verplichte velden zijn ingevuld. U kunt uw antwoorden nu indienen.</p>
        </div>
      )}

      <div className="question-group">
        <QuestionGroup
          questions={turingQuestionnaireConfig.feedback_questions}
          answers={feedbackAnswers}
          onAnswerChange={handleChange}
          onConditionalClear={handleClear}
          disabled={disabled}
        />
      </div>

      <div className="pt-10 border-t border-border mt-10">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-sm text-muted-foreground max-w-md">
            Door op de onderstaande knop te klikken, worden uw antwoorden definitief ingediend.
            U kunt hierna geen wijzigingen meer aanbrengen.
          </p>
          <Button
            size="lg"
            onClick={handleFinalSubmitAttempt}
            disabled={disabled || isSubmitting || !report.isComplete}
            className={`w-full sm:w-auto min-w-[200px] shadow-lg transition-all ${!report.isComplete ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Bezig met indienen...' : 'Vragenlijst definitief indienen'}
          </Button>
        </div>
      </div>

      {/* Final Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border p-8 rounded-2xl shadow-2xl max-w-xl w-full animate-in zoom-in duration-300">
            <h3 className="text-xl font-bold mb-4">Weet u zeker dat u klaar bent?</h3>
            <p className="text-muted-foreground mb-8">
              Controleer of u alle vragen naar tevredenheid heeft beantwoord. Na bevestiging kunt u uw antwoorden niet meer wijzigen.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="h-12"
              >
                Nee, ik wil nog iets controleren
              </Button>
              <Button
                variant="default"
                onClick={handleConfirmedSubmit}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground h-12 shadow-lg"
              >
                {isSubmitting ? 'Indienen...' : 'Ja, definitief indienen'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackStep;
