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
              Study Information
            </h1>
            <p className="text-muted-foreground mt-2">
              Please read the following information carefully before proceeding.
            </p>
          </header>

          {/* Content sections */}
          <div className="space-y-8">
            {/* Background */}
            <section>
              <h2 className="text-lg font-medium text-foreground mb-3">Background</h2>
              <p className="text-muted-foreground leading-relaxed">
                Deep learning segmentation (DLS) systems have shown promise in automating 
                the delineation of organs at risk and target volumes in radiotherapy planning. 
                This study aims to evaluate the clinical acceptability of AI-generated 
                segmentations by gathering expert assessments from radiation oncology professionals.
              </p>
            </section>

            <Separator />

            {/* What you will do */}
            <section>
              <h2 className="text-lg font-medium text-foreground mb-3">What you will do</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                As a participant in this study, you will:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Complete a brief profile questionnaire about your background and experience</li>
                <li>Rate the quality of multiple AI-generated segmentations using standardized criteria</li>
                <li>Participate in a comparison exercise to identify AI vs. clinical segmentations</li>
                <li>Provide overall feedback on the segmentation system</li>
              </ul>
            </section>

            <Separator />

            {/* Time investment */}
            <section>
              <h2 className="text-lg font-medium text-foreground mb-3">Time investment</h2>
              <p className="text-muted-foreground leading-relaxed">
                The complete questionnaire takes approximately <strong>3 hours</strong> to complete. 
                You may save your progress and return at any time. Your responses are automatically 
                saved as you proceed through each section.
              </p>
            </section>

            <Separator />

            {/* Data handling */}
            <section>
              <h2 className="text-lg font-medium text-foreground mb-3">Data handling</h2>
              <p className="text-muted-foreground leading-relaxed">
                All data collected in this study will be:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                <li>Stored securely on encrypted servers</li>
                <li>Analyzed in anonymized form only</li>
                <li>Used solely for research purposes related to this study</li>
                <li>Retained for a minimum of 5 years in accordance with research data policies</li>
              </ul>
            </section>

            <Separator />

            {/* Privacy */}
            <section>
              <h2 className="text-lg font-medium text-foreground mb-3">Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your participation is pseudonymous. We collect minimal identifying information 
                (name/initials and optionally email) solely for the purpose of tracking consent 
                and providing you with a completion certificate. This information will not be 
                linked to your questionnaire responses in any published results. No patient data 
                is displayed or collected as part of this study—only pseudonymous case identifiers 
                are used.
              </p>
            </section>

            <Separator />

            {/* Contact */}
            <section>
              <h2 className="text-lg font-medium text-foreground mb-3">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this study, please contact:
              </p>
              <div className="mt-3 text-muted-foreground">
                <p><strong>Principal Investigator:</strong> [Name]</p>
                <p><strong>Email:</strong> [researcher@institution.edu]</p>
                <p><strong>Institution:</strong> [Institution Name]</p>
              </div>
            </section>
          </div>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Back to home
            </Button>
            <Button 
              onClick={() => navigate('/consent')}
            >
              Continue to consent
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="study-container">
          <p className="text-xs text-muted-foreground text-center">
            Study Reference: DLS-2024-001 | [Institution Name]
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StudyInfo;
