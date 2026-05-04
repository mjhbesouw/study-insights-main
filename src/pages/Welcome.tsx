import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import Footer from "@/components/Footer";

const Welcome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-semibold tracking-tight">Welkom bij het onderzoek</CardTitle>
                        <CardDescription className="text-lg">
                            Bedankt voor uw deelname aan dit onderzoek naar AI-segmentatie.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
                            <Info className="h-6 w-6 text-primary shrink-0" />
                            <div className="space-y-2">
                                <h3 className="font-medium text-foreground">Wat kunt u verwachten?</h3>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li>Een korte set vragen over uw professionele achtergrond.</li>
                                    <li>De beoordeling van radiotherapie-segmentaties van verschillende patiënten.</li>
                                </ul>
                                <p className="text-sm text-muted-foreground">
                                    Uw antwoorden worden gebruikt voor wetenschappelijk onderzoek.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
                            <Info className="h-6 w-6 text-primary shrink-0" />
                            <div className="space-y-2">
                                <h3 className="font-medium text-foreground">Instructie</h3>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li>Open eerst de patiëntdataset in <strong>RayStation</strong> in een apart venster.</li>
                                    <li>Voor iedere patiënt zijn twee segmentatiesets beschikbaar: <strong>Set A</strong> en <strong>Set B</strong>.</li>
                                    <li>Beide sets bevatten segmentaties van dezelfde patiënt.</li>
                                    <li>Klinische segmentaties en DLS-segmentaties zijn verdeeld over Set A en Set B om bias te verminderen.</li>
                                    <li>Beoordeel de getoonde segmentaties op basis van uw klinische expertise.</li>
                                    <li>U kunt de vragenlijst tussendoor opslaan en later verdergaan op hetzelfde punt.</li>
                                </ul>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-center">
                            Klik op de onderstaande knop om de vragenlijst te starten.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center gap-4 flex-wrap">
                        <Button size="lg" onClick={() => navigate("/questionnaire")} className="min-w-[200px]">
                            Start de vragenlijst
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => navigate("/turing-test")} className="min-w-[200px]">
                            Turing test
                        </Button>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default Welcome;
