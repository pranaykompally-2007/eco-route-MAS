import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Wrench, 
  User, 
  Cpu, 
  HelpCircle, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { PersonaRole } from '../types';

interface RoleGuideBannerProps {
  currentPersona: PersonaRole;
  onOpenGuide: () => void;
  onSelectPersona: (role: PersonaRole) => void;
  onQuickAction?: () => void;
}

export const RoleGuideBanner: React.FC<RoleGuideBannerProps> = ({
  currentPersona,
  onOpenGuide,
  onSelectPersona,
  onQuickAction,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-[#101621] border border-[#1e2736] rounded-xl text-xs text-slate-400 font-sans">
        <span className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Active Role: <strong className="text-white">{currentPersona}</strong></span>
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDismissed(false)}
            className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
          >
            Show Role Guide
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={onOpenGuide}
            className="text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>How It Works</span>
          </button>
        </div>
      </div>
    );
  }

  const getRoleDetails = (role: PersonaRole) => {
    switch (role) {
      case 'Operations Supervisor':
        return {
          icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
          title: 'Operations Supervisor (City Command)',
          summary: 'You oversee the entire municipal grid: live truck battery telemetry, bin fill levels, and total carbon savings.',
          actionLabel: 'Check Fleet Health',
          targetTip: 'Try clicking any bin or truck on the map above to inspect live readings.',
        };
      case 'Driver Agent':
        return {
          icon: <Truck className="w-5 h-5 text-blue-400" />,
          title: 'Autonomous Truck Agent (Turn-by-Turn Route)',
          summary: 'You view what an autonomous electric vehicle sees: optimized pickup sequences, bin weights, and automated robotic lift cycles.',
          actionLabel: 'View Turn-by-Turn',
          targetTip: 'Click "Advance Waypoint" in the workflow bar to simulate the electric arm emptying a smart bin.',
        };
      case 'Server Controller':
        return {
          icon: <Cpu className="w-5 h-5 text-blue-400" />,
          title: 'Server Controller & Orchestrator',
          summary: 'You are the central brain: citizen reports arrive here in real time. You can authorize bin replacements and optimize truck bids.',
          actionLabel: 'Review Reports',
          targetTip: 'Look at the citizen reports below and click "Authorize & Replace Bin Node" to swap a damaged bin.',
        };
      case 'City Resident':
        return {
          icon: <User className="w-5 h-5 text-emerald-400" />,
          title: 'City Resident Civic Portal',
          summary: 'You are an everyday resident. Check nearby neighborhood bins, submit photos or reports, and earn clean-city Eco-Rewards.',
          actionLabel: 'Submit a Report',
          targetTip: 'Choose a bin, click a 1-tap template, and send the report directly to Server Controller!',
        };
      case 'Maintenance Technician':
        return {
          icon: <Wrench className="w-5 h-5 text-amber-400" />,
          title: 'Maintenance & Hardware Specialist',
          summary: 'You diagnose physical bin sensors, unjam stuck pneumatic lids, and replace odor filtration cartridges.',
          actionLabel: 'Inspect Tickets',
          targetTip: 'Click "Calibrate Sensors" on any smart bin to resolve open hardware alerts.',
        };
    }
  };

  const details = getRoleDetails(currentPersona);

  return (
    <div className="bg-[#111722] border border-[#222c3c] rounded-xl p-4 shadow-sm text-xs font-sans">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Icon & Explanations */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#090e15] border border-[#1d2634] flex items-center justify-center shrink-0">
            {details.icon}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm">{details.title}</span>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-semibold">
                ACTIVE PERSPECTIVE
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs max-w-3xl">
              {details.summary}
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
              <span className="text-amber-400 font-medium">💡 Quick Hint:</span>
              <span>{details.targetTip}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & How It Works button */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={onOpenGuide}
            className="px-3 py-1.5 rounded-lg bg-[#18212e] hover:bg-[#202b3c] text-slate-200 border border-[#273549] font-medium transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>How It Works</span>
          </button>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-500 hover:text-slate-300 p-1 text-xs cursor-pointer"
            title="Minimize this guide"
          >
            ✕
          </button>
        </div>

      </div>
    </div>
  );
};
