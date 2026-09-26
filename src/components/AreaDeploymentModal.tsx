import React, { useState } from 'react';
import { 
  MapPin, 
  Check, 
  Truck, 
  Trash2, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  X, 
  Globe2, 
  Users, 
  TrendingDown, 
  Building2, 
  Waves, 
  Trees, 
  GraduationCap,
  PlusCircle,
  Layers
} from 'lucide-react';
import { DeploymentArea, SmartBin, TruckAgent, CollectionRoute } from '../types';

interface AreaDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  areas: DeploymentArea[];
  currentAreaId: string;
  onDeployArea: (areaId: string) => void;
  onDeployCustomArea?: (customArea: DeploymentArea) => void;
}

export const AreaDeploymentModal: React.FC<AreaDeploymentModalProps> = ({
  isOpen,
  onClose,
  areas,
  currentAreaId,
  onDeployArea,
  onDeployCustomArea,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedId, setSelectedId] = useState<string>(currentAreaId);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  // Custom Area Creation Form State
  const [customName, setCustomName] = useState<string>('Riverside Financial & Commercial Center');
  const [customCity, setCustomCity] = useState<string>('Metropolis West');
  const [customCategory, setCustomCategory] = useState<'urban_metro' | 'coastal_waterfront' | 'suburban_residential' | 'tech_campus'>('urban_metro');
  const [customBinsCount, setCustomBinsCount] = useState<number>(8);
  const [customTrucksCount, setCustomTrucksCount] = useState<number>(2);

  React.useEffect(() => {
    setSelectedId(currentAreaId);
  }, [currentAreaId, isOpen]);

  if (!isOpen) return null;

  const activeArea = areas.find((a) => a.id === selectedId) || areas[0];

  const handleConfirmDeploy = (areaId?: string) => {
    const targetId = areaId || selectedId;
    setIsDeploying(true);
    setTimeout(() => {
      onDeployArea(targetId);
      setIsDeploying(false);
      onClose();
    }, 500);
  };

  const handleDeployCustom = () => {
    if (!customName.trim()) return;
    setIsDeploying(true);

    const newId = `custom_${Date.now()}`;
    const generatedBins: SmartBin[] = Array.from({ length: customBinsCount }).map((_, idx) => {
      const fill = idx === 0 ? 100 : Math.round(40 + Math.random() * 55);
      const isCritical = fill >= 85;
      return {
        id: `CBIN-${idx + 101}`,
        name: `${customName.split(' ')[0]} Node #${idx + 1}`,
        address: `${(idx + 1) * 120} ${customName.split(' ')[0]} Avenue`,
        district: `${customName.split('&')[0]} Sector`,
        coords: {
          x: Math.round(15 + (idx % 4) * 22 + (Math.random() * 8 - 4)),
          y: Math.round(20 + Math.floor(idx / 4) * 28 + (Math.random() * 8 - 4)),
          lat: +(37.77 + Math.random() * 0.05).toFixed(4),
          lng: +(-122.42 + Math.random() * 0.05).toFixed(4),
        },
        fillLevel: fill,
        capacityLiters: 1200,
        wasteType: idx % 3 === 0 ? 'recyclable' : idx % 3 === 1 ? 'organic' : 'general',
        batteryLevel: Math.round(80 + Math.random() * 18),
        sensorStatus: 'optimal',
        lastEmptied: 'Today, 06:30',
        bidPriority: fill >= 100 ? 'critical' : isCritical ? 'critical' : fill >= 60 ? 'high' : 'normal',
        temperatureC: 19.5,
        odorPpm: Math.round(5 + fill * 0.3),
        lidStatus: fill >= 100 ? 'open' : 'closed',
        currentBidAmount: fill,
        sensorAlerts: fill >= 100 ? ['100% Full: Autonomous Zero-Overflow Mandate Triggered'] : [],
      };
    });

    const generatedTrucks: TruckAgent[] = Array.from({ length: customTrucksCount }).map((_, idx) => ({
      id: `TRUCK-C${idx + 1}`,
      name: idx === 0 ? 'Unit Nova (Primary)' : 'Unit Echo (Support)',
      model: 'Volvo FE Autonomous Electric Compactor',
      powertrain: 'Electric EV',
      maxPayloadKg: 7500,
      currentLoadKg: 1200 * idx,
      batteryLevel: 94 - idx * 5,
      status: idx === 0 ? 'routing' : 'idle',
      coords: { x: 45 + idx * 10, y: 45 + idx * 10 },
      targetCoords: generatedBins[0]?.coords,
      speedKmh: idx === 0 ? 25 : 0,
      assignedRouteId: `ROUTE-CUSTOM-${idx + 1}`,
      completedPickups: 0,
      efficiencyRating: 98.2,
      roboticArmStatus: 'ready',
      driverAgentMode: 'autonomous',
    }));

    const initialRoute: CollectionRoute = {
      routeId: `ROUTE-CUSTOM-01`,
      truckId: generatedTrucks[0].id,
      truckName: generatedTrucks[0].name,
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'active',
      waypoints: generatedBins.slice(0, 4).map((b, idx) => ({
        id: `CWP-${idx + 1}`,
        binId: b.id,
        binName: b.name,
        address: b.address,
        coords: b.coords,
        fillLevelSnapshot: b.fillLevel,
        wasteType: b.wasteType,
        estimatedWeightKg: Math.round(b.fillLevel * 8.5),
        distanceFromPrevKm: +(1.2 + idx * 0.8).toFixed(1),
        etaMinutes: (idx + 1) * 3,
        status: idx === 0 ? 'approaching' : 'pending',
      })),
      totalDistanceKm: 6.8,
      estimatedFuelLitres: 0,
      actualEnergyKwh: 12.4,
      co2SavedKg: 29.5,
      efficiencyScore: 98.5,
      activeWaypointIndex: 0,
      aiOptimizationRationale: `Custom deployed area route optimized for ${customName} with ${generatedBins.length} smart bins and 100% capacity Zero-Overflow compliance.`,
    };

    const newArea: DeploymentArea = {
      id: newId,
      name: customName,
      tagline: `Dynamic custom deployed area in ${customCity}`,
      city: customCity,
      category: customCategory,
      description: `Custom municipal sector configured with ${customBinsCount} smart bin nodes and ${customTrucksCount} autonomous electric collection vehicles.`,
      population: '55,000 citizens & personnel',
      dailyWasteEstKg: customBinsCount * 2200,
      activeSensorsCount: customBinsCount,
      recommendedFleet: generatedTrucks.map(t => t.name).join(' + '),
      areaKm2: +(customBinsCount * 0.8).toFixed(1),
      accentColor: '#10b981',
      zones: [
        {
          name: `${customName.split(' ')[0].toUpperCase()} SECTOR`,
          points: '15,15 85,15 85,85 15,85',
          color: '#10b981',
          fillOpacity: 0.15,
          labelCoords: { x: 20, y: 22 },
        }
      ],
      bins: generatedBins,
      trucks: generatedTrucks,
      initialRoute,
    };

    setTimeout(() => {
      if (onDeployCustomArea) {
        onDeployCustomArea(newArea);
      } else {
        onDeployArea(newId);
      }
      setIsDeploying(false);
      onClose();
    }, 600);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urban_metro':
        return <Building2 className="w-5 h-5 text-emerald-400" />;
      case 'coastal_waterfront':
        return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'suburban_residential':
        return <Trees className="w-5 h-5 text-emerald-400" />;
      case 'tech_campus':
        return <GraduationCap className="w-5 h-5 text-purple-400" />;
      default:
        return <Globe2 className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/10">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Select Area to Deploy
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  AUTONOMOUS LOGISTICS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose an urban district to immediately deploy smart bins, autonomous trucks, and dynamic auction routes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pre-Configured Municipal Areas ({areas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Deploy Custom Area</span>
          </button>
        </div>

        {/* Modal Body */}
        {activeTab === 'presets' ? (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Area Selection Grid with Instant Deploy Buttons */}
            <div className="md:col-span-6 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Click any area to select or deploy:
              </span>

              {areas.map((area) => {
                const isSelected = area.id === selectedId;
                const isCurrentlyActive = area.id === currentAreaId;

                return (
                  <div
                    key={area.id}
                    onClick={() => setSelectedId(area.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-800/80 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 mt-0.5 shrink-0">
                          {getCategoryIcon(area.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{area.name}</h4>
                            {isCurrentlyActive && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {area.tagline}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-2">
                            <span className="flex items-center gap-1 text-slate-300">
                              <Trash2 className="w-3 h-3 text-emerald-400" /> {area.bins.length} Smart Bins
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-300">
                              <Truck className="w-3 h-3 text-cyan-400" /> {area.trucks.length} Trucks
                            </span>
                            <span>•</span>
                            <span>{area.areaKm2} km²</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 mt-1">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-700'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Instant Deploy Action on each card */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmDeploy(area.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isCurrentlyActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isCurrentlyActive ? 'Currently Deployed' : 'Deploy This Area Now'}</span>
                      </button>

                      <span className="text-[10px] text-slate-500 font-mono">
                        {area.city}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Detailed Blueprint for the Selected Zone */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-4 bg-slate-950/80 rounded-2xl border border-slate-800 p-5">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activeArea.city}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mt-1">
                    {activeArea.name}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {activeArea.description}
                  </p>
                </div>

                {/* Area KPI Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1">
                      <Users className="w-3 h-3" /> Population Reach
                    </div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5">
                      {activeArea.population}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-emerald-400" /> Est. Daily Volume
                    </div>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                      {activeArea.dailyWasteEstKg.toLocaleString()} kg/day
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1">
                      <Trash2 className="w-3 h-3 text-cyan-400" /> Sensor Nodes
                    </div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5">
                      {activeArea.activeSensorsCount} Ultrasonic/Odor
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> Zero-Overflow Rule
                    </div>
                    <div className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                      Mandatory 100% Policy
                    </div>
                  </div>
                </div>

                {/* Recommended Fleet Deployment */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Target Fleet Configuration:</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {activeArea.recommendedFleet}
                  </p>
                </div>

                {/* Zone Sub-Districts */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Configured Municipal Sub-Zones
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeArea.zones.map((z, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono border"
                        style={{ 
                          borderColor: `${z.color}50`, 
                          color: z.color,
                          backgroundColor: `${z.color}15`
                        }}
                      >
                        {z.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  {selectedId === currentAreaId ? 'Currently deployed area' : 'Ready to deploy'}
                </span>

                <button
                  id="btn-confirm-deploy-area"
                  onClick={() => handleConfirmDeploy()}
                  disabled={isDeploying}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {isDeploying ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Deploying Fleet & Sensor Map...</span>
                    </>
                  ) : (
                    <>
                      <span>Deploy Fleet to {activeArea.name.split('&')[0]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Custom Area Creation Form */
          <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-5">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                <span>Configure & Deploy Custom Area</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Enter your desired district parameters. The multi-agent logistics engine will generate smart bins, deploy autonomous trucks, and calculate initial routes.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Area / Sector Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-cyan-400 text-xs"
                  placeholder="e.g. Airport Cargo Terminal & Logistics"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  City / Municipality
                </label>
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-cyan-400 text-xs"
                  placeholder="e.g. North Metropolitan District"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Sector Topology
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-cyan-400 text-xs"
                  >
                    <option value="urban_metro">Urban Commercial Metro</option>
                    <option value="coastal_waterfront">Coastal Waterfront / Marina</option>
                    <option value="suburban_residential">Suburban Residential Greenbelt</option>
                    <option value="tech_campus">University Research & Tech Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Smart Bin Nodes ({customBinsCount} Bins)
                  </label>
                  <select
                    value={customBinsCount}
                    onChange={(e) => setCustomBinsCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-cyan-400 text-xs"
                  >
                    <option value={6}>6 Smart Bins (Light Coverage)</option>
                    <option value={8}>8 Smart Bins (Standard Sector)</option>
                    <option value={10}>10 Smart Bins (High Density)</option>
                    <option value={12}>12 Smart Bins (Maximum Grid)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Autonomous Fleet Allocation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomTrucksCount(1)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      customTrucksCount === 1
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">1 Autonomous Electric Truck</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Unit Nova (Volvo FE Compactor)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomTrucksCount(2)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      customTrucksCount === 2
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">2 Autonomous Electric Trucks</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Unit Nova + Unit Echo (Dual Patrol)</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Back to Presets
              </button>
              <button
                type="button"
                onClick={handleDeployCustom}
                disabled={isDeploying}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                {isDeploying ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Deploying Custom Area Grid...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Deploy Custom Area Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
