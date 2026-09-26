import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Fuel, 
  Leaf, 
  Truck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Zap, 
  RotateCcw 
} from 'lucide-react';
import { SmartBin, TruckAgent, CollectionRoute } from '../types';

interface SupervisorViewProps {
  bins: SmartBin[];
  trucks: TruckAgent[];
  activeRoute: CollectionRoute | null;
  onDispatchRoute: () => void;
  onEmergencyRecall: () => void;
  onCollectBin?: (binId: string) => void;
}

export const SupervisorView: React.FC<SupervisorViewProps> = ({
  bins,
  trucks,
  activeRoute,
  onDispatchRoute,
  onEmergencyRecall,
  onCollectBin,
}) => {
  const full100Bins = bins.filter((b) => b.fillLevel >= 100);
  const criticalBins = bins.filter((b) => b.fillLevel >= 85 || b.bidPriority === 'critical');
  const totalBins = bins.length;
  const avgFillLevel = Math.round(bins.reduce((acc, b) => acc + b.fillLevel, 0) / totalBins);
  const activeTrucksCount = trucks.filter((t) => t.status !== 'maintenance' && t.status !== 'idle').length;

  return (
    <div id="supervisor-dashboard" className="space-y-5 font-sans">
      {/* 100% Full Capacity Alert */}
      {full100Bins.length > 0 && (
        <div className="bg-[#1f1218] border border-rose-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-rose-200">
                  {full100Bins.length} Smart Bin(s) at 100% Full Capacity
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  ZERO-OVERFLOW MANDATE
                </span>
              </div>
              <p className="text-xs text-rose-100/80 mt-0.5">
                Target bins: <strong>{full100Bins.map(b => `${b.id} (${b.name})`).join(', ')}</strong>. Dispatched for immediate autonomous collection.
              </p>
            </div>
          </div>

          {onCollectBin && (
            <button
              onClick={() => full100Bins.forEach(b => onCollectBin(b.id))}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Collect All 100% Full Bins</span>
            </button>
          )}
        </div>
      )}

      {/* Top Operations KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#0e141d] border border-[#1e2634] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Fleet Eco-Efficiency</span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <Leaf className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">96.4%</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +4.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">vs static fixed schedules</p>
        </div>

        <div className="bg-[#0e141d] border border-[#1e2634] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Fuel & Energy Saved</span>
            <span className="p-1 rounded-md bg-blue-500/10 text-blue-400">
              <Zap className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-300 tabular-nums">142 kWh</span>
            <span className="text-xs font-medium text-slate-400 font-mono">0.0L Diesel</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Electric EV fleet reduction</p>
        </div>

        <div className="bg-[#0e141d] border border-[#1e2634] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">CO2 Avoided</span>
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <Leaf className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">386.4 kg</span>
            <span className="text-xs font-medium text-emerald-400">Net-Zero</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Daily municipal savings</p>
        </div>

        <div className="bg-[#0e141d] border border-[#1e2634] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Citywide Avg Fill</span>
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{avgFillLevel}%</span>
            <span className={`text-xs font-medium ${criticalBins.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {criticalBins.length} urgent
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{totalBins} connected IoT sensors</p>
        </div>
      </div>

      {/* Primary Grid: Active Collection Route and Fleet Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Active Route Management (2 cols) */}
        <div className="lg:col-span-2 bg-[#0e141d] border border-[#1e2634] rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b2432] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Daily Autonomous Route Dispatch</h3>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                  {activeRoute ? activeRoute.status.toUpperCase() : 'NO ROUTE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeRoute ? `Assigned to ${activeRoute.truckName} · ${activeRoute.waypoints.length} pickups scheduled` : 'Pending multi-agent auction completion'}
              </p>
            </div>

            {/* Supervisor Control Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onDispatchRoute}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Dispatch</span>
              </button>
              <button
                onClick={onEmergencyRecall}
                className="px-3 py-1.5 rounded-lg bg-[#161c26] hover:bg-[#202836] text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Recall to Depot</span>
              </button>
            </div>
          </div>

          {activeRoute && (
            <div className="space-y-3">
              {/* Route Metric summary row */}
              <div className="grid grid-cols-3 gap-3 bg-[#0a0f16] rounded-xl p-3 border border-[#1a2330] text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Total Loop Distance:</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5 tabular-nums">{activeRoute.totalDistanceKm} km</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Est. Battery Draw:</span>
                  <div className="text-sm font-bold font-mono text-blue-300 mt-0.5 tabular-nums">{activeRoute.actualEnergyKwh} kWh</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Optimization Rating:</span>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">{activeRoute.efficiencyScore}%</div>
                </div>
              </div>

              {/* Waypoints Sequence list */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Waypoint Sequence & Verification Handshake:
                </span>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activeRoute.waypoints.map((wp, idx) => {
                    const isDone = wp.status === 'completed';
                    const isApproaching = wp.status === 'approaching';

                    return (
                      <div
                        key={wp.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                          isDone
                            ? 'bg-[#0c1a15] border-emerald-500/30 text-slate-300'
                            : isApproaching
                            ? 'bg-[#101b2a] border-blue-500/40 text-white shadow-sm'
                            : 'bg-[#0c1017] border-[#1c2432] text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            isDone ? 'bg-emerald-500 text-slate-950' : isApproaching ? 'bg-blue-600 text-white' : 'bg-[#18212e] text-slate-400'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{wp.binName}</span>
                              <span className="text-[10px] font-mono px-1.5 rounded bg-[#18212e] text-slate-300">
                                {wp.wasteType}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {wp.address} · Est. Weight: <strong className="text-slate-200">{wp.estimatedWeightKg} kg</strong>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-[11px] font-mono font-medium block ${
                            isDone ? 'text-emerald-400' : isApproaching ? 'text-blue-300 font-semibold' : 'text-slate-500'
                          }`}>
                            {isDone ? `Serviced (${wp.collectedWeightKg} kg)` : isApproaching ? `ETA ${wp.etaMinutes}m` : `In Queue`}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono tabular-nums">
                            Fill: {wp.fillLevelSnapshot}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Autonomous Fleet Vehicle Roster (1 col) */}
        <div className="bg-[#0e141d] border border-[#1e2634] rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#1b2432] pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <h4 className="text-sm font-bold text-white">Autonomous Fleet Units ({trucks.length})</h4>
            </div>
            <span className="text-xs text-blue-400 font-mono tabular-nums">{activeTrucksCount} Active</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {trucks.map((truck) => {
              const isMoving = truck.status === 'collecting' || truck.status === 'en_route';
              return (
                <div
                  key={truck.id}
                  className="p-3 bg-[#0a0f16] border border-[#1b2432] rounded-xl text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{truck.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">{truck.model.split(' ')[0]}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      isMoving ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : 'bg-[#161f2c] text-slate-400'
                    }`}>
                      {truck.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                    <div>
                      Battery: <strong className="text-emerald-400 tabular-nums">{truck.batteryLevel}%</strong>
                    </div>
                    <div>
                      Load: <strong className="text-slate-200 tabular-nums">{truck.currentLoadKg}/{truck.maxCapacityKg} kg</strong>
                    </div>
                  </div>

                  <div className="w-full h-1 bg-[#16202c] rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${(truck.currentLoadKg / truck.maxCapacityKg) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
