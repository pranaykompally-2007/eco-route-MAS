export type WasteType = 'general' | 'recyclable' | 'organic' | 'hazardous';

export type SensorStatus = 'optimal' | 'warning' | 'degraded' | 'offline';

export type BidPriority = 'low' | 'normal' | 'high' | 'critical';

export interface SmartBin {
  id: string;
  name: string;
  address: string;
  district: string;
  coords: { x: number; y: number; lat: number; lng: number };
  fillLevel: number; // 0 - 100%
  capacityLiters: number;
  wasteType: WasteType;
  batteryLevel: number; // 0 - 100%
  sensorStatus: SensorStatus;
  lastEmptied: string;
  bidPriority: BidPriority;
  temperatureC: number;
  odorPpm: number;
  lidStatus: 'closed' | 'open' | 'blocked';
  currentBidAmount: number; // fuel cost units bin is offering/weighting
  lastBidTimestamp?: string;
  sensorAlerts?: string[];
}

export type TruckStatus = 'idle' | 'routing' | 'servicing' | 'returning' | 'maintenance' | 'charging';

export interface TruckAgent {
  id: string;
  name: string;
  model: string;
  powertrain: 'Electric EV' | 'Hydrogen Hybrid';
  maxPayloadKg: number;
  currentLoadKg: number;
  batteryLevel: number; // 0 - 100%
  status: TruckStatus;
  coords: { x: number; y: number };
  targetCoords?: { x: number; y: number };
  speedKmh: number;
  assignedRouteId: string | null;
  completedPickups: number;
  efficiencyRating: number; // 0 - 100%
  roboticArmStatus: 'retracted' | 'aligning' | 'lifting' | 'compacting' | 'ready';
  driverAgentMode: 'autonomous' | 'teleoperation_override' | 'manual_assist';
}

export interface RouteWaypoint {
  id: string;
  binId: string;
  binName: string;
  address: string;
  coords: { x: number; y: number };
  fillLevelSnapshot: number;
  wasteType: WasteType;
  estimatedWeightKg: number;
  distanceFromPrevKm: number;
  etaMinutes: number;
  status: 'pending' | 'approaching' | 'servicing' | 'completed' | 'skipped';
  collectedWeightKg?: number;
  servicedAt?: string;
}

export interface CollectionRoute {
  routeId: string;
  truckId: string;
  truckName: string;
  scheduledDate: string;
  status: 'draft' | 'negotiating' | 'scheduled' | 'active' | 'completed';
  waypoints: RouteWaypoint[];
  totalDistanceKm: number;
  estimatedFuelLitres: number;
  actualEnergyKwh: number;
  co2SavedKg: number;
  efficiencyScore: number;
  activeWaypointIndex: number;
  negotiationSessionId?: string;
  aiOptimizationRationale?: string;
}

export type PersonaRole = 
  | 'Operations Supervisor'
  | 'Driver Agent'
  | 'Maintenance Technician'
  | 'City Resident'
  | 'Server Controller';

export interface Persona {
  role: PersonaRole;
  name: string;
  badge: string;
  channel: string;
  description: string;
}

export interface NegotiationBid {
  id: string;
  timestamp: string;
  binId: string;
  binName: string;
  truckId: string;
  truckName: string;
  binFillLevel: number;
  urgencyScore: number;
  proposedCostMetric: number;
  status: 'bid_broadcast' | 'truck_evaluated' | 'accepted' | 'declined' | 'scheduled';
  rationale: string;
}

export interface MaintenanceTicket {
  id: string;
  targetType: 'smart_bin' | 'truck_agent';
  targetId: string;
  targetName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  issueDescription: string;
  reportedAt: string;
  status: 'open' | 'in_progress' | 'calibrated' | 'resolved';
  recommendedAction: string;
}

export interface ResidentReport {
  id: string;
  residentName: string;
  binId: string;
  type: 'bulky_item_request' | 'overflow_alert' | 'lid_stuck' | 'odor_complaint' | 'replace_bin';
  description: string;
  timestamp: string;
  rewardPoints: number;
  status: 'submitted' | 'approved' | 'scheduled' | 'replaced' | 'resolved';
}

export interface ZoneBoundary {
  name: string;
  points: string;
  color: string;
  fillOpacity: number;
  labelCoords: { x: number; y: number };
}

export interface DeploymentArea {
  id: string;
  name: string;
  tagline: string;
  city: string;
  category: 'urban_metro' | 'coastal_waterfront' | 'suburban_residential' | 'tech_campus' | 'industrial_port';
  description: string;
  population: string;
  dailyWasteEstKg: number;
  activeSensorsCount: number;
  recommendedFleet: string;
  areaKm2: number;
  accentColor: string;
  zones: ZoneBoundary[];
  bins: SmartBin[];
  trucks: TruckAgent[];
  initialRoute: CollectionRoute;
}
