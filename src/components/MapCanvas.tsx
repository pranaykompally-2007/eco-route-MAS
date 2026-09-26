import React, { useState } from 'react';
import { 
  Truck, 
  Trash2, 
  Layers, 
  Battery, 
  Navigation,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { SmartBin, TruckAgent, CollectionRoute, DeploymentArea } from '../types';

interface MapCanvasProps {
  bins: SmartBin[];
  trucks: TruckAgent[];
  activeRoute: CollectionRoute | null;
  selectedBinId: string | null;
  selectedTruckId: string | null;
  onSelectBin: (bin: SmartBin) => void;
  onSelectTruck: (truck: TruckAgent) => void;
  onCollectBin?: (binId: string) => void;
  currentArea?: DeploymentArea;
  areas?: DeploymentArea[];
  onDeployArea?: (areaId: string) => void;
  onOpenAreaModal?: () => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  bins,
  trucks,
  activeRoute,
  selectedBinId,
  selectedTruckId,
  onSelectBin,
  onSelectTruck,
  onCollectBin,
  currentArea,
  areas,
  onDeployArea,
  onOpenAreaModal,
}) => {
  const [showRoute, setShowRoute] = useState(true);
  const [filterWaste, setFilterWaste] = useState<string>('all');

  // Filtered bins
  const visibleBins = bins.filter(
    (b) => filterWaste === 'all' || b.wasteType === filterWaste
  );

  const getFillColor = (fill: number) => {
    if (fill >= 85) return '#f43f5e'; // Controlled crimson for critical
    if (fill >= 65) return '#f59e0b'; // Soft amber for warning
    return '#10b981'; // Emerald green for nominal
  };

  const getWasteStroke = (type: string) => {
    switch (type) {
      case 'recyclable':
        return '#38bdf8'; // sky-400
      case 'organic':
        return '#34d399'; // emerald-400
      case 'hazardous':
        return '#fb923c'; // orange-400
      default:
        return '#94a3b8'; // slate-400
    }
  };

  return (
    <div id="city-map-container" className="relative w-full h-[520px] bg-[#0c1017] rounded-2xl border border-[#1f2837] overflow-hidden shadow-2xl flex flex-col font-sans">
      
      {/* Top Bar: Clean, Streamlined Map Navigation Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: Sector Title & Quick Area Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#131a24]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#222c3c] text-xs text-slate-200 shadow-lg">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentArea ? currentArea.name.split('&')[0].trim() : 'Metro Downtown Sector'}</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="font-mono text-[11px] text-slate-400 tabular-nums">
            {bins.length} Smart Bins · {trucks.length} Trucks
          </span>

          {onOpenAreaModal && (
            <button
              onClick={onOpenAreaModal}
              className="ml-1.5 px-2 py-0.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <Globe2 className="w-3 h-3" />
              <span>Change Sector</span>
            </button>
          )}
        </div>

        {/* Right: Layer Toggles & Waste Filter */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#131a24]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#222c3c] text-xs shadow-lg">
          <button
            onClick={() => setShowRoute(!showRoute)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              showRoute
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#192230]'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Route Overlay</span>
          </button>

          <span className="text-slate-700">|</span>

          {/* Waste Type selector */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            <select
              value={filterWaste}
              onChange={(e) => setFilterWaste(e.target.value)}
              className="bg-[#192230] text-slate-200 text-[11px] rounded-lg px-2 py-1 border border-[#273447] focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Waste Streams</option>
              <option value="general">General Waste</option>
              <option value="recyclable">Recyclables</option>
              <option value="organic">Organic Compost</option>
              <option value="hazardous">E-Waste / Hazardous</option>
            </select>
          </div>
        </div>

      </div>

      {/* High-Contrast Vector SVG Map */}
      <div className="relative w-full h-full">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full select-none"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Charcoal Grid Pattern */}
            <pattern id="charcoal-grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#161f2c" strokeWidth="0.25" strokeDasharray="0.6 1.4" />
            </pattern>

            {/* Electric Blue Route Gradient */}
            <linearGradient id="electricBlueRoute" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>

            {/* Subtle glow filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Canvas */}
          <rect width="100" height="100" fill="#0c1017" />
          <rect width="100" height="100" fill="url(#charcoal-grid)" />

          {/* Clean Road Arteries */}
          <g stroke="#1a2332" strokeWidth="0.9" strokeLinecap="round">
            {/* North-South Corridors */}
            <line x1="25" y1="0" x2="25" y2="100" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#243044" strokeWidth="1.2" strokeDasharray="2 1" />
            <line x1="75" y1="0" x2="75" y2="100" />

            {/* East-West Corridors */}
            <line x1="0" y1="25" x2="100" y2="25" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#243044" strokeWidth="1.2" strokeDasharray="2 1" />
            <line x1="0" y1="75" x2="100" y2="75" />

            {/* Diagonal Connecting Boulevards */}
            <line x1="10" y1="10" x2="90" y2="90" stroke="#161f2c" strokeWidth="0.7" />
            <line x1="10" y1="90" x2="90" y2="10" stroke="#161f2c" strokeWidth="0.7" />
          </g>

          {/* Central Fleet Depot Hub */}
          <g transform="translate(50, 50)">
            <circle r="4.2" fill="#131a24" stroke="#3b82f6" strokeWidth="0.6" />
            <rect x="-2" y="-2" width="4" height="4" rx="0.8" fill="#3b82f6" fillOpacity="0.3" />
            <text x="0" y="5.8" fill="#60a5fa" fontSize="1.6" textAnchor="middle" fontWeight="bold">CENTRAL DEPOT</text>
          </g>

          {/* Electric Blue Active Collection Route */}
          {showRoute && activeRoute && activeRoute.waypoints.length > 0 && (
            <g>
              {(() => {
                const points = [
                  { x: 50, y: 50 }, // Start depot
                  ...activeRoute.waypoints.map(w => w.coords),
                  { x: 50, y: 50 }, // Return depot
                ];
                const pathData = points.reduce((acc, curr, idx) => {
                  return `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`;
                }, '');

                return (
                  <>
                    {/* Route Halo */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="1.2"
                      strokeOpacity="0.3"
                      filter="url(#routeGlow)"
                    />
                    {/* Main Electric Blue Path */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="url(#electricBlueRoute)"
                      strokeWidth="0.75"
                      strokeDasharray="2.5 1"
                    />
                  </>
                );
              })()}

              {/* Waypoint Number Markers */}
              {activeRoute.waypoints.map((wp, idx) => {
                const isCompleted = wp.status === 'completed';
                const isApproaching = wp.status === 'approaching';
                return (
                  <g key={wp.id} transform={`translate(${wp.coords.x}, ${wp.coords.y})`}>
                    <circle 
                      r="2.5" 
                      fill={isCompleted ? '#10b981' : isApproaching ? '#3b82f6' : '#192230'} 
                      stroke="#ffffff" 
                      strokeWidth="0.35" 
                    />
                    <text
                      y="0.7"
                      fill="#ffffff"
                      fontSize="1.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {idx + 1}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Smart Bin Nodes */}
          {visibleBins.map((bin) => {
            const isSelected = selectedBinId === bin.id;
            const isCritical = bin.fillLevel >= 85;
            const isWarning = bin.fillLevel >= 65 && bin.fillLevel < 85;
            const fillColor = getFillColor(bin.fillLevel);
            const wasteStroke = getWasteStroke(bin.wasteType);

            return (
              <g
                key={bin.id}
                id={`map-node-${bin.id.toLowerCase()}`}
                transform={`translate(${bin.coords.x}, ${bin.coords.y})`}
                onClick={() => onSelectBin(bin)}
                className="cursor-pointer transition-transform hover:scale-125"
                style={{ transformOrigin: `${bin.coords.x}px ${bin.coords.y}px` }}
              >
                {/* Critical Pulse Radar if >=85% */}
                {isCritical && (
                  <circle
                    r="4.2"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="0.45"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="r"
                      from="2.4"
                      to="6"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.8"
                      to="0"
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Electric Blue Selection Ring */}
                {isSelected && (
                  <circle
                    r="4.2"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="0.75"
                    strokeDasharray="1.2 0.8"
                  />
                )}

                {/* Bin Base Disc */}
                <circle
                  r="2.3"
                  fill="#121822"
                  stroke={wasteStroke}
                  strokeWidth="0.4"
                />

                {/* Circular Fill Progress Indicator */}
                <circle
                  r="2.3"
                  fill="none"
                  stroke={fillColor}
                  strokeWidth="0.65"
                  strokeDasharray={`${(bin.fillLevel / 100) * 14.45} 14.45`}
                  transform="rotate(-90)"
                />

                {/* Center Core Dot */}
                <circle
                  r="0.9"
                  fill={fillColor}
                />

                {/* Simplified Crisp Label Tag */}
                <rect
                  x="-5.5"
                  y="3"
                  width="11"
                  height="2.8"
                  rx="0.6"
                  fill="#0c1017"
                  stroke={isSelected ? '#3b82f6' : isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#222d3d'}
                  strokeWidth={isSelected || isCritical ? '0.35' : '0.2'}
                />
                <text
                  x="0"
                  y="4.9"
                  fill={isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#e2e8f0'}
                  fontSize="1.3"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {bin.id} ({bin.fillLevel}%)
                </text>
              </g>
            );
          })}

          {/* Autonomous Electric Robot Trucks */}
          {trucks.map((truck) => {
            const isSelected = selectedTruckId === truck.id;

            return (
              <g
                key={truck.id}
                id={`map-truck-${truck.id.toLowerCase()}`}
                transform={`translate(${truck.coords.x}, ${truck.coords.y})`}
                onClick={() => onSelectTruck(truck)}
                className="cursor-pointer transition-transform hover:scale-125"
                style={{ transformOrigin: `${truck.coords.x}px ${truck.coords.y}px` }}
              >
                {/* Motion Halo */}
                <circle
                  r="4.5"
                  fill="#2563eb"
                  fillOpacity="0.15"
                  stroke="#3b82f6"
                  strokeWidth="0.3"
                />

                {/* Modern Robot Truck Pod */}
                <rect
                  x="-3"
                  y="-2.2"
                  width="6"
                  height="4.4"
                  rx="1"
                  fill={isSelected ? '#3b82f6' : '#1d4ed8'}
                  stroke="#ffffff"
                  strokeWidth="0.45"
                />

                {/* Windshield */}
                <rect x="0.8" y="-1.4" width="1.6" height="2.8" rx="0.3" fill="#0c1017" />
                
                {/* Truck Identification Badge */}
                <rect
                  x="-7"
                  y="-5.4"
                  width="14"
                  height="2.7"
                  rx="0.6"
                  fill="#0c1017"
                  stroke="#3b82f6"
                  strokeWidth="0.3"
                />
                <text
                  x="0"
                  y="-3.5"
                  fill="#ffffff"
                  fontSize="1.3"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  🚛 {truck.name} ({truck.speedKmh} km/h)
                </text>
              </g>
            );
          })}
        </svg>

        {/* High-Contrast Simplified Telemetry Legend (Bottom Right Overlay) */}
        <div className="absolute bottom-3 right-3 z-20 bg-[#121721]/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#222c3c] text-[11px] text-slate-300 shadow-xl pointer-events-none flex flex-col gap-1.5 font-sans">
          <div className="font-semibold text-slate-200 border-b border-[#1c2432] pb-1 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">Network Legend</span>
            <span className="text-[10px] text-blue-400 font-mono">Live GPS</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>&lt;65% Clean</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>65–84% Warning</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>≥85% Critical</span>
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-[#1c2432] text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Electric Autonomous Route</span>
            </span>
          </div>
        </div>

        {/* Selected Entity Quick Inspector (Bottom Left Overlay) */}
        {(selectedBinId || selectedTruckId) && (
          <div className="absolute bottom-3 left-3 z-20 bg-[#121721]/95 backdrop-blur-md px-4 py-3 rounded-xl border border-[#283548] text-xs text-slate-200 shadow-2xl max-w-md flex items-center justify-between gap-4">
            {selectedBinId ? (
              (() => {
                const b = bins.find(item => item.id === selectedBinId);
                if (!b) return null;
                const isCritical = b.fillLevel >= 85;
                const isWarning = b.fillLevel >= 65 && b.fillLevel < 85;
                return (
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Trash2 className={`w-4 h-4 ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`} />
                        <span>{b.id} — {b.name}</span>
                        {isCritical && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                            CRITICAL
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Fill: <strong className={isCritical ? "text-rose-400 font-bold" : isWarning ? "text-amber-400" : "text-emerald-400"}>{b.fillLevel}%</strong> · Urgency: <strong className="text-slate-200 uppercase">{b.bidPriority}</strong>
                      </div>
                    </div>

                    {isCritical && onCollectBin && (
                      <button
                        onClick={() => onCollectBin(b.id)}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Dispatch Pickup
                      </button>
                    )}
                  </div>
                );
              })()
            ) : (
              (() => {
                const t = trucks.find(item => item.id === selectedTruckId);
                if (!t) return null;
                return (
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-blue-400" />
                      <span>{t.name} — {t.model.split(' ')[0]}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Payload: <strong className="text-white">{t.currentLoadKg} / {t.maxCapacityKg} kg</strong> · Battery: <strong className="text-emerald-400">{t.batteryLevel}%</strong> · Mode: <strong className="text-blue-300">{t.driverAgentMode}</strong>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

      </div>
    </div>
  );
};
