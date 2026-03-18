import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    getOrCreateSession,
    getStoredAnswers,
    isPatientComplete,
    isProfileComplete,
    updateSession
} from "@/lib/dataLayer";
import { questionnaireConfig } from "@/config/questionnaireConfig";
import { LogIn, ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";

const WelcomeBack = () => {
    const navigate = useNavigate();
    const session = getOrCreateSession();
    const answers = getStoredAnswers();

    const handleContinue = () => {
        // Determine where to send the user

        // 1. Check Profile
        if (!isProfileComplete(answers)) {
            navigate("/questionnaire"); // Questionnaire defaults to first incomplete or session step
            return;
        }

        // 2. Check Patients
        let firstIncompletePatientIndex = -1;
        for (let i = 0; i < questionnaireConfig.segmentation_patients.length; i++) {
            const patient = questionnaireConfig.segmentation_patients[i];
            const isComplete = patient.variants.every(v => isPatientComplete(v.case_id, answers));
            if (!isComplete) {
                firstIncompletePatientIndex = i;
                break;
            }
        }

        if (firstIncompletePatientIndex !== -1) {
            // Jump to the specific patient
            localStorage.setItem('resume_case_index', firstIncompletePatientIndex.toString());
            updateSession({ current_step: 2, current_case_index: firstIncompletePatientIndex });
            navigate("/questionnaire");
        } else {
            // Everything complete? Go to final submission
            localStorage.setItem('resume_case_index', '0'); // Reset or just ignore
            updateSession({ current_step: 3 });
            navigate("/questionnaire");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-card border border-border p-10 rounded-2xl shadow-xl text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>

                    <h1 className="text-3xl font-bold text-foreground mb-3">Welkom terug</h1>
                    <p className="text-muted-foreground mb-10 leading-relaxed text-lg">
                        U kunt verdergaan waar u bent gebleven. Uw voortgang is veilig opgeslagen.
                    </p>

                    <Button
                        size="lg"
                        onClick={handleContinue}
                        className="w-full text-lg h-14 shadow-lg active:scale-95 transition-all group"
                    >
                        Ga verder waar u gebleven was
                        <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default WelcomeBack;
