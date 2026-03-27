import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { Calendar, Clock, CheckCircle2, Monitor, Info, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-5xl w-full mx-auto space-y-16 py-8">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0f172a] tracking-tight leading-tight">
              Multicenter DLS Studie: <span className="text-primary italic">RS gebruikersgroep</span>
            </h1>
            <p className="text-xl text-[#475569] max-w-3xl mx-auto leading-relaxed font-medium">
              Deep Learning Segmentatie (DLS) software toont veelbelovende resultaten bij het
              automatiseren van de afbakening van risico-organen en doelvolumes in de
              radiotherapieplanning.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left side: Context & Phasing */}
            <div className="lg:col-span-7 space-y-10">
              <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-2 h-full bg-primary/20"></div>
                
                <div className="space-y-6 text-left">
                  <p className="text-[#334155] text-lg leading-relaxed">
                    In het kwantitatieve deel van deze studie hebben we multicenter klinische segmentaties
                    gebruikt als referentiestandaard.
                  </p>
                  
                  <div className="pt-8 border-t border-[#f1f5f9]">
                    <h2 className="text-xl font-bold text-[#0f172a] mb-8 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      Deze reader study bestaat uit drie onderdelen:
                    </h2>
                    
                    <div className="space-y-8 relative">
                      {/* Timeline line */}
                      <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-[#f1f5f9]"></div>

                      {[
                        {
                          num: 1,
                          date: "Tot en met 17 april",
                          text: "In het eerste deel wordt u gevraagd om segmentaties te beoordelen met behulp van een Likert-schaal. Hierbij worden zowel AI-gegenereerde segmentaties als klinische segmentaties van verschillende instituten getoond."
                        },
                        {
                          num: 2,
                          date: "20 april - 1 mei",
                          text: "Een wash-out periode van twee weken."
                        },
                        {
                          num: 3,
                          date: "4 mei - 22 mei",
                          text: "De Turing test, hier wordt u gevraagd te beoordelen of een segmentatie klinisch is, of door AI is gemaakt."
                        }
                      ].map((phase, i) => (
                        <div key={i} className="flex gap-6 relative group">
                          <div className="flex-none w-10 h-10 rounded-full bg-white border-2 border-[#f1f5f9] flex items-center justify-center text-primary font-bold z-10 group-hover:border-primary/50 transition-colors">
                            {phase.num}
                          </div>
                          <div className="space-y-2 text-left pt-1">
                            <p className="text-sm font-bold uppercase tracking-wider text-primary/80">{phase.date}</p>
                            <p className="text-[#475569] leading-relaxed font-medium">
                              {phase.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-left space-y-6 px-4">
                <p className="text-[#64748b] leading-relaxed text-lg">
                  In deze reader study vragen we radiotherapeuten om segmentaties kwalitatief te beoordelen.
                  Hierbij worden zowel AI-gegenereerde segmentaties als klinische segmentaties van verschillende
                  instituten getoond.
                </p>
                <div className="flex items-start gap-4 p-4 bg-[#f8fafc] rounded-2xl border border-[#f1f5f9]">
                  <Info className="w-6 h-6 text-primary/60 flex-none mt-1" />
                  <p className="text-[#64748b] leading-relaxed italic text-base">
                    Uw beoordeling helpt om de resultaten van de kwantitatieve analyse beter
                    te interpreteren en inzicht te krijgen in de variatie tussen klinische segmentaties.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side: Practical Info & CTA */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-12">
              <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                   <div className="p-3 bg-[#f0f9ff] rounded-2xl">
                    <Monitor className="w-6 h-6 text-[#0369a1]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0f172a]">RayStation</h3>
                </div>
                <p className="text-[#475569] leading-relaxed font-medium">
                  De patiënten in deze studie zijn beschikbaar als <span className="text-[#0369a1] font-bold">patient_01 t/m patient_21</span>. Wanneer deze
                  al door de klinisch fysicus zijn ingeladen, kunt u deze direct terugvinden in RayStation.
                </p>
              </div>

              <div className="bg-[#0f172a] text-white rounded-[2rem] p-10 space-y-8 shadow-2xl shadow-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-colors"></div>
                
                <div className="space-y-4 relative">
                  <h3 className="text-3xl font-bold tracking-tight">Klaar om te starten?</h3>
                  <p className="text-[#94a3b8] text-lg font-medium leading-relaxed">
                    U kunt de vragenlijst tussendoor opslaan en later verdergaan op hetzelfde punt.
                  </p>
                </div>
                
                <Button
                  size="lg"
                  onClick={() => navigate('/access')}
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white h-16 text-xl font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  Inloggen & Starten
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
