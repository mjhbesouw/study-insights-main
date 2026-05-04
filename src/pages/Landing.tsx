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
        <div className="max-w-6xl w-full mx-auto space-y-16 py-8">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <h1 className="text-3xl sm:text-5xl font-bold text-[#0f172a] leading-tight">
              Multicenter DLS Studie: RS gebruikersgroep
            </h1>
            <p className="text-lg sm:text-xl text-[#475569] max-w-3xl mx-auto leading-relaxed">
              In deze reader study vragen we jullie als radiotherapeuten om segmentaties kwalitatief te beoordelen.
              Hierbij worden zowel AI-gegenereerde segmentaties als klinische segmentaties van verschillende
              instituten getoond.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left side: Context & Phasing */}
            <div className="lg:col-span-7 space-y-10">
              <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary/20"></div>

                <div className="space-y-6 text-left">
                  <p className="text-[#334155] text-lg leading-relaxed">
                    {/* In het kwantitatieve deel van deze studie hebben we multicenter klinische segmentaties
                    gebruikt als referentiestandaard.<br></br><br></br> */}
                    Hieronder staan de fases van de kwalitatieve reader study beschreven. De beschreven periodes zijn de algemene deadlines.
                    Met sommige radiotherapeuten zijn er individueel deadlines afgesproken, en kan het zijn dat deze afwijken van de algemene deadlines.
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
                          status: 'past',
                          date: "Tot en met 17 april",
                          text: "In het eerste deel wordt u gevraagd om segmentaties te beoordelen met behulp van een Likert-schaal. Hierbij worden zowel AI-gegenereerde segmentaties als klinische segmentaties van verschillende instituten getoond."
                        },
                        {
                          num: 2,
                          status: 'past',
                          date: "20 april - 1 mei",
                          text: "Een wash-out periode van twee weken."
                        },
                        {
                          num: 3,
                          status: 'active',
                          date: "4 mei - 22 mei",
                          text: "De Turing test, hier wordt u gevraagd te beoordelen of een set van segmentaties klinisch is, of door AI is gemaakt."
                        }
                      ].map((phase, i) => (
                        <div key={i} className={`flex gap-6 relative group transition-all duration-300 ${phase.status === 'past' ? 'opacity-40 hover:opacity-70 grayscale' : ''}`}>
                          <div className={`flex-none w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center font-bold z-10 transition-all duration-300
                            ${phase.status === 'active' ? 'border-primary text-primary shadow-[0_0_15px_rgba(37,99,235,0.2)] scale-110' :
                              phase.status === 'past' ? 'border-[#e2e8f0] text-slate-400' :
                                'border-[#f1f5f9] text-primary/70 group-hover:border-primary/50'}
                          `}>
                            {phase.status === 'past' ? <CheckCircle2 className="w-5 h-5" /> : phase.num}
                          </div>
                          <div className={`space-y-2 text-left ${phase.status === 'active' ? 'pt-2' : 'pt-1'}`}>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <p className={`text-sm font-bold uppercase tracking-wider ${phase.status === 'past' ? 'text-slate-400 line-through decoration-slate-300' : 'text-primary/80'}`}>
                                {phase.date}
                              </p>
                              {phase.status === 'active' && (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider border border-primary/20 shadow-sm animate-in fade-in">
                                  Huidige fase
                                </span>
                              )}
                            </div>
                            <p className={`leading-relaxed font-medium ${phase.status === 'past' ? 'text-slate-400' : 'text-[#475569]'}`}>
                              {phase.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Practical Info & CTA */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-[#f0f9ff] rounded-2xl">
                    <Monitor className="w-6 h-6 text-[#0369a1]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0f172a]">RayStation</h3>
                </div>
                <p className="text-[#475569] leading-relaxed font-medium">
                  De patiënten in deze studie zijn beschikbaar voor de scoring als <span className="text-[#0369a1] font-bold">patient_01 t/m patient_22</span>.
                  Voor de Turing test zijn de patiënten <span className="text-[#0369a1] font-bold">patient_01_T t/m patient_21_T</span> beschikbaar.
                  Wanneer deze
                  al door de klinisch fysicus zijn ingeladen, kunt u deze direct terugvinden in RayStation.
                </p>
              </div>

              <div className="bg-[#0f172a] text-white rounded-[2rem] p-8 space-y-8 shadow-2xl shadow-primary/20 relative overflow-hidden group">
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
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white h-16 text-lg font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Inloggen & Starten
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer containerClass="max-w-6xl w-full mx-auto px-6 sm:px-12" />
    </div>
  );
};

export default Landing;
