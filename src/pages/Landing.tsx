import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="study-container text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-6 tracking-tight">
              Deep Learning Segmentation Study
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              This study evaluates the quality of AI-generated radiotherapy segmentations. 
              As a radiation oncology professional, your expert assessment will help validate 
              and improve deep learning segmentation tools for clinical use.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/study-info')}
                className="min-w-[180px]"
              >
                Read study info
              </Button>
              <Button 
                size="lg"
                onClick={() => navigate('/study-info')}
                className="min-w-[180px]"
              >
                Start questionnaire
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="study-container">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              <p>[Institution Name]</p>
              <p>Department of Radiation Oncology</p>
            </div>
            <div className="text-center sm:text-right">
              <p>Contact: [researcher@institution.edu]</p>
              <p>Study Reference: DLS-2024-001</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
