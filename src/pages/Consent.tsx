import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saveConsent, updateSession } from '@/lib/dataLayer';
import { ConsentData } from '@/types/questionnaire';

const CONSENT_ITEMS = [
  {
    id: 'voluntary',
    label: 'I understand that my participation in this study is voluntary and that I may withdraw at any time without giving a reason.',
  },
  {
    id: 'anonymized',
    label: 'I understand that my responses will be analyzed in anonymized form and used for research purposes only.',
  },
  {
    id: 'stop_anytime',
    label: 'I understand that I can stop the questionnaire at any time and my partial responses will be saved.',
  },
  {
    id: 'data_handling',
    label: 'I have read and understood the information about data handling and privacy.',
  },
];

const CENTERS = [
  'Academic Medical Center A',
  'University Hospital B',
  'Regional Cancer Center C',
  'Community Hospital D',
  'Other',
];

const Consent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentChecks, setConsentChecks] = useState<Record<string, boolean>>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [center, setCenter] = useState('');
  const [customCenter, setCustomCenter] = useState('');

  const allChecked = CONSENT_ITEMS.every(item => consentChecks[item.id]);
  const isValid = allChecked && name.trim().length > 0 && (center !== '' && (center !== 'Other' || customCenter.trim().length > 0));

  const handleCheckChange = (id: string, checked: boolean) => {
    setConsentChecks(prev => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    const consentData: ConsentData = {
      items: CONSENT_ITEMS.map(item => ({
        id: item.id,
        label: item.label,
        checked: consentChecks[item.id] || false,
      })),
      name: name.trim(),
      email: email.trim() || undefined,
      center: center === 'Other' ? customCenter.trim() : center,
      consented_at: new Date().toISOString(),
    };

    try {
      await saveConsent(consentData);
      updateSession({ consent_given: true, current_step: 1 });
      navigate('/questionnaire');
    } catch (error) {
      console.error('Failed to save consent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="study-container">
          {/* Header */}
          <header className="study-header">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Informed Consent
            </h1>
            <p className="text-muted-foreground mt-2">
              Please review and agree to the following before proceeding.
            </p>
          </header>

          {/* Consent checkboxes */}
          <div className="space-y-6 mb-10">
            <h2 className="text-lg font-medium text-foreground">Consent Statements</h2>
            
            <div className="space-y-4">
              {CONSENT_ITEMS.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <Checkbox
                    id={item.id}
                    checked={consentChecks[item.id] || false}
                    onCheckedChange={(checked) => handleCheckChange(item.id, checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label 
                    htmlFor={item.id} 
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Participant information */}
          <div className="space-y-6 mb-10">
            <h2 className="text-lg font-medium text-foreground">Participant Information</h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full name or initials *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name or initials"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@institution.edu"
                />
              </div>

              {/* Center */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="center">Institution/Center *</Label>
                <Select value={center} onValueChange={setCenter}>
                  <SelectTrigger id="center">
                    <SelectValue placeholder="Select your institution" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {CENTERS.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom center input */}
              {center === 'Other' && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="customCenter">Please specify your institution *</Label>
                  <Input
                    id="customCenter"
                    value={customCenter}
                    onChange={(e) => setCustomCenter(e.target.value)}
                    placeholder="Enter your institution name"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-4 justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/study-info')}
            >
              Back
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'I consent, proceed'}
            </Button>
          </div>

          {/* Privacy note */}
          <div className="privacy-note">
            <p>
              Your personal information is collected solely for consent tracking purposes 
              and will not be linked to your questionnaire responses in any published results.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Consent;
