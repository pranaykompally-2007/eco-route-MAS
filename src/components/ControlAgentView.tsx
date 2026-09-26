import React, { useState } from 'react';
import { 
  Cpu, 
  Sliders, 
  Activity, 
  Zap, 
  Radio, 
  RefreshCw, 
  Terminal, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Truck,
  Trash2,
  MapPin,
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';
import { SmartBin, TruckAgent, ResidentReport } from '../types';

interface ControlAgentViewProps {
  bins: SmartBin[];
  trucks: TruckAgent[];
  reports: ResidentReport[];
  onTriggerAuction: () => void;
  isNegotiating: boolean;
  onFillBinTo100?: () => void;
  autoCollectOn100?: boolean;
  onToggleAutoCollect?: () => void;
  onReplaceBinFromReport: (reportId: string, binId: string) => void;
  onDispatchFromReport?: (reportId: string, binId: string) => void;
}

export const ControlAgentView: React.FC<ControlAgentViewProps> = ({
  bins,
  trucks,
  reports,
  onTriggerAuction,
  isNegotiating,
  onFillBinTo100,
  autoCollectOn100 = true,
  onToggleAutoCollect,
  onReplaceBinFromReport,
  onDispatchFromReport,
}) => {
  // Auction hyperparameters state
  const [fillThreshold, setFillThreshold] = useState<number>(75);
  const [distancePenalty, setDistancePenalty] = useState<number>(1.5);
  const [carbonWeight, setCarbonWeight] = useState<number>(85);
  const [residentBoost, setResidentBoost] = useState<number>(25);

  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'replaced'>('all');
  const [replacingReportId, setReplacingReportId] = useState<string | null>(null);

  // Simulated live event stream
  const [eventLogs, setEventLogs] = useState<Array<{ id: string; time: string; source: string; msg: string; type: 'info' | 'bid' | 'alert' | 'replace' }>>([
    { id: '1', time: '11:04:12', source: 'SERVER_CONTROLLER', msg: 'Core service bus active: Ingesting citizen reports and autonomous telemetry.', type: 'info' },
    { id: '2', time: '11:04:15', source: 'BIN-108', msg: 'Broadcast bid: fill 95%, critical urgency flag set (+30 pts)', type: 'bid' },
    { id: '3', time: '11:04:18', source: 'TRUCK-01', msg: 'Computed marginal route detour: 1.8 km, 1.4 kWh delta', type: 'info' },
    { id: '4', time: '11:04:22', source: 'ORCHESTRATOR', msg: 'Bid consensus reached: BIN-108 assigned to Unit Alpha', type: 'bid' },
    { id: '5', time: '11:04:28', source: 'SERVER_CONTROLLER', msg: 'Citizen report listener online: Ready to replace reported damaged bins.', type: 'replace' },
  ]);

  const handleReplaceAction = (reportId: string, binId: string) => {
    setReplacingReportId(reportId);
    setTimeout(() => {
      onReplaceBinFromReport(reportId, binId);
      setReplacingReportId(null);
      setEventLogs((prev) => [
        {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString(),
          source: 'SERVER_CONTROLLER',
          msg: `Replacement Executed: Bin ${binId} replaced with clean calibrated unit per citizen report ${reportId}.`,
          type: 'replace',
        },
        ...prev,
      ]);
    }, 500);
  };

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'pending') return r.status !== 'replaced' && r.status !== 'resolved';
    if (reportFilter === 'replaced') return r.status === 'replaced' || r.status === 'resolved';
    return true;
  });

  const pendingCount = reports.filter((r) => r.status !== 'replaced' && r.status !== 'resolved').length;

  return (
    <div id="server-controller-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Server Controller & Dispatch Orchestrator</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                CENTRAL SERVER ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Citizen Report Ingestion • Automated Bin Replacement • Multi-Agent Auction Optimization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onFillBinTo100 && (
            <button
              onClick={onFillBinTo100}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              title="Test: Force fill a bin to 100% capacity"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate 100% Fill</span>
            </button>
          )}

          <button
            id="btn-server-trigger-auction"
            onClick={onTriggerAuction}
            disabled={isNegotiating}
            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 active:bg-purple-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isNegotiating ? 'animate-spin' : ''}`} />
            <span>Execute Multi-Agent Cycle</span>
          </button>
        </div>
      </div>

      {/* Plain English Guide Callout */}
      <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-purple-200 shadow-sm">
        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-white text-xs">What does the Server Controller do?</h4>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            The Server Controller acts as the central brain of the city. When citizens report broken bins or overflowing trash, the reports arrive here. 
            With 1 tap on <strong>"Authorize & Replace Bin Node"</strong>, the server automatically deploys a fresh calibrated unit, resets fill to 0%, and resolves the report. It also calculates the greenest pickup paths for electric robot trucks.
          </p>
        </div>
      </div>

      {/* Citizen Reports Intake & Server Replacement Console */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white">
                Citizen Reports Ingested by Server Controller ({reports.length})
              </h4>
              {pendingCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold animate-pulse">
                  {pendingCount} AWAITING REPLACEMENT / ACTION
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reports submitted by city residents are sent directly here to Server Controller. Authorize replacements or dispatch autonomous service.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setReportFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                reportFilter === 'all' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setReportFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                reportFilter === 'pending' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Action Required ({pendingCount})
            </button>
            <button
              onClick={() => setReportFilter('replaced')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                reportFilter === 'replaced' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Replaced / Resolved ({reports.filter(r => r.status === 'replaced' || r.status === 'resolved').length})
            </button>
          </div>
        </div>

        {/* Reports Grid with Replacement Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredReports.length === 0 ? (
            <div className="col-span-3 py-10 text-center text-slate-500 text-xs font-mono">
              No reports found in this view. Submit a new report in the City Resident portal to send it to Server Controller.
            </div>
          ) : (
            filteredReports.map((report) => {
              const targetBin = bins.find((b) => b.id === report.binId);
              const isReplaced = report.status === 'replaced' || report.status === 'resolved';
              const isActioning = replacingReportId === report.id;

              return (
                <div
                  key={report.id}
                  className={`rounded-2xl border p-4 space-y-3 flex flex-col justify-between transition-all ${
                    isReplaced
                      ? 'bg-slate-950/50 border-slate-800/80 opacity-85'
                      : 'bg-slate-950/90 border-purple-500/40 shadow-lg shadow-purple-500/5 ring-1 ring-purple-500/20'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header info */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {report.id}
                        </span>
                        <span className="text-[10px] text-slate-400">{report.timestamp}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                        isReplaced 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {isReplaced ? '✓ REPLACED' : '⚡ PENDING REPLACEMENT'}
                      </span>
                    </div>

                    {/* Submitter & Target Bin */}
                    <div className="text-xs space-y-1">
                      <div className="text-slate-300 font-semibold flex items-center justify-between">
                        <span>Citizen: <strong className="text-white">{report.residentName}</strong></span>
                        <span className="text-[10px] text-purple-300 font-mono">+{report.rewardPoints} pts awarded</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1 truncate max-w-[170px]">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="text-slate-200 font-medium truncate">
                            {report.binId} {targetBin ? `• ${targetBin.name}` : ''}
                          </span>
                        </span>
                        <span className={`font-mono text-[10px] font-bold ${
                          (targetBin?.fillLevel || 0) >= 85 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {targetBin ? `${targetBin.fillLevel}% Fill` : 'Node Active'}
                        </span>
                      </div>
                    </div>

                    {/* Citizen's Reported Description */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/20 text-xs">
                      <div className="text-[10px] text-purple-300 font-mono uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                        <MessageSquare className="w-3 h-3 text-purple-400" />
                        <span>Resident Description:</span>
                      </div>
                      <p className="text-slate-200 italic leading-relaxed text-[11px] line-clamp-3">
                        "{report.description}"
                      </p>
                    </div>
                  </div>

                  {/* Server Controller Action: Replace Bin */}
                  <div className="pt-2 border-t border-slate-800/80">
                    {isReplaced ? (
                      <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Replaced & Zero-Overflow Calibrated</span>
                        </span>
                        <button
                          onClick={() => handleReplaceAction(report.id, report.binId)}
                          className="text-[10px] text-slate-400 hover:text-white underline"
                          title="Re-execute replacement"
                        >
                          Re-swap
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`btn-replace-bin-${report.id}`}
                        onClick={() => handleReplaceAction(report.id, report.binId)}
                        disabled={isActioning}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-emerald-500 hover:brightness-110 active:brightness-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-500/20 cursor-pointer disabled:opacity-50"
                      >
                        {isActioning ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            <span>Server Controller Replacing Bin...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Authorize & Replace Bin Node</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Secondary Grid: Algorithm Tuning & Live Event Bus Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Negotiation Hyperparameters & Rules (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Server Controller Optimization Parameters</span>
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              Autonomous Policy v3.2
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Fill Threshold Slider */}
            <div>
              <div className="flex justify-between items-center mb-1 font-mono">
                <span className="text-slate-300">Auto-Dispatch Fill Threshold:</span>
                <span className="text-purple-300 font-bold">{fillThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={fillThreshold}
                onChange={(e) => setFillThreshold(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Bins exceeding {fillThreshold}% automatically post urgent auction requests to server bus.
              </span>
            </div>

            {/* Resident Report Urgency Boost */}
            <div>
              <div className="flex justify-between items-center mb-1 font-mono">
                <span className="text-slate-300">Citizen Report Priority Urgency Boost:</span>
                <span className="text-purple-300 font-bold">+{residentBoost} pts</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={residentBoost}
                onChange={(e) => setResidentBoost(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Adds an instant +{residentBoost} priority delta to bins reported by city residents.
              </span>
            </div>

            {/* Distance Penalty Slider */}
            <div>
              <div className="flex justify-between items-center mb-1 font-mono">
                <span className="text-slate-300">Detour Distance Penalty Factor:</span>
                <span className="text-purple-300 font-bold">{distancePenalty}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={distancePenalty}
                onChange={(e) => setDistancePenalty(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Weights marginal kWh expenditure against collection urgency during auction.
              </span>
            </div>

            {/* Zero-Overflow Automatic Dispatch Toggle */}
            {onToggleAutoCollect && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Zero-Overflow Instant Dispatch</span>
                  <span className="text-[10px] text-slate-400">Trigger immediate truck route when bin reaches 100% capacity</span>
                </div>
                <button
                  type="button"
                  onClick={onToggleAutoCollect}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    autoCollectOn100 ? 'bg-purple-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    autoCollectOn100 ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Service Bus & Replacement Event Stream (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Server Controller Event Stream</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </span>
            </div>

            {/* Terminal Window */}
            <div className="bg-slate-950 rounded-xl p-3 font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-2 border border-slate-800 mt-3">
              {eventLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-[11px] leading-relaxed">
                  <span className="text-slate-500 shrink-0">[{log.time}]</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] shrink-0 font-bold ${
                    log.type === 'replace'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : log.type === 'alert'
                      ? 'bg-rose-500/20 text-rose-300'
                      : log.type === 'bid'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {log.source}
                  </span>
                  <span className={log.type === 'replace' ? 'text-purple-200 font-semibold' : 'text-slate-300'}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-800">
            <span>Server Bus Protocol: <strong className="text-white">ZeroMQ / Pega Event Stream</strong></span>
            <span>Latency: <strong className="text-emerald-400">12 ms</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};
