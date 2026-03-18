import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const StudyInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="study-container">
          {/* Header */}
          <header className="study-header">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Studie-informatie
            </h1>
            <p className="text-muted-foreground mt-2">
              Lees de volgende informatie aandachtig door voordat u verdergaat.
            </p>
          </header>

          {/* Content sections */}
          <div className="space-y-8">
            {/* Background */}
            <section>
              <h2 className="text-lg font-medium text-foreground mb-3">Achtergrond</h2>
              <p className="text-muted-foreground leading-relaxed">
                Deep learning-segmentatiesystemen (DLS) tonen veelbelovende resultaten bij het
                automatiseren van de afbakening van risico-organen en doelvolumes in de
                radiotherapieplanning. Deze studie heeft als doel de klinische aanvaardbaarheid
                van AI-gegenereerde segmentaties te evalueren door deskundige beoordelingen te
                verzamelen van radiotherapeuten.
              </p>
            </section>

            <Separator />

            {/* What you will do */}
            <section>
              <h2 className="text-lg font-medium text-foreground mb-3">Wat u gaat doen</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Als deelnemer aan deze studie zult u:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Een korte profielvragenlijst invullen over uw achtergrond en ervaring</li>
                <li><strong> Deel 1: </strong> De kwaliteit van meerdere (klinische én AI-gegenereerde) segmentaties beoordelen aan de hand van gestandaardiseerde criteria</li>
                <li>Deel 2: Deelnemen aan een vergelijkende oefening om AI- en klinische segmentaties te onderscheiden (de Turing test)</li>
              </ul>
            </section>

            <Separator />

            {/* Time investment */}
            <section>
              <h2 className="text-lg font-medium text-foreground mb-3">Tijdsinvestering</h2>
              <p className="text-muted-foreground leading-relaxed">
                De volledige vragenlijst duurt ongeveer <strong>3 uur</strong> om te voltooien.
                U kunt uw voortgang opslaan en op elk gewenst moment terugkeren. Uw antwoorden
                worden automatisch opgeslagen terwijl u elke sectie doorloopt.
              </p>
            </section>

            <Separator />

            {/* Privacy */}
            <section>
              <h2 className="text-lg font-medium text-foreground mb-3">Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Uw deelname is pseudoniem. We verzamelen minimale identificerende informatie
                (naam/initialen en optioneel e-mail) voor het bijhouden van toestemming, en voor de terugkoppeling van resultaten naar de readers zelf.
                Zo kunnen de readers ook zien hoe DLS zich verhoudt tot hun eigen segmentaties.
                De informatie wordt niet gekoppeld aan uw vragenlijstantwoorden in gepubliceerde
                resultaten.
              </p>
            </section>

            <Separator />

            {/* Contact */}
            <section>
              <h2 className="text-lg font-medium text-foreground mb-3">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Als u vragen heeft over deze studie, neem dan contact op met:
              </p>
              <div className="mt-3 text-muted-foreground">
                <p><strong>Contactpersoon:</strong> Marlie Besouw</p>
                <p><strong>E-mail:</strong> marlie.besouw@catharinaziekenhuis.nl</p>
                <p><strong>Ziekenhuis:</strong> Catharina Ziekenhuis Eindhoven</p>
              </div>
            </section>
          </div>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Terug naar start
            </Button>
            <Button
              onClick={() => navigate('/consent')}
            >
              Ga verder naar toestemming
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="study-container">
          <p className="text-xs text-muted-foreground text-center">
            Project: Multicenter-DLS-2026 | Catharina Ziekenhuis Eindhoven
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StudyInfo;
