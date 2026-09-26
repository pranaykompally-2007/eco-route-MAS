import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Trash2, 
  Truck, 
  Cpu, 
  User, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  Gift, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { PersonaRole } from '../types';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (role: PersonaRole) => void;
  onSimulateOverflow: () => void;
  onSimulateCitizenReport: () => void;
  onCleanAllBins: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onSelectPersona,
  onSimulateOverflow,
  onSimulateCitizenReport,
  onCleanAllBins,
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'try_it' | 'glossary'>('steps');
  const [interactiveFeedback, setInteractiveFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = (actionName: string, callback: () => void, personaTarget?: PersonaRole) => {
    callback();
    if (personaTarget) {
      onSelectPersona(personaTarget);
    }
    setInteractiveFeedback(`Action triggered: ${actionName}!`);
    setTimeout(() => {
      setInteractiveFeedback(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-modal-title"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="guide-modal-title" className="text-base font-bold text-white flex items-center gap-2">
                <span>How This Smart City Waste System Works</span>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  Easy Plain-English Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Understand in 2 minutes how smart bins, autonomous trucks, city residents, and server controllers keep the city 100% clean.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close guide modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('steps')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'steps'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>1. The 4-Step Process</span>
          </button>
          <button
            onClick={() => setActiveTab('try_it')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'try_it'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Interactive 1-Click Demos</span>
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'glossary'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>3. Plain-English Glossary</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {interactiveFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{interactiveFeedback}</span>
            </div>
          )}

          {/* TAB 1: 4-STEP PROCESS */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <p className="text-slate-300 text-xs leading-relaxed">
                Traditional garbage trucks drive fixed, noisy routes on set days—even if bins are empty—wasting taxpayer money and burning diesel. 
                This system replaces that with an <strong>autonomous, real-time cleanliness network</strong>:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Step 1 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      STEP 1: SENSING
                    </span>
                    <Trash2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Smart Bins Measure Trash Live</h3>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Every city bin has ultrasonic sensors to measure depth, temperature sensors to prevent fires, and sealed pneumatic lids to block odors. Bins broadcast their exact fill status (0% to 100%) in real time.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold text-[11px] bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      STEP 2: CITIZEN EMPOWERMENT
                    </span>
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Residents Report & Replace</h3>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Any resident can use their phone to report an overflowing bin, schedule bulky sofa pickups, or ask to replace a damaged bin. Residents earn Eco-Reward points for keeping the streets tidy!
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-purple-400 font-bold text-[11px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      STEP 3: SERVER CONTROLLER
                    </span>
                    <Cpu className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Central Brain Authorizes Replacements</h3>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    All citizen reports flow to the Server Controller. The controller can instantly authorize fresh bin replacements, close maintenance tickets, and launch emergency autonomous collection cycles.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-amber-400 font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      STEP 4: AUTONOMOUS ROUTING
                    </span>
                    <Truck className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Electric Trucks Coordinate Greener Routes</h3>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Instead of a human dispatcher, bins and electric robot trucks "bid" on pickups. The truck with the shortest battery detour and highest remaining capacity collects the trash first, cutting emissions by 40%.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE 1-CLICK DEMOS */}
          {activeTab === 'try_it' && (
            <div className="space-y-4">
              <p className="text-slate-300 text-xs">
                Click any of these 1-tap scenarios to immediately see the autonomous system respond in real time:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Demo 1 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1">
                      <Zap className="w-4 h-4" />
                      <span>Scenario A: 100% Overflow Emergency</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Instantly fills a downtown bin to 100% capacity to trigger the autonomous Zero-Overflow emergency dispatch.
                    </p>
                  </div>
                  <button
                    onClick={() => handleAction('Filled bin to 100% capacity', onSimulateOverflow, 'Operations Supervisor')}
                    className="w-full py-2.5 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Trigger 100% Overflow Alert</span>
                  </button>
                </div>

                {/* Demo 2 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-purple-400 font-semibold mb-1">
                      <RotateCcw className="w-4 h-4" />
                      <span>Scenario B: Resident Reports Broken Bin</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Submits a citizen report to the Server Controller to replace a cracked bin and shows the replacement console.
                    </p>
                  </div>
                  <button
                    onClick={() => handleAction('Submitted report to Server Controller', onSimulateCitizenReport, 'Server Controller')}
                    className="w-full py-2.5 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Send Report to Server Controller</span>
                  </button>
                </div>

                {/* Demo 3 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Scenario C: Clean All Bins (Zero Waste)</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Simulates complete city collection cycle, resetting all bin fill levels to 0% and achieving 100% clean status.
                    </p>
                  </div>
                  <button
                    onClick={() => handleAction('Cleaned all municipal bins', onCleanAllBins, 'Operations Supervisor')}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Full Autonomous Clean Cycle</span>
                  </button>
                </div>

                {/* Demo 4 */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
                      <User className="w-4 h-4" />
                      <span>Scenario D: Visit City Resident Portal</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Opens the resident civic channel where citizens can submit their own custom reports and claim Eco-Credits.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectPersona('City Resident');
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Open Resident Reporting Channel</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: PLAIN ENGLISH GLOSSARY */}
          {activeTab === 'glossary' && (
            <div className="space-y-3">
              <p className="text-slate-300 text-xs">
                Everyday explanations for key terms used throughout this smart city dashboard:
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    term: 'Fill Level (%)',
                    plain: 'How full the trash bin currently is. At 0% it is completely empty; at 85%+ it is considered ready for urgent pickup; at 100% it triggers emergency autonomous dispatch.',
                  },
                  {
                    term: 'Server Controller',
                    plain: 'The central municipal software server that receives resident reports, authorizes physical bin replacements, and ensures electric trucks follow zero-carbon rules.',
                  },
                  {
                    term: 'Multi-Agent Negotiation',
                    plain: 'Instead of a human having to manually guess which truck to send, each bin and each truck act as smart digital agents that automatically match up based on location and battery charge.',
                  },
                  {
                    term: 'Eco-Credits / Reward Points',
                    plain: 'Points awarded to city residents who report overflowing or broken bins before trash can spill onto sidewalks.',
                  },
                  {
                    term: 'Pneumatic Lid',
                    plain: 'An automated, tightly sealed lid mechanism that opens for citizens and seals shut automatically to block smells and keep rain out.',
                  },
                  {
                    term: 'Odor PPM',
                    plain: 'Parts Per Million reading of organic decomposition odor. Below 15 ppm smells normal; above 35 ppm prompts bio-filter replacement.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="font-semibold text-white text-xs">{item.term}</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{item.plain}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Tip: You can switch channels at any time using the top navigation bar.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            Got it, let's explore!
          </button>
        </div>
      </div>
    </div>
  );
};
