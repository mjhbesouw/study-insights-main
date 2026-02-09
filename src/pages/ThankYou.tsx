import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Download, Copy } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const completionCode = location.state?.completionCode || 'DEMO-CODE';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(completionCode);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Completion code copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    const now = new Date();
    
    // Title
    doc.setFontSize(20);
    doc.text('Study Completion Receipt', 105, 30, { align: 'center' });
    
    // Study info
    doc.setFontSize(12);
    doc.text('Deep Learning Segmentation Study', 105, 45, { align: 'center' });
    doc.text('DLS-2024-001', 105, 52, { align: 'center' });
    
    // Line
    doc.setLineWidth(0.5);
    doc.line(30, 60, 180, 60);
    
    // Completion details
    doc.setFontSize(11);
    doc.text('This certifies that the questionnaire has been completed.', 30, 75);
    
    doc.text('Completion Code:', 30, 95);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(completionCode, 30, 105);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Date: ${now.toLocaleDateString()}`, 30, 120);
    doc.text(`Time: ${now.toLocaleTimeString()}`, 30, 130);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Please retain this receipt for your records.', 105, 180, { align: 'center' });
    doc.text('[Institution Name] - Department of Radiation Oncology', 105, 190, { align: 'center' });
    
    doc.save(`dls-study-completion-${completionCode}.pdf`);
    
    toast({
      title: 'Downloaded!',
      description: 'Receipt saved as PDF.',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="study-container text-center max-w-lg">
        {/* Success icon */}
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-success" />
          </div>
        </div>

        {/* Thank you message */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
          Thank you for participating
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Your responses have been submitted successfully. Your expert input is invaluable 
          for advancing AI-based segmentation tools in radiotherapy.
        </p>

        {/* Completion code */}
        <div className="mb-8 p-6 bg-secondary rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Your completion code</p>
          <div className="flex items-center justify-center gap-2">
            <code className="text-xl font-mono font-semibold text-foreground">
              {completionCode}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleDownloadReceipt}
          >
            <Download className="h-4 w-4 mr-2" />
            Download receipt
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            Return to home
          </Button>
        </div>

        {/* Contact info */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            If you have any questions, please contact us at{' '}
            <span className="text-foreground">[researcher@institution.edu]</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
