import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { ArrowLeft, Clock } from "lucide-react";

const TuringTest = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Turing test nog niet gestart</CardTitle>
                        <CardDescription className="text-lg mt-2">
                            De Turing test is nog niet gestart. U ontvangt bericht zodra deze beschikbaar is.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Ga terug
                        </Button>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default TuringTest;
