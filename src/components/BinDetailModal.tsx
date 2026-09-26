import React from 'react';
import { 
  X, 
  Trash2, 
  Battery, 
  Thermometer, 
  Wind, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  RotateCw,
  Plus,
  Minus,
  Volume2
} from 'lucide-react';
import { SmartBin } from '../types';
import { VisualTrashCan } from './VisualTrashCan';
import { speak, playAudioBeep } from '../utils/voiceGuide';

interface BinDetailModalProps {
  bin: SmartBin | null;
  onClose: () => void;
  onUpdateFill: (binId: string, newFill: number) => void;
  onToggleLid: (binId: string) => void;
  onTriggerPriorityBid: (binId: string) => void;
  onCollectBin?: (binId: string) => void;
  isCollecting?: boolean;
}

export const BinDetailModal: React.FC<BinDetailModalProps> = ({
  bin,
  onClose,
  onUpdateFill,
  onToggleLid,
  onTriggerPriorityBid,
  onCollectBin,
  isCollecting = false,
}) => {
  if (!bin) return null;

  const isFull100 = bin.fillLevel >= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        id="bin-detail-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${isFull100 ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{bin.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {bin.id}
                </span>
                {isFull100 && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    100% FULL
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{bin.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playAudioBeep('click');
                speak(`${bin.name}. ${bin.fillLevel} percent full. Lid is ${bin.lidStatus}.`);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white transition-colors cursor-pointer"
              title="Speak status aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Active Sensor Alerts & Citizen Reports */}
          {bin.sensorAlerts && bin.sensorAlerts.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Active Node Alerts & Citizen Reports ({bin.sensorAlerts.length}):
              </span>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {bin.sensorAlerts.map((alert, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2 shadow-sm">
                    <span className="shrink-0 mt-0.5">📢</span>
                    <span className="leading-relaxed">{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 100% Capacity Alert Banner */}
          {isFull100 && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/60 to-purple-950/60 border border-rose-500/40 text-slate-200 flex items-start gap-3 shadow-lg">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1">
                <div className="font-bold text-rose-200 flex items-center gap-2">
                  <span>Mandatory Collection Rule Triggered</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300">
                    ZERO OVERFLOW
                  </span>
                </div>
                <p className="text-[11px] text-rose-100/90 leading-relaxed">
                  This bin reached <strong>100% capacity</strong>. In accordance with autonomous policy, it is prioritized for collection by an autonomous truck agent to prevent street overflow.
                </p>
                {onCollectBin && (
                  <button
                    onClick={() => onCollectBin(bin.id)}
                    disabled={isCollecting}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/20 disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isCollecting ? 'animate-spin' : ''}`} />
                    <span>{isCollecting ? 'Robotic Arm Servicing Bin...' : 'Collect & Empty Bin Now (0%)'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Fill Level Meter & Interactive Controls */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center gap-4">
              {/* Big Visual Trash Can graphic with face */}
              <div className="shrink-0">
                <VisualTrashCan fillLevel={bin.fillLevel} name={bin.name} size="md" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300">Ultrasonic Fill Depth:</span>
                  <span className={`text-base font-mono font-bold ${bin.fillLevel >= 100 ? 'text-rose-400 animate-pulse' : bin.fillLevel >= 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {bin.fillLevel}% ({Math.round((bin.fillLevel / 100) * bin.capacityLiters)} / {bin.capacityLiters} L)
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      bin.fillLevel >= 100
                        ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 animate-pulse'
                        : bin.fillLevel >= 85
                        ? 'bg-rose-500'
                        : bin.fillLevel >= 65
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, bin.fillLevel)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400">
                  {bin.fillLevel >= 85 ? '⚠️ Bin is nearly overflowing! Truck priority active.' : '✓ Normal fill rate. Adequate capacity remaining.'}
                </p>
              </div>
            </div>

            {/* Quick Fill Adjustment Controls */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Simulate Waste Level:</span>
                <span className="text-[10px] text-slate-500 font-mono">Tap to test 100% collection rule</span>
              </div>
              
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => onUpdateFill(bin.id, 0)}
                  className="px-2 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors text-center"
                >
                  Empty (0%)
                </button>
                <button
                  onClick={() => onUpdateFill(bin.id, Math.max(0, bin.fillLevel - 20))}
                  className="px-2 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center justify-center gap-1"
                >
                  <Minus className="w-3 h-3" /> 20%
                </button>
                <button
                  onClick={() => onUpdateFill(bin.id, Math.min(100, bin.fillLevel + 20))}
                  className="px-2 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" /> 20%
                </button>
                <button
                  onClick={() => onUpdateFill(bin.id, 100)}
                  className="px-2 py-1.5 rounded-md bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs font-mono transition-colors shadow-sm shadow-rose-500/20 text-center"
                  title="Fills bin to 100% to trigger collection"
                >
                  Fill 100%
                </button>
              </div>
            </div>
          </div>

          {/* IoT Telemetry Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Battery className="w-3 h-3 text-emerald-400" /> Battery
              </span>
              <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">
                {bin.batteryLevel}%
              </span>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-amber-400" /> Temp
              </span>
              <span className="text-sm font-bold font-mono text-white mt-1 block">
                {bin.temperatureC}°C
              </span>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Wind className="w-3 h-3 text-cyan-400" /> Odor
              </span>
              <span className="text-sm font-bold font-mono text-cyan-300 mt-1 block">
                {bin.odorPpm} ppm
              </span>
            </div>
          </div>

          {/* Status & Lid Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Waste Stream:</span>
              <span className="font-semibold text-white uppercase font-mono">{bin.wasteType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Serviced:</span>
              <span className="text-slate-300">{bin.lastEmptied}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pneumatic Lid State:</span>
              <button
                onClick={() => onToggleLid(bin.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
                  bin.lidStatus === 'closed'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}
              >
                {bin.lidStatus.toUpperCase()} (Toggle)
              </button>
            </div>
          </div>

          {/* Action to trigger priority negotiation bid or instant collection */}
          <div className="pt-2">
            {isFull100 && onCollectBin ? (
              <button
                onClick={() => onCollectBin(bin.id)}
                disabled={isCollecting}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 text-slate-950 ${isCollecting ? 'animate-spin' : ''}`} />
                <span>{isCollecting ? 'Autonomous Truck Compacting...' : 'Collect 100% Full Bin Now (Reset to 0%)'}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onTriggerPriorityBid(bin.id);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Broadcast Priority Collection Bid</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
