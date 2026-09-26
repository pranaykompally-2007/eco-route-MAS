import React from 'react';
import { 
  X, 
  Truck, 
  Battery, 
  Gauge, 
  Cpu, 
  CheckCircle2, 
  Zap, 
  RotateCw,
  Scale
} from 'lucide-react';
import { TruckAgent } from '../types';

interface TruckDetailModalProps {
  truck: TruckAgent | null;
  onClose: () => void;
  onRecharge: (truckId: string) => void;
  onToggleMode: (truckId: string) => void;
}

export const TruckDetailModal: React.FC<TruckDetailModalProps> = ({
  truck,
  onClose,
  onRecharge,
  onToggleMode,
}) => {
  if (!truck) return null;

  const payloadPct = Math.round((truck.currentLoadKg / truck.maxPayloadKg) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        id="truck-detail-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{truck.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {truck.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{truck.model}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Payload Progress */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-cyan-400" /> Current Hopper Payload:
              </span>
              <span className="font-mono text-white font-bold">
                {truck.currentLoadKg} / {truck.maxPayloadKg} kg ({payloadPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${payloadPct}%` }}
              />
            </div>
          </div>

          {/* Battery & Powertrain */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery Charge
              </span>
              <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                {truck.batteryLevel}%
              </span>
              <button
                onClick={() => onRecharge(truck.id)}
                className="mt-2 text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-mono transition-colors"
              >
                + Fast Charge 100%
              </button>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Operation Mode
              </span>
              <span className="text-xs font-bold font-mono text-cyan-300 mt-1 block capitalize">
                {truck.driverAgentMode.replace('_', ' ')}
              </span>
              <button
                onClick={() => onToggleMode(truck.id)}
                className="mt-2 text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono transition-colors"
              >
                Toggle Override
              </button>
            </div>
          </div>

          {/* Status & Robotic Arm Details */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Fleet Status:</span>
              <span className="font-semibold text-white uppercase font-mono">{truck.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Robotic Arm Actuator:</span>
              <span className="text-amber-300 font-mono capitalize">{truck.roboticArmStatus}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Completed Pickups:</span>
              <span className="text-slate-200 font-mono">{truck.completedPickups} Smart Bins</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Close Telemetry Modal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
