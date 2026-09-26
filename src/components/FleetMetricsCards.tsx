import React from 'react';
import { 
  Truck, 
  Trash2, 
  BatteryCharging, 
  Leaf, 
  Navigation, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  TrendingUp,
  Radio
} from 'lucide-react';
import { SmartBin, TruckAgent, CollectionRoute } from '../types';

interface FleetMetricsCardsProps {
  bins: SmartBin[];
  trucks: TruckAgent[];
  activeRoute: CollectionRoute | null;
  collectionProgress: number;
}

export const FleetMetricsCards: React.FC<FleetMetricsCardsProps> = ({
  bins,
  trucks,
  activeRoute,
  collectionProgress,
}) => {
  const activeTrucks = trucks.filter((t) => t.status === 'routing' || t.status === 'servicing');
  const avgBattery = Math.round(
    trucks.reduce((acc, t) => acc + t.batteryLevel, 0) / (trucks.length || 1)
  );

  const fullBins = bins.filter((b) => b.fillLevel >= 85);
  const warningBins = bins.filter((b) => b.fillLevel >= 65 && b.fillLevel < 85);
  const cleanBins = bins.filter((b) => b.fillLevel < 65);
  const cleanPercentage = Math.round((cleanBins.length / (bins.length || 1)) * 100);

  const totalCarbonSaved = (bins.length * 4.2).toFixed(1);
  const avgFill = Math.round(
    bins.reduce((acc, b) => acc + b.fillLevel, 0) / (bins.length || 1)
  );

  const estimatedDuration = activeRoute 
    ? activeRoute.waypoints.reduce((acc, w) => acc + (w.etaMinutes || 6), 0)
    : 42;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      
      {/* CARD 1: Autonomous Fleet Telemetry */}
      <div className="bg-[#121721] border border-[#222a36] rounded-xl p-4 flex flex-col justify-between hover:border-[#2f3b4d] transition-colors shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold tracking-wide uppercase text-[11px] text-slate-300 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Autonomous Fleet</span>
          </span>
          <span className="text-[11px] font-mono text-blue-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Live Grid</span>
          </span>
        </div>

        <div className="my-3 flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {activeTrucks.length} <span className="text-xs font-normal text-slate-400">/ {trucks.length} Active</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              100% Electric Robotic Units
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums flex items-center justify-end gap-1">
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>{avgBattery}%</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Avg Battery</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#1c2430] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Capacity In-Use:</span>
          <span className="text-slate-200 font-semibold tabular-nums">
            {trucks[0]?.currentLoadKg || 420} / {trucks[0]?.maxPayloadKg || 2500} kg
          </span>
        </div>
      </div>

      {/* CARD 2: Smart Bin Network Health */}
      <div className="bg-[#121721] border border-[#222a36] rounded-xl p-4 flex flex-col justify-between hover:border-[#2f3b4d] transition-colors shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold tracking-wide uppercase text-[11px] text-slate-300 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cleanliness Rating</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-emerald-400 tabular-nums">
            {cleanPercentage}% Clean
          </span>
        </div>

        <div className="my-3 flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {cleanBins.length} <span className="text-xs font-normal text-slate-400">/ {bins.length} Bins</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Network Avg Fill: <strong className="text-slate-200 font-mono">{avgFill}%</strong>
            </div>
          </div>
          
          <div className="text-right">
            {fullBins.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                <AlertCircle className="w-3 h-3" />
                <span>{fullBins.length} Urgent</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                <span>All Nominal</span>
              </span>
            )}
          </div>
        </div>

        {/* Minimal High-Contrast Progress Bar */}
        <div className="pt-2 border-t border-[#1c2430] space-y-1">
          <div className="w-full h-1.5 bg-[#1b222c] rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${(cleanBins.length / bins.length) * 100}%` }}
              title="Clean Bins (<65%)"
            />
            <div 
              className="bg-amber-400 h-full transition-all duration-500" 
              style={{ width: `${(warningBins.length / bins.length) * 100}%` }}
              title="Warning Bins (65-84%)"
            />
            <div 
              className="bg-rose-500 h-full transition-all duration-500" 
              style={{ width: `${(fullBins.length / bins.length) * 100}%` }}
              title="Critical Bins (≥85%)"
            />
          </div>
        </div>
      </div>

      {/* CARD 3: Ecological Savings & Energy Efficiency */}
      <div className="bg-[#121721] border border-[#222a36] rounded-xl p-4 flex flex-col justify-between hover:border-[#2f3b4d] transition-colors shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold tracking-wide uppercase text-[11px] text-slate-300 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Eco Optimization</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-[#19222e] px-1.5 py-0.5 rounded">
            Zero-Diesel
          </span>
        </div>

        <div className="my-3 flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400 tabular-nums">
              +{totalCarbonSaved} <span className="text-xs font-normal text-slate-400">kg CO₂</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Net Avoided Greenhouse Gas
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold font-mono text-blue-400 tabular-nums">
              38.4%
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Detour Cut</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#1c2430] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Electric Draw:</span>
          <span className="text-slate-200 font-semibold tabular-nums">
            18.2 kWh / 100 km
          </span>
        </div>
      </div>

      {/* CARD 4: Active Route & Multi-Agent Dispatch */}
      <div className="bg-[#121721] border border-[#222a36] rounded-xl p-4 flex flex-col justify-between hover:border-[#2f3b4d] transition-colors shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold tracking-wide uppercase text-[11px] text-slate-300 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Dispatch</span>
          </span>
          <span className="text-[11px] font-mono text-blue-400 font-bold tabular-nums">
            {Math.round(collectionProgress)}% Waypoints
          </span>
        </div>

        <div className="my-3 flex items-baseline justify-between">
          <div>
            <div className="text-lg font-bold font-mono tracking-tight text-white truncate max-w-[170px]">
              {activeRoute ? activeRoute.routeId : 'ROUTE-ALPHA-01'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Next: <span className="text-blue-300 font-medium">{bins[0]?.name || 'Metro Plaza'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-slate-200">
              {activeRoute ? `${activeRoute.waypoints.length} stops` : '5 stops'}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Optimal Path</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#1c2430] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Est. Route Time:</span>
          <span className="text-slate-200 font-semibold tabular-nums">
            {estimatedDuration} min
          </span>
        </div>
      </div>

    </div>
  );
};
