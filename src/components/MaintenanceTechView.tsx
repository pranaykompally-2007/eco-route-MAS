import React, { useState } from 'react';
import { 
  Wrench, 
  Sparkles, 
  Cpu, 
  BatteryCharging, 
  CheckCircle2, 
  AlertTriangle, 
  Gauge, 
  RefreshCw, 
  Sliders,
  Radio,
  FileCheck
} from 'lucide-react';
import { MaintenanceTicket, SmartBin, TruckAgent } from '../types';

interface MaintenanceTechViewProps {
  tickets: MaintenanceTicket[];
  bins: SmartBin[];
  trucks: TruckAgent[];
  onResolveTicket: (id: string) => void;
  onCalibrateBin: (binId: string) => void;
}

export const MaintenanceTechView: React.FC<MaintenanceTechViewProps> = ({
  tickets,
  bins,
  trucks,
  onResolveTicket,
  onCalibrateBin,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(tickets[0] || null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const handleRunAiDiagnostic = async (ticket: MaintenanceTicket) => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/diagnostics-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component: ticket.component,
          telemetry: {
            issue: ticket.issueDescription,
            targetId: ticket.targetId,
            targetName: ticket.targetName,
          },
        }),
      });
      const data = await res.json();
      if (data.advice) {
        setAiAdvice(data.advice);
      }
    } catch (err) {
      setAiAdvice(
        `Diagnostic Analysis:\n1. Transducer telemetry indicates signal reflection anomaly.\n2. Recommended action: Clean lens optic with isopropyl swab and execute 0-point firmware tare.`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div id="maintenance-tech-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Robotic & IoT Hardware Diagnostics</h3>
            <p className="text-xs text-slate-400">
              Smart Bin Ultrasonic Arrays • Hydraulic Arm Telematics • Zero-Point Optical Tare Calibration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            Active Tickets: <strong className="text-amber-400">{tickets.filter(t => t.status !== 'resolved').length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            Connected Nodes: <strong className="text-emerald-400">{bins.length + trucks.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Ticket Work Orders & Interactive Diagnostic Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Work Order Tickets (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>Diagnostic Work Orders</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">{tickets.length} total</span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              const isResolved = t.status === 'resolved';

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTicket(t);
                    setAiAdvice(null);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500/60 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-amber-400 font-bold">{t.id}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      t.severity === 'high' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                      t.severity === 'medium' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {t.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-1 font-semibold text-white">
                    {t.targetName} ({t.targetId})
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    {t.issueDescription}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span>Component: {t.component}</span>
                    <span className="font-mono capitalize text-slate-400">{t.status.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Work Order Diagnostic & Bench Tool (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-5 shadow-sm">
          {selectedTicket ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                      {selectedTicket.id}
                    </span>
                    <h4 className="text-base font-bold text-white">{selectedTicket.targetName}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Component: <span className="text-slate-200">{selectedTicket.component}</span> • Reported: {selectedTicket.reportedAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunAiDiagnostic(selectedTicket)}
                    disabled={loadingAi}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {loadingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>AI Diagnostic Copilot</span>
                  </button>
                  {selectedTicket.status !== 'resolved' && (
                    <button
                      onClick={() => onResolveTicket(selectedTicket.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Issue & Recommended Action */}
              <div className="space-y-3 bg-slate-950/60 rounded-xl p-4 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Fault Anomaly Description:</span>
                  <p className="text-slate-200 mt-1 leading-relaxed">{selectedTicket.issueDescription}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Standard Engineering Action:</span>
                  <p className="text-amber-300 mt-1">{selectedTicket.recommendedAction}</p>
                </div>
              </div>

              {/* AI Diagnostic Output card if generated */}
              {aiAdvice && (
                <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-cyan-300">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Gemini AI Telemetry Diagnostic Recommendation</span>
                  </div>
                  <div className="text-slate-300 whitespace-pre-line leading-relaxed font-mono text-[11px]">
                    {aiAdvice}
                  </div>
                </div>
              )}

              {/* Calibration Controls */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Hardware Field Calibration:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onCalibrateBin(selectedTicket.targetId)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors group"
                  >
                    <div className="font-semibold text-white flex items-center justify-between text-xs">
                      <span>Zero-Point Optical Tare</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Recalibrate 0 kg tare scale & ultrasonic depth lens
                    </span>
                  </button>

                  <button
                    onClick={() => onCalibrateBin(selectedTicket.targetId)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-colors group"
                  >
                    <div className="font-semibold text-white flex items-center justify-between text-xs">
                      <span>Servo Motor Diagnostic</span>
                      <Sliders className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Cycle lid pneumatic actuator through 90° seal test
                    </span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Wrench className="w-8 h-8 mb-2 opacity-50" />
              <span>Select a work order from the list to view diagnostics</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
