import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { fetchAnswersFromSupabase, isProfileComplete } from "@/lib/dataLayer";
import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";

const Access = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);



    const handleVerify = async (code: string, emailAddr: string) => {
        if (!code || !emailAddr) return;

        setIsLoading(true);
        setError(null);

        try {
            // 1. Verify invite with email and token
            const { data: verifyData, error: verifyError } = await supabase.rpc("verify_invite", {
                token_text: code,
                email_text: emailAddr,
            });

            if (verifyError || !verifyData?.ok) {
                const reason = verifyData?.reason || "invalid";
                let message = "De combinatie van e-mailadres en code klopt niet.";

                if (reason === "expired") {
                    message = "Deze uitnodiging is verlopen.";
                } else if (reason === "revoked") {
                    message = "Deze uitnodiging is ingetrokken.";
                }
                // 'invalid', 'invalid_email', and 'used' all show the generic message per requirements

                setError(message);
                setIsLoading(false);
                return;
            }

            // 2. Create session
            const { data: sessionData, error: sessionError } = await supabase.rpc("create_session", {
                participant_id: verifyData.participant_id,
            });

            if (sessionError || !sessionData?.session_id) {
                setError("Er kon geen sessie worden aangemaakt. Probeer het later opnieuw.");
                setIsLoading(false);
                return;
            }

            // 3. Always wipe local answers on login — Supabase is authoritative.
            //    This prevents stale data from a previous same-browser test session bleeding through.
            localStorage.removeItem("answers");          // STORAGE_KEYS.ANSWERS
            localStorage.removeItem("dls_study_answers"); // actual key used in dataLayer
            localStorage.removeItem("dls_study_session"); // STORAGE_KEYS.SESSION_META (actual key!)

            // Store new session credentials
            localStorage.setItem("session_id", sessionData.session_id);
            localStorage.setItem("user_email", emailAddr);
            localStorage.setItem("participant_id", verifyData.participant_id);

            // 4. Force check Supabase directly for welcome vs welcome-back routing
            const { data: dbAnswers } = await supabase
                .from("answers")
                .select("id")
                .eq("participant_id", verifyData.participant_id)
                .limit(1);

            const hasDbAnswers = dbAnswers && dbAnswers.length > 0;

            // Hydrate answers into memory from Supabase (now that local is clean)
            const currentAnswers = await fetchAnswersFromSupabase(verifyData.participant_id, sessionData.session_id);

            // ONLY use direct DB check for welcome vs welcome-back decision.
            // Do NOT use profileComplete or localStorage — they can be stale from previous sessions.
            const returningStatus = !!hasDbAnswers;

            toast.success("Toegang verleend");

            if (returningStatus) {
                // Find highest case index
                let maxIndex = 0;
                for (const key of Object.keys(currentAnswers)) {
                    if (key.startsWith('segmentation.patient_')) {
                        const match = key.match(/patient_0(\d)/);
                        if (match && match[1]) {
                            const idx = parseInt(match[1], 10) - 1;
                            if (idx > maxIndex) {
                                maxIndex = idx;
                            }
                        }
                    }
                }
                localStorage.setItem('resume_case_index', maxIndex.toString());
            }

            // 5. Navigate to the proper welcome page
            navigate(returningStatus ? "/welcome-back" : "/welcome");
        } catch (err) {
            console.error("Access error:", err);
            setError("Er is een onverwachte fout opgetreden. Probeer het later opnieuw.");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const code = searchParams.get("code");
        if (code) {
            setToken(code);
            // We wait for email input before calling handleVerify
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-semibold tracking-tight">Toegang tot onderzoek</CardTitle>
                        <CardDescription>
                            Voer uw e-mailadres en persoonlijke studie token in om deel te nemen aan de vragenlijst.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">E-mailadres</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="uw.naam@voorbeeld.nl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleVerify(token, email)}
                                    disabled={isLoading}
                                    className={error ? "border-destructive" : ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="token" className="text-sm font-medium">Studiecode</Label>
                                <Input
                                    id="token"
                                    placeholder="Studie token"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleVerify(token, email)}
                                    disabled={isLoading}
                                    className={error ? "border-destructive" : ""}
                                />
                                {error && <p className="text-sm text-destructive mt-1">{error}</p>}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            onClick={() => handleVerify(token, email)}
                            disabled={isLoading || !token || !email}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifiëren...
                                </>
                            ) : (
                                "Toegang valideren"
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default Access;
