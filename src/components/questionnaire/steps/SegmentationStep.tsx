import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2, LayoutGrid } from 'lucide-react';
import QuestionGroup from '@/components/questionnaire/QuestionGroup';
import { questionnaireConfig } from '@/config/questionnaireConfig';
import { AnswerValue } from '@/types/questionnaire';
import { isPatientComplete } from '@/lib/dataLayer';

interface SegmentationStepProps {
  answers: Record<string, AnswerValue>;
  onAnswerChange: (key: string, value: AnswerValue) => void;
  onConditionalClear: (key: string) => void;
  currentCaseIndex: number;
  onCaseChange: (index: number) => void;
  onGoToFinal?: () => void;
  disabled?: boolean;
}

type ViewMode = 'overview' | 'detail';

const SegmentationStep = ({
  answers,
  onAnswerChange,
  onConditionalClear,
  currentCaseIndex,
  onCaseChange,
  onGoToFinal,
  disabled
}: SegmentationStepProps) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [activeTab, setActiveTab] = useState<string>('A');

  const patients = questionnaireConfig.segmentation_patients;
  const currentPatient = patients[currentCaseIndex];
  const totalPatients = patients.length;

  const currentVariantIndex = currentPatient.variants.findIndex(v => v.variant_id === activeTab);
  const activeVariant = currentVariantIndex >= 0 ? currentPatient.variants[currentVariantIndex] : currentPatient.variants[0];

  // If activeTab is somehow invalid, reset it
  useEffect(() => {
    if (viewMode === 'detail' && currentVariantIndex === -1) {
      setActiveTab(currentPatient.variants[0].variant_id);
      setShowErrors(false);
    }
  }, [currentPatient, activeTab, viewMode, currentVariantIndex]);

  // Extract answers for current variant
  const caseAnswers = useMemo(() => {
    const filtered: Record<string, AnswerValue> = {};
    const prefix = `segmentation.${activeVariant.case_id}.`;

    Object.entries(answers).forEach(([key, value]) => {
      if (key.startsWith(prefix)) {
        filtered[key.replace(prefix, '')] = value;
      }
    });

    return filtered;
  }, [answers, activeVariant.case_id]);

  const handleChange = (questionId: string, value: AnswerValue) => {
    setErrorMsg(null);
    setShowErrors(false);
    onAnswerChange(`segmentation.${activeVariant.case_id}.${questionId}`, value);
  };

  const handleClear = (questionId: string) => {
    onConditionalClear(`segmentation.${activeVariant.case_id}.${questionId}`);
  };

  const handlePatientClick = (index: number) => {
    onCaseChange(index);
    setViewMode('detail');

    const patientSelected = patients[index];
    const firstIncomplete = patientSelected.variants.find(v => !isPatientComplete(v.case_id, answers));

    if (firstIncomplete) {
      setActiveTab(firstIncomplete.variant_id);
    } else {
      setActiveTab(patientSelected.variants[0].variant_id);
    }

    setShowErrors(false);
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setErrorMsg(null);
    if (currentVariantIndex > 0) {
      setActiveTab(currentPatient.variants[currentVariantIndex - 1].variant_id);
      setShowErrors(false);
      window.scrollTo(0, 0);
    } else if (currentCaseIndex > 0) {
      onCaseChange(currentCaseIndex - 1);
      const prevPatient = patients[currentCaseIndex - 1];
      setActiveTab(prevPatient.variants[prevPatient.variants.length - 1].variant_id);
      window.scrollTo(0, 0);
    } else {
      setViewMode('overview');
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (!isPatientComplete(activeVariant.case_id, answers)) {
      setErrorMsg("Niet alle verplichte vragen voor deze set zijn ingevuld.");
      setShowErrors(true);
      return;
    }
    setErrorMsg(null);
    setShowErrors(false);

    if (currentVariantIndex < currentPatient.variants.length - 1) {
      setActiveTab(currentPatient.variants[currentVariantIndex + 1].variant_id);
      window.scrollTo(0, 0);
    } else if (currentCaseIndex < totalPatients - 1) {
      onCaseChange(currentCaseIndex + 1);
      setActiveTab(patients[currentCaseIndex + 1].variants[0].variant_id);
      window.scrollTo(0, 0);
    } else {
      const allPatientsComplete = patients.every(p => p.variants.every(v => isPatientComplete(v.case_id, answers)));

      if (allPatientsComplete) {
        onGoToFinal?.();
      } else {
        setViewMode('overview');
        window.scrollTo(0, 0);
      }
    }
  };

  if (viewMode === 'overview') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <header className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-primary" />
            Patiënten Overzicht
          </h2>
          <p className="text-muted-foreground mt-2">
            Selecteer een patiënt om de segmentaties te beoordelen. Elke patiënt bevat meerdere segmentatie sets (A/B).
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map((p, index) => {
            const allComplete = p.variants.every(v => isPatientComplete(v.case_id, answers));
            const variantsStatus = p.variants.map(v => ({
              id: v.variant_id,
              complete: isPatientComplete(v.case_id, answers)
            }));

            return (
              <div
                key={p.patient_id}
                onClick={() => handlePatientClick(index)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md group ${allComplete
                  ? 'bg-green-50/30 border-green-200 hover:border-green-300'
                  : index === currentCaseIndex
                    ? 'bg-primary/5 border-primary/30 hover:border-primary/50'
                    : 'bg-card border-border hover:border-border/80'
                  }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {p.display_name}
                  </h3>
                  {allComplete && <CheckCircle2 className="w-5 h-5 text-green-600 fill-white" />}
                </div>

                <div className="flex gap-2">
                  {variantsStatus.map(v => (
                    <span
                      key={v.id}
                      className={`text-xs px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-1.5 ${v.complete
                        ? 'bg-green-100/50 text-green-700 border-green-200 font-medium'
                        : 'bg-background text-muted-foreground border-border'
                        }`}
                    >
                      Set {v.id}
                      {v.complete && <CheckCircle2 className="w-3 h-3" />}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 flex justify-end">
          <Button
            variant="default"
            onClick={onGoToFinal}
            disabled={!patients.every(p => p.variants.every(v => isPatientComplete(v.case_id, answers)))}
            className="min-w-[140px]"
          >
            Afronden en indienen
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Detail Mode
  const isLastSetInPatient = currentVariantIndex === currentPatient.variants.length - 1;
  const isLastPatient = currentCaseIndex === totalPatients - 1;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Back to overview header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <Button
          variant="ghost"
          onClick={() => {
            setViewMode('overview');
            window.scrollTo(0, 0);
          }}
          className="-ml-3 text-muted-foreground hover:text-foreground w-fit"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Overzicht patiënten
        </Button>
        <div className="text-lg font-semibold bg-muted px-4 py-1.5 rounded-full flex items-center gap-2">
          {currentPatient.display_name}
        </div>
      </div>

      {/* Variant Tabs */}
      <div className="flex bg-muted/60 p-1.5 rounded-xl mb-8 w-full max-w-sm mx-auto shadow-inner">
        {currentPatient.variants.map((v) => {
          const isComplete = isPatientComplete(v.case_id, answers);
          const isActive = activeTab === v.variant_id;

          return (
            <button
              key={v.variant_id}
              onClick={() => {
                setErrorMsg(null);
                setShowErrors(false);
                setActiveTab(v.variant_id);
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${isActive
                ? 'bg-background shadow-sm text-foreground ring-1 ring-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              Set {v.variant_id}
              {isComplete && <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-green-600/70'}`} />}
            </button>
          );
        })}
      </div>

      {/* Current Variant Description */}
      {activeVariant.description && (
        <p className="text-sm text-muted-foreground mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
          {activeVariant.description}
        </p>
      )}

      {/* Questions */}
      <div className="question-group bg-card rounded-xl">
        <QuestionGroup
          questions={activeVariant.questions}
          answers={caseAnswers}
          onAnswerChange={handleChange}
          onConditionalClear={handleClear}
          disabled={disabled}
          showErrors={showErrors}
        />
      </div>

      {errorMsg && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-xl animate-in fade-in flex items-center gap-2">
          {errorMsg}
        </div>
      )}

      {/* Variant & Patient Navigation */}
      <div className="flex items-center justify-between mt-10 p-5 bg-card border border-border rounded-xl shadow-sm">
        <Button
          variant="outline"
          onClick={handlePrev}
          className="min-w-[120px]"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Vorige
        </Button>

        <div className="text-center hidden sm:block">
          <span className="text-sm font-medium text-muted-foreground">
            Set {activeVariant.variant_id} / {currentPatient.display_name}
          </span>
        </div>

        <Button
          variant={isLastSetInPatient && !isLastPatient ? "secondary" : "default"}
          onClick={handleNext}
          className={`min-w-[120px] ${isLastSetInPatient && !isLastPatient ? 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 border-blue-200' : ''}`}
        >
          {isLastSetInPatient && isLastPatient
            ? 'Afronden'
            : isLastSetInPatient
              ? 'Volgende patiënt'
              : 'Volgende set'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SegmentationStep;
