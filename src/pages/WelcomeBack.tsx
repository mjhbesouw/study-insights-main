import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
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
    const [isScoringSubmitted, setIsScoringSubmitted] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        async function checkSubmission() {
            const participantId = localStorage.getItem("participant_id");
            if (!participantId) {
                setIsChecking(false);
                return;
            }

            const { data, error } = await supabase
                .from("submissions")
                .select("id")
                .eq("participant_id", participantId)
                .maybeSingle();

            if (data && !error) {
                setIsScoringSubmitted(true);
            }
            setIsChecking(false);
        }

        checkSubmission();
    }, []);

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
                <div className="max-w-lg w-full bg-card border border-border p-8 sm:p-10 rounded-2xl shadow-xl text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>

                    <h1 className="text-3xl font-bold text-foreground mb-3">Welkom terug</h1>
                    <p className="text-muted-foreground mb-10 leading-relaxed text-lg">
                        U kunt verdergaan waar u bent gebleven. Uw voortgang is veilig opgeslagen.
                    </p>

                    <div className="space-y-4">
                        {/* Scoring Button */}
                        <div className="relative group/scoring z-20">
                            <div className={(!isChecking && isScoringSubmitted) ? 'cursor-not-allowed' : ''}>
                                <Button
                                    size="lg"
                                    variant={isScoringSubmitted ? "outline" : "default"}
                                    onClick={handleContinue}
                                    disabled={isChecking || isScoringSubmitted}
                                    className={`w-full text-base sm:text-lg h-auto py-4 transition-all group 
                                        ${isScoringSubmitted
                                            ? 'opacity-50 pointer-events-none bg-muted shadow-sm'
                                            : 'shadow-lg active:scale-95'}`}
                                >
                                    {isChecking ? "Controleren..." : (isScoringSubmitted ? "Scoring" : "Scoring: Ga verder waar u gebleven was")}
                                    {!isChecking && !isScoringSubmitted && <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />}
                                </Button>
                            </div>
                            {!isChecking && isScoringSubmitted && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-full opacity-0 invisible group-hover/scoring:opacity-100 group-hover/scoring:visible transition-all duration-200 z-10 pointer-events-none">
                                    <div className="bg-amber-50 text-amber-900 border border-amber-200 text-sm shadow-xl rounded-lg p-3 text-center font-medium relative">
                                        U heeft het scoring gedeelte al afgerond.
                                        {/* CSS Triangle pointing UP */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-amber-200"></div>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-amber-50 translate-y-[1px]"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Turing Button */}
                        <div className="relative group/turing z-10">
                            <div className={(!isChecking && !isScoringSubmitted) ? 'cursor-not-allowed' : ''}>
                                <Button
                                    size="lg"
                                    variant={isScoringSubmitted ? "default" : "outline"}
                                    onClick={() => navigate("/turing-test")}
                                    disabled={isChecking || !isScoringSubmitted}
                                    className={`w-full text-base sm:text-lg h-auto py-4 transition-all group 
                                        ${(!isChecking && !isScoringSubmitted)
                                            ? 'opacity-50 pointer-events-none bg-muted shadow-sm'
                                            : 'shadow-lg active:scale-95'}`}
                                >
                                    {isChecking ? "Controleren..." : (isScoringSubmitted ? "Turing test" : "Ga naar Turing test")}
                                    {!isChecking && isScoringSubmitted && <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />}
                                </Button>
                            </div>
                            {!isChecking && !isScoringSubmitted && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-full opacity-0 invisible group-hover/turing:opacity-100 group-hover/turing:visible transition-all duration-200 z-10 pointer-events-none">
                                    <div className="bg-amber-50 text-amber-900 border border-amber-200 text-sm shadow-xl rounded-lg p-3 text-center font-medium relative">
                                        Rond eerst het scoring gedeelte af om met de Turing test te starten.
                                        {/* CSS Triangle pointing UP */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-amber-200"></div>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-amber-50 translate-y-[1px]"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default WelcomeBack;
