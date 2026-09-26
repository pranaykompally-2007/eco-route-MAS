import React from 'react';
import { 
  Bot, 
  Truck, 
  Wrench, 
  User, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Layers, 
  Globe2, 
  BookOpen 
} from 'lucide-react';
import { PersonaRole, Persona } from '../types';

interface HeaderProps {
  currentPersona: PersonaRole;
  onSelectPersona: (role: PersonaRole) => void;
  personas: Persona[];
  aiEnabled: boolean;
  activeTruckCount: number;
  criticalBinCount: number;
  currentAreaName?: string;
  onOpenAreaModal?: () => void;
  onOpenGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  onSelectPersona,
  personas,
  aiEnabled,
  activeTruckCount,
  criticalBinCount,
  currentAreaName = 'Metropolis Downtown',
  onOpenAreaModal,
  onOpenGuide,
}) => {
  const getPersonaIcon = (role: PersonaRole) => {
    switch (role) {
      case 'Operations Supervisor':
        return <ShieldCheck className="w-4 h-4" />;
      case 'Driver Agent':
        return <Truck className="w-4 h-4" />;
      case 'Maintenance Technician':
        return <Wrench className="w-4 h-4" />;
      case 'City Resident':
        return <User className="w-4 h-4" />;
      case 'Server Controller':
        return <Cpu className="w-4 h-4" />;
    }
  };

  return (
    <header id="app-header" className="bg-[#0c1017] border-b border-[#1c2432] text-slate-100 sticky top-0 z-40 font-sans">
      {/* Top Bar Contract: Brand, Nav & Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                Autonomous Fleet & Cleanliness Network
              </h1>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Pega Blueprint BP-2478030
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Electric Fleet Logistics & Smart City Infrastructure
            </p>
          </div>
        </div>

        {/* Status Metrics & Actions Zone */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* How It Works Button */}
          {onOpenGuide && (
            <button
              id="btn-header-how-it-works"
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141a24] hover:bg-[#1a2332] text-slate-200 hover:text-white border border-[#253246] text-xs font-medium transition-colors cursor-pointer"
              title="Learn how this smart waste system works in plain English"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>How It Works</span>
            </button>
          )}

          {/* Area Selector */}
          {onOpenAreaModal && (
            <button
              id="btn-header-select-area"
              onClick={onOpenAreaModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141a24] hover:bg-[#1a2332] text-slate-200 hover:text-white border border-[#253246] text-xs font-medium transition-colors cursor-pointer"
              title="Click to select another municipal area"
            >
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Area:</span>
              <span className="font-mono text-slate-300 font-semibold">
                {currentAreaName.split('&')[0].trim()}
              </span>
            </button>
          )}

          {/* Active Fleet count */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121721] border border-[#202938] text-slate-300 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Fleet: <strong className="text-white">{activeTruckCount} Active</strong></span>
          </div>

          {/* Critical Bins count */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121721] border border-[#202938] text-slate-300 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${criticalBinCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span>Urgent: <strong className={criticalBinCount > 0 ? 'text-amber-400' : 'text-slate-300'}>{criticalBinCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Persona Role Channels Bar */}
      <div className="bg-[#090d14] border-t border-[#18212e] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-2">
          <div className="flex items-center gap-1 min-w-max">
            <span className="text-[11px] font-semibold text-slate-400 mr-2 flex items-center gap-1 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-slate-500" /> Operations Roles:
            </span>
            {personas.map((persona) => {
              const isActive = currentPersona === persona.role;
              return (
                <button
                  key={persona.role}
                  id={`persona-btn-${persona.role.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectPersona(persona.role)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b26]'
                  }`}
                  title={`${persona.name} — ${persona.channel}`}
                >
                  {getPersonaIcon(persona.role)}
                  <span>{persona.role}</span>
                  {isActive && (
                    <span className="hidden lg:inline text-[10px] opacity-80 pl-1 border-l border-white/20">
                      {persona.name.split(' ')[0]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
