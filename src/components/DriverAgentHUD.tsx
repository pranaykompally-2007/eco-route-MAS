import React, { useState } from 'react';
import { 
  Truck, 
  Eye, 
  Radio, 
  Cpu, 
  AlertOctagon, 
  CheckCircle2, 
  RotateCw, 
  Compass, 
  Gauge, 
  Crosshair, 
  Zap,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { TruckAgent, RouteWaypoint, CollectionRoute } from '../types';

interface DriverAgentHUDProps {
  truck: TruckAgent;
  activeRoute: CollectionRoute | null;
  onAdvanceWaypoint: () => void;
  onToggleMode: () => void;
  onSimulateObstruction: () => void;
}

export const DriverAgentHUD: React.FC<DriverAgentHUDProps> = ({
  truck,
  activeRoute,
  onAdvanceWaypoint,
  onToggleMode,
  onSimulateObstruction,
}) => {
  const [armPhase, setArmPhase] = useState<number>(1);
  const [isArmCycling, setIsArmCycling] = useState<boolean>(false);

  const activeWaypoint = activeRoute?.waypoints.find(
    (wp) => wp.status === 'approaching' || wp.status === 'pending'
  );

  const handleCycleArm = () => {
    setIsArmCycling(true);
    let step = 1;
    const interval = setInterval(() => {
      step++;
      setArmPhase(step);
      if (step >= 6) {
        clearInterval(interval);
        setIsArmCycling(false);
        setArmPhase(1);
        onAdvanceWaypoint();
      }
    }, 1200);
  };

  const armSteps = [
    { title: 'Optical & LiDAR Lock', desc: 'Computer vision identifies smart bin QR & grab-rail coordinates' },
    { title: 'NFC/RF Security Handshake', desc: 'Exchange crypto token & read bin ultrasonic fill payload' },
    { title: 'Hydraulic Robotic Gripper', desc: 'Dual-clamp arm engages standard DIN EN 840 lifting trunnions' },
    { title: 'Dynamic Load-Cell Weighing', desc: 'Calibrated tare scale records gross waste mass' },
    { title: 'Invert & High-Density Compaction', desc: 'Waste dumped into hopper; hydraulic compaction ram cycles' },
    { title: 'Disengage & Ultrasonic Zero-Reset', desc: 'Bin returned safely to curb; reset fill level to 0%' },
  ];

  return (
    <div id="driver-agent-hud" className="space-y-6">
      {/* Top Teleoperation Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{truck.name} — Autonomous Driving Telematics</h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {truck.driverAgentMode.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Vehicle Model: {truck.model} • Powertrain: {truck.powertrain}
            </p>
          </div>
        </div>

        {/* HUD Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMode}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Switch: {truck.driverAgentMode === 'autonomous' ? 'Teleoperation' : 'Autonomous'}</span>
          </button>
          <button
            onClick={onSimulateObstruction}
            className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Street Obstacle</span>
          </button>
        </div>
      </div>

      {/* Primary Cockpit HUD: LiDAR / Camera View & Next Waypoint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Synthetic Forward LiDAR & Path Planning (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-xl h-96 flex flex-col justify-between p-4">
          
          {/* HUD Top Overlays */}
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 z-10">
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md border border-cyan-500/30">
              <Crosshair className="w-3.5 h-3.5 animate-spin" />
              <span>LIDAR 360° ARRAY: ACTIVE</span>
            </div>
            <div className="bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
              <span>LAT: 37.7790° N | LNG: 122.4140° W</span>
            </div>
          </div>

          {/* Graphical LiDAR Corridor Graphics */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-80 h-80 border border-cyan-500/40 rounded-full flex items-center justify-center animate-ping" style={{ animationDuration: '4s' }}>
              <div className="w-56 h-56 border border-cyan-400/30 rounded-full flex items-center justify-center">
                <div className="w-32 h-32 border border-cyan-300/20 rounded-full" />
              </div>
            </div>
            {/* Driving corridor lines */}
            <div className="absolute h-full w-48 border-x border-dashed border-cyan-500/40" />
          </div>

          {/* Central Target Reticle & Next Smart Bin Lock */}
          <div className="my-auto text-center z-10 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-200 text-xs font-mono backdrop-blur">
              <Crosshair className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>
                TARGET LOCK: {activeWaypoint ? activeWaypoint.binId : 'RETURNING TO DEPOT'}
              </span>
            </div>
            {activeWaypoint && (
              <p className="text-xs text-slate-300 font-mono">
                {activeWaypoint.binName} • Approaching Distance: {activeWaypoint.distanceFromPrevKm} km • ETA {activeWaypoint.etaMinutes} min
              </p>
            )}
          </div>

          {/* HUD Bottom Telemetry bar */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono z-10">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2">
              <span className="text-[10px] text-slate-400 block">SPEED</span>
              <span className="text-base font-bold text-white">{truck.speedKmh} km/h</span>
            </div>
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2">
              <span className="text-[10px] text-slate-400 block">BATTERY</span>
              <span className="text-base font-bold text-emerald-400">{truck.batteryLevel}%</span>
            </div>
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2">
              <span className="text-[10px] text-slate-400 block">PAYLOAD</span>
              <span className="text-base font-bold text-cyan-300">{truck.currentLoadKg} kg</span>
            </div>
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2">
              <span className="text-[10px] text-slate-400 block">ROBOTIC ARM</span>
              <span className="text-base font-bold text-amber-300 capitalize">{truck.roboticArmStatus}</span>
            </div>
          </div>

        </div>

        {/* Autonomous Robotic Arm Sequence Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Robotic Arm Pickup Handshake</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Stage {isArmCycling ? armPhase : 1} of 6
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Fully autonomous zero-touch servicing sequence verified by optical cameras and wireless smart-bin telemetry.
            </p>

            {/* Arm Steps timeline */}
            <div className="mt-4 space-y-2.5">
              {armSteps.map((step, idx) => {
                const stepNum = idx + 1;
                const isCurrent = isArmCycling && armPhase === stepNum;
                const isPassed = !isArmCycling ? idx === 0 : armPhase > stepNum;

                return (
                  <div
                    key={step.title}
                    className={`p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                        : isPassed
                        ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                        : 'bg-slate-950/20 border-slate-900 text-slate-500'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isPassed ? 'bg-emerald-500 text-slate-950' : isCurrent ? 'bg-cyan-400 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{step.title}</div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trigger Cycle Button */}
          <div className="pt-2">
            <button
              onClick={handleCycleArm}
              disabled={isArmCycling || !activeWaypoint}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {isArmCycling ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Executing Arm Cycle ({armPhase}/6)...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Service Current Bin ({activeWaypoint ? activeWaypoint.binId : 'None'})</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
