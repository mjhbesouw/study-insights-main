import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="study-container text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-6 tracking-tight">
              Multicenter DLS Studie: RS gebruikersgroep
            </h1>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Deep Learning Segmentatie (DLS) software toont veelbelovende resultaten bij het
              automatiseren van de afbakening van risico-organen en doelvolumes in de
              radiotherapieplanning. <br /><br />

              In het kwantitatieve deel van deze studie hebben we multicenter klinische segmentaties
              gebruikt als referentiestandaard. <br /><br />

              Deze reader study bestaat uit drie onderdelen: </br>
            1. Tot en met 17 april: In het eerste deel wordt u gevraagd om segmentaties te beoordelen met behulp van een Likert-schaal. Hierbij worden zowel
            AI-gegenereerde segmentaties als klinische segmentaties van verschillende instituten getoond. <br /><br />

            2. 20 april - 1 mei: Een wash-out periode van twee weken. </br>

          3. 4 mei - 22 mei: De Turing test, hier wordt u gevraagd te beoordelen of een segmentatie klinisch is, of door AI is gemaakt. <br /><br />

          In deze reader study vragen we radiotherapeuten om segmentaties kwalitatief te beoordelen.
          Hierbij worden zowel AI-gegenereerde segmentaties als klinische segmentaties van verschillende
          instituten getoond. <br />

          De patiënten in deze studie zijn beschikbaar als patient_01 t/m patient_21. Wanneer deze
          al door de klinisch fysicus zijn ingeladen, kunt u deze direct terugvinden in RayStation. <br /><br />

          Uw beoordeling helpt om de resultaten van de kwantitatieve analyse beter
          te interpreteren en inzicht te krijgen in de variatie tussen klinische segmentaties. <br /><br />

          U kunt de vragenlijst tussendoor opslaan en later verdergaan op hetzelfde punt.

        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/access')}
            className="min-w-[200px]"
          >
            Inloggen & Starten
          </Button>
        </div>
    </div>
        </div >
      </main >

  <Footer />
    </div >
  );
};

export default Landing;
