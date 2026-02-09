import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Stepper from '@/components/questionnaire/Stepper';
import ProfileStep from '@/components/questionnaire/steps/ProfileStep';
import SegmentationStep from '@/components/questionnaire/steps/SegmentationStep';
import TuringStep from '@/components/questionnaire/steps/TuringStep';
import FeedbackStep from '@/components/questionnaire/steps/FeedbackStep';
import { questionnaireConfig } from '@/config/questionnaireConfig';
import { 
  getOrCreateSession, 
  updateSession, 
  getStoredAnswers,
  upsertAnswer,
  deleteAnswer,
  submitFinal,
  createParticipantSession,
} from '@/lib/dataLayer';
import { AnswerValue } from '@/types/questionnaire';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';

const AUTOSAVE_DELAY = 1500; // 1.5 seconds

const Questionnaire = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load session and answers on mount
  useEffect(() => {
    const session = getOrCreateSession();
    
    // Check if consent was given
    if (!session.consent_given) {
      navigate('/consent');
      return;
    }

    setCurrentStep(session.current_step > 0 ? session.current_step - 1 : 0);
    setAnswers(getStoredAnswers());
  }, [navigate]);

  // Autosave function
  const performAutosave = useCallback(async (key: string, value: AnswerValue) => {
    const parts = key.split('.');
    let step: string;
    let caseId: string | null = null;
    let itemId: string;

    if (parts.length === 3) {
      [step, caseId, itemId] = parts;
    } else {
      [step, itemId] = parts;
    }

    setIsSaving(true);
    try {
      await upsertAnswer(step, caseId, itemId, value);
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Debounced autosave
  const debouncedSave = useDebounce(performAutosave, AUTOSAVE_DELAY);

  // Handle answer change
  const handleAnswerChange = useCallback((key: string, value: AnswerValue) => {
    setAnswers(prev => {
      const updated = { ...prev, [key]: value };
      return updated;
    });
    debouncedSave(key, value);
  }, [debouncedSave]);

  // Handle conditional question clear
  const handleConditionalClear = useCallback(async (key: string) => {
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });

    const parts = key.split('.');
    let step: string;
    let caseId: string | null = null;
    let itemId: string;

    if (parts.length === 3) {
      [step, caseId, itemId] = parts;
    } else {
      [step, itemId] = parts;
    }

    await deleteAnswer(step, caseId, itemId);
  }, []);

  // Navigation
  const handleNext = async () => {
    // Flush any pending saves
    debouncedSave.flush();

    if (currentStep === 0) {
      // Save profile to Supabase
      const role = answers['profile.role']?.value as string || '';
      const experience = answers['profile.experience']?.value as string || '';
      const familiarity = answers['profile.familiarity']?.value as number || 0;
      
      const storedConsent = localStorage.getItem('dls_study_consent');
      const consent = storedConsent ? JSON.parse(storedConsent) : {};
      
      await createParticipantSession(role, experience, familiarity, consent.center || '');
    }

    if (currentStep < questionnaireConfig.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      updateSession({ current_step: nextStep + 1 });
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    debouncedSave.flush();
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      updateSession({ current_step: prevStep + 1 });
      window.scrollTo(0, 0);
    }
  };

  const handleSaveAndExit = () => {
    debouncedSave.flush();
    toast({
      title: 'Progress saved',
      description: 'You can return anytime to continue where you left off.',
    });
    navigate('/');
  };

  const handleSubmit = async () => {
    debouncedSave.flush();
    setIsSubmitting(true);

    try {
      const completionCode = await submitFinal();
      navigate('/thank-you', { state: { completionCode } });
    } catch (error) {
      console.error('Submission failed:', error);
      toast({
        title: 'Submission failed',
        description: 'Please try again. Your answers are saved.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProfileStep
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onConditionalClear={handleConditionalClear}
          />
        );
      case 1:
        return (
          <SegmentationStep
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onConditionalClear={handleConditionalClear}
          />
        );
      case 2:
        return (
          <TuringStep
            answers={answers}
            onAnswerChange={handleAnswerChange}
          />
        );
      case 3:
        return (
          <FeedbackStep
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onConditionalClear={handleConditionalClear}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = currentStep === questionnaireConfig.steps.length - 1;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="study-container">
          {/* Stepper */}
          <div className="mb-8">
            <Stepper
              steps={questionnaireConfig.steps}
              currentStep={currentStep}
            />
          </div>

          {/* Autosave indicator */}
          <div className="flex items-center justify-end mb-4 h-6">
            {isSaving ? (
              <span className="text-xs text-muted-foreground">Saving...</span>
            ) : lastSaved ? (
              <span className="text-xs text-muted-foreground">
                Saved {new Date(lastSaved).toLocaleTimeString()}
              </span>
            ) : null}
          </div>

          {/* Step content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSaveAndExit}
                >
                  Save and exit
                </Button>
              </div>

              {isLastStep ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit questionnaire'}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </div>

          {/* Privacy note */}
          <div className="privacy-note">
            <p>
              No patient data is displayed in this questionnaire. All case identifiers are pseudonymous.
              Your responses are stored securely and will be analyzed in anonymized form only.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Questionnaire;
