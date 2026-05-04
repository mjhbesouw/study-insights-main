import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import Stepper from '@/components/questionnaire/Stepper';
import SegmentationStep from '@/components/questionnaire/turing-steps/SegmentationStep';
import FeedbackStep from '@/components/questionnaire/turing-steps/FeedbackStep';
import { turingQuestionnaireConfig } from '@/config/turingConfig';
import {
  getOrCreateSession,
  updateSession,
  getStoredAnswers,
  upsertAnswer,
  hideAnswer,
  finaliseSubmission,
  processOfflineQueue,
  fetchSessionFromSupabase,
  fetchAnswersFromSupabase,
  saveSurveyProgress,
} from '@/lib/dataLayerTuring';
import { AnswerValue } from '@/types/questionnaire';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';

const AUTOSAVE_DELAY = 1500; // 1.5 seconds

const TuringQuestionnaire = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isSaveExitDialogOpen, setIsSaveExitDialogOpen] = useState(false);

  // Keep refs of latest state to avoid stale closures in our central save function
  const latestAnswersRef = useRef(answers);
  const latestStepRef = useRef(currentStep);
  const latestCaseIndexRef = useRef(currentCaseIndex);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    latestAnswersRef.current = answers;
    latestStepRef.current = currentStep;
    latestCaseIndexRef.current = currentCaseIndex;
  }, [answers, currentStep, currentCaseIndex]);

  // Load session and answers on mount
  useEffect(() => {
    async function initSession() {
      const storedSessionId = localStorage.getItem('session_id');
      if (storedSessionId) {
        // Sync from Supabase first - Supabase wins
        await fetchSessionFromSupabase(storedSessionId);
        await fetchAnswersFromSupabase();
      }

      // getOrCreateSession now returns the synced meta
      const session = getOrCreateSession();

      if (session.is_submitted) {
        setIsReadOnly(true);
      }

      const loadedAnswers = getStoredAnswers();
      const hasAnswers = Object.keys(loadedAnswers).some(k => k.startsWith('segmentation.') || k.startsWith('profile.'));

      // For brand-new users with no answers, always start at step 0 (segmentation)
      let startStep = 0;
      if (hasAnswers && session.current_step > 0) {
        startStep = session.current_step - 1; // Supabase stores 1-indexed
      }
      setCurrentStep(startStep);

      // WelcomeBack resume hint
      const resumeIndex = localStorage.getItem('resume_case_index');
      if (resumeIndex !== null) {
        const idx = parseInt(resumeIndex, 10);
        setCurrentCaseIndex(idx);
        updateSession({ current_case_index: idx }); // Sync back
        localStorage.removeItem('resume_case_index');
      } else {
        setCurrentCaseIndex(session.current_case_index || 0);
      }

      setAnswers(loadedAnswers);
      window.scrollTo(0, 0);
    }

    initSession();
  }, []);

  // Central save function that pushes the whole state precisely once
  const performSave = useCallback(async () => {
    if (isReadOnly) return;

    setIsSaving(true);
    try {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) return;

      const success = await saveSurveyProgress(
        sessionId,
        latestAnswersRef.current,
        latestStepRef.current,
        latestCaseIndexRef.current
      );

      if (success) {
        setLastSaved(new Date().toISOString());
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isReadOnly]);

  // Wrapper to trigger save explicitly and await it (e.g. for navigation)
  const syncAndSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await performSave();
  };

  // Debounced wrapper that doesn't drop changes, it just delays the bulk save
  const triggerAutosave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, AUTOSAVE_DELAY);
  }, [performSave]);

  const handleAnswerChange = useCallback((key: string, value: AnswerValue) => {
    if (isReadOnly) return;
    setAnswers(prev => ({ ...prev, [key]: value }));
    triggerAutosave();
  }, [triggerAutosave, isReadOnly]);

  const handleConditionalClear = useCallback(async (key: string) => {
    if (isReadOnly) return;
    // Visually delete it from UI
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });

    // We explicitly still call hideAnswer so it's handled in local storage, but 
    // we DON'T trigger autosave here because we don't want to sync empty values to DB anymore.
    const parts = key.split('.');
    let step = parts[0];
    let caseId = parts.length === 3 ? parts[1] : null;
    let itemId = parts.length === 3 ? parts[2] : parts[1];
    await hideAnswer(step, caseId, itemId);
  }, [isReadOnly]);

  const handleCaseChange = async (index: number) => {
    // 1. Flush any pending saves for the current case securely
    await syncAndSave();

    // 2. Update state immediately for UI responsiveness
    setCurrentCaseIndex(index);
    updateSession({ current_case_index: index });
    window.scrollTo(0, 0);

    // 3. Re-hydrate answers from Supabase to ensure "Source of Truth" persistence
    const storedSessionId = localStorage.getItem('session_id');
    if (storedSessionId) {
      const latestAnswers = await fetchAnswersFromSupabase();
      setAnswers(latestAnswers);
    }
  };

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex === currentStep) return;

    await syncAndSave();

    setCurrentStep(stepIndex);
    updateSession({ current_step: stepIndex + 1 });
    window.scrollTo(0, 0);
  };

  const handleSaveAndExit = async () => {
    // We DO NOT just open the dialog anymore, we actually save first
    setIsSaving(true);
    await syncAndSave();
    setIsSaving(false);
    setIsSaveExitDialogOpen(true);
  };

  const confirmSaveAndExit = async () => {
    // Process queue before leaving if possible
    await processOfflineQueue();
    navigate('/');
  };

  const handleSubmit = async () => {
    await syncAndSave();
    setIsSubmitting(true);
    try {
      // Ensure all pending changes are sent to server
      await processOfflineQueue();

      const success = await finaliseSubmission();
      if (success) {
        setIsReadOnly(true);
        toast({
          title: 'Inzending voltooid',
          description: 'Uw antwoorden zijn definitief ingediend.',
        });
        navigate('/thank-you');
      }
    } catch (error: any) {
      console.error('Submission failed:', error);
      toast({
        title: 'Inzending mislukt',
        description: error.message === "already_submitted" ? 'Deze vragenlijst was al ingediend.' : 'Er is een fout opgetreden.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <SegmentationStep
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onConditionalClear={handleConditionalClear}
            currentCaseIndex={currentCaseIndex}
            onCaseChange={handleCaseChange}
            onGoToFinal={() => handleStepClick(1)}
            disabled={isReadOnly}
          />
        );
      case 1:
        return (
          <FeedbackStep
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onConditionalClear={handleConditionalClear}
            disabled={isReadOnly}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pb-20">
        <div className="study-container py-8">
          <header className="mb-10">
            <Stepper
              steps={turingQuestionnaireConfig.steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              disabled={isReadOnly}
            />
          </header>

          {isReadOnly && (
            <Alert className="mb-8 border-amber-200 bg-amber-50 text-amber-900 shadow-sm">
              <Lock className="h-5 w-5 text-amber-600" />
              <AlertDescription className="ml-2 font-semibold">
                Deze vragenlijst is definitief ingediend. Wijzigingen zijn niet meer mogelijk.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between mb-6 h-6 px-1">
            <div className="flex gap-4">
              {!isReadOnly && (
                <Button variant="ghost" size="sm" onClick={handleSaveAndExit} className="text-muted-foreground hover:text-foreground">
                  Opslaan en afsluiten
                </Button>
              )}
            </div>
            {!isReadOnly && (
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <span className="text-xs text-muted-foreground animate-pulse">Synchroniseren...</span>
                ) : lastSaved ? (
                  <span className="text-xs text-muted-foreground opacity-60">
                    Laatst bewaard: {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm p-6 sm:p-10">
            {renderStep()}
          </div>
        </div>
      </main>

      {/* Save & Exit Dialog */}
      {isSaveExitDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border p-6 rounded-xl shadow-lg max-w-xl w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold mb-2">Opslaan en afsluiten?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Nog niet klaar maar wil je later verdergaan? Je voortgang is opgeslagen.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSaveExitDialogOpen(false)}>Annuleren</Button>
              <Button variant="default" onClick={confirmSaveAndExit}>Bevestigen en afsluiten</Button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default TuringQuestionnaire;
