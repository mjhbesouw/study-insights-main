import { Check } from 'lucide-react';
import Footer from '@/components/Footer';

const ThankYou = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center">
        <div className="study-container text-center max-w-lg">
          {/* Success icon */}
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-success" />
            </div>
          </div>

          {/* Thank you message */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
            Dank voor uw deelname
          </h1>

          <p className="text-muted-foreground mb-8">
            Uw antwoorden zijn succesvol ingediend. Bedankt voor uw participatie!
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;
