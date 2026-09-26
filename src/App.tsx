/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_SMART_BINS, 
  INITIAL_TRUCK_AGENTS, 
  INITIAL_PERSONAS, 
  INITIAL_ROUTE, 
  INITIAL_BIDS, 
  INITIAL_TICKETS, 
  INITIAL_RESIDENT_REPORTS,
  DEPLOYMENT_AREAS
} from './mockData';
import { 
  SmartBin, 
  TruckAgent, 
  CollectionRoute, 
  PersonaRole, 
  NegotiationBid, 
  MaintenanceTicket, 
  ResidentReport,
  DeploymentArea
} from './types';
import { Globe2, Sparkles, MapPin, Check } from 'lucide-react';
import { Header } from './components/Header';
import { WorkflowBar } from './components/WorkflowBar';
import { MapCanvas } from './components/MapCanvas';
import { NegotiationHub } from './components/NegotiationHub';
import { SupervisorView } from './components/SupervisorView';
import { DriverAgentHUD } from './components/DriverAgentHUD';
import { MaintenanceTechView } from './components/MaintenanceTechView';
import { ResidentPortal } from './components/ResidentPortal';
import { ControlAgentView } from './components/ControlAgentView';
import { BinDetailModal } from './components/BinDetailModal';
import { TruckDetailModal } from './components/TruckDetailModal';
import { AreaDeploymentModal } from './components/AreaDeploymentModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { RoleGuideBanner } from './components/RoleGuideBanner';
import { PictureActionCenter } from './components/PictureActionCenter';
import { FleetMetricsCards } from './components/FleetMetricsCards';
import { setVoiceEnabled, speak, playAudioBeep } from './utils/voiceGuide';

export default function App() {
  // State Initialization
  const [availableAreas, setAvailableAreas] = useState<DeploymentArea[]>(DEPLOYMENT_AREAS);
  const [currentAreaId, setCurrentAreaId] = useState<string>('downtown_metro');
  const [isAreaModalOpen, setIsAreaModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);

  const [bins, setBins] = useState<SmartBin[]>(INITIAL_SMART_BINS);
  const [trucks, setTrucks] = useState<TruckAgent[]>(INITIAL_TRUCK_AGENTS);
  const [bids, setBids] = useState<NegotiationBid[]>(INITIAL_BIDS);
  const [activeRoute, setActiveRoute] = useState<CollectionRoute | null>(INITIAL_ROUTE);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(INITIAL_TICKETS);
  const [residentReports, setResidentReports] = useState<ResidentReport[]>(INITIAL_RESIDENT_REPORTS);

  const currentArea = availableAreas.find((a) => a.id === currentAreaId) || availableAreas[0];

  const [currentPersona, setCurrentPersona] = useState<PersonaRole>('Operations Supervisor');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'route_optimization' | 'collection_execution'>('route_optimization');

  const [selectedBin, setSelectedBin] = useState<SmartBin | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<TruckAgent | null>(null);

  const [isNegotiating, setIsNegotiating] = useState<boolean>(false);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [isCollectingBinId, setIsCollectingBinId] = useState<string | null>(null);
  const [autoCollectOn100, setAutoCollectOn100] = useState<boolean>(true);
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    type: 'success' | 'alert' | 'info';
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'alert' | 'info', title: string, message: string) => {
    setToastNotification({
      id: Date.now().toString(),
      type,
      title,
      message,
    });
    setTimeout(() => {
      setToastNotification((prev) => (prev?.title === title ? null : prev));
    }, 6000);
  };

  const [aiRationale, setAiRationale] = useState<string | null>(
    'Multi-agent auction consensus: High-priority smart bins (BIN-108, BIN-101, BIN-102) awarded to Unit Alpha based on proximity and 72% battery reserve margin.'
  );
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);

  // Health check on mount
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (data.aiEnabled) setAiEnabled(true);
      })
      .catch(() => {});
  }, []);

  // Multi-Agent Auction Negotiation (Workflow 1)
  const handleRunNegotiation = async () => {
    setIsNegotiating(true);
    try {
      const res = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bins, trucks }),
      });
      const data = await res.json();

      if (data.success && data.bids) {
        // Merge generated bid decisions
        const updatedBids: NegotiationBid[] = bins.map((bin, idx) => {
          const resBid = data.bids.find((b: any) => b.binId === bin.id);
          const isAccepted = resBid ? resBid.status === 'accepted' : bin.fillLevel >= 80;
          return {
            id: `BID-${Date.now().toString().slice(-3)}${idx}`,
            timestamp: new Date().toLocaleTimeString(),
            binId: bin.id,
            binName: bin.name,
            truckId: 'TRUCK-01',
            truckName: 'Unit Alpha',
            binFillLevel: bin.fillLevel,
            urgencyScore: bin.fillLevel + (bin.bidPriority === 'critical' ? 20 : 0),
            proposedCostMetric: +(10 + Math.random() * 25).toFixed(1),
            status: isAccepted ? 'accepted' : bin.fillLevel > 50 ? 'truck_evaluated' : 'declined',
            rationale: resBid?.rationale || (isAccepted 
              ? `Fill level ${bin.fillLevel}% exceeded auction threshold. Marginal fuel cost optimal.` 
              : `Fill level ${bin.fillLevel}% deferred to next rotation.`),
          };
        });

        setBids(updatedBids);
        if (data.rationale) setAiRationale(data.rationale);
      }
    } catch (err) {
      console.warn('Negotiation fallback:', err);
    } finally {
      setIsNegotiating(false);
    }
  };

  // Build Route from Accepted Bids
  const handleApplyRoute = async () => {
    const acceptedBins = bids.filter((b) => b.status === 'accepted').map((b) => b.binId);
    if (acceptedBins.length === 0) return;

    try {
      const res = await fetch('/api/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truckId: 'TRUCK-01',
          selectedBinIds: acceptedBins,
          bins,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const newRoute: CollectionRoute = {
          routeId: data.routeId,
          truckId: data.truckId,
          truckName: 'Unit Alpha (Electric Compactor)',
          scheduledDate: new Date().toISOString().split('T')[0],
          status: 'active',
          waypoints: data.waypoints,
          totalDistanceKm: data.totalDistanceKm,
          estimatedFuelLitres: 0,
          actualEnergyKwh: data.actualEnergyKwh,
          co2SavedKg: data.co2SavedKg,
          efficiencyScore: data.efficiencyScore,
          activeWaypointIndex: 0,
          aiOptimizationRationale: aiRationale || undefined,
        };

        setActiveRoute(newRoute);
        // Set truck status
        setTrucks((prev) =>
          prev.map((t) =>
            t.id === 'TRUCK-01'
              ? { ...t, status: 'routing', assignedRouteId: newRoute.routeId }
              : t
          )
        );
        // Switch to Collection Execution workflow
        setActiveWorkflowTab('collection_execution');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Advance Collection Execution (Workflow 2)
  const handleAdvanceExecution = () => {
    if (!activeRoute || activeRoute.waypoints.length === 0) return;
    setIsAdvancing(true);

    setTimeout(() => {
      const currentIdx = activeRoute.activeWaypointIndex;
      const currentWaypoint = activeRoute.waypoints[currentIdx];

      if (currentWaypoint && currentWaypoint.status !== 'completed') {
        const collectedKg = currentWaypoint.estimatedWeightKg;

        // 1. Mark waypoint completed
        const updatedWaypoints = activeRoute.waypoints.map((wp, idx) => {
          if (idx === currentIdx) {
            return {
              ...wp,
              status: 'completed' as const,
              collectedWeightKg: collectedKg,
              servicedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          } else if (idx === currentIdx + 1) {
            return { ...wp, status: 'approaching' as const };
          }
          return wp;
        });

        // 2. Reset the smart bin's fill level
        setBins((prev) =>
          prev.map((b) =>
            b.id === currentWaypoint.binId
              ? { ...b, fillLevel: 0, lastEmptied: 'Just now', bidPriority: 'low', currentBidAmount: 10 }
              : b
          )
        );

        // 3. Update truck payload & coordinates
        const nextIdx = currentIdx + 1;
        const isFinished = nextIdx >= activeRoute.waypoints.length;

        setTrucks((prev) =>
          prev.map((t) => {
            if (t.id === activeRoute.truckId) {
              const newLoad = t.currentLoadKg + collectedKg;
              return {
                ...t,
                currentLoadKg: newLoad,
                completedPickups: t.completedPickups + 1,
                batteryLevel: Math.max(10, t.batteryLevel - 3),
                coords: isFinished ? { x: 50, y: 50 } : currentWaypoint.coords,
                status: isFinished ? 'returning' : 'routing',
              };
            }
            return t;
          })
        );

        setActiveRoute({
          ...activeRoute,
          waypoints: updatedWaypoints,
          activeWaypointIndex: isFinished ? currentIdx : nextIdx,
          status: isFinished ? 'completed' : 'active',
        });
      }

      setIsAdvancing(false);
    }, 400);
  };

  // Dedicated autonomous collection for a specific bin (e.g. when 100% full capacity is reached)
  const collectSpecificBin = (binId: string, isAuto = false) => {
    const targetBin = bins.find((b) => b.id === binId);
    if (!targetBin) return;

    setIsCollectingBinId(binId);

    // Pick active truck
    const activeTruck = trucks.find((t) => t.status !== 'maintenance') || trucks[0];
    const collectedKg = Math.round((Math.max(20, targetBin.fillLevel) / 100) * (targetBin.capacityLiters * 0.65));

    // Truck dispatched to service bin
    setTrucks((prev) =>
      prev.map((t) =>
        t.id === activeTruck.id
          ? {
              ...t,
              status: 'servicing',
              roboticArmStatus: 'lifting',
              coords: targetBin.coords,
            }
          : t
      )
    );

    // Robotic arm tare & compaction cycle
    setTimeout(() => {
      // 1. Reset smart bin to 0%
      setBins((prev) =>
        prev.map((b) =>
          b.id === binId
            ? {
                ...b,
                fillLevel: 0,
                lastEmptied: 'Just now (100% full auto-pickup)',
                bidPriority: 'low',
                currentBidAmount: 10,
                lidStatus: 'closed',
                sensorAlerts: [],
              }
            : b
        )
      );

      // Update selectedBin if opened
      setSelectedBin((prev) =>
        prev && prev.id === binId
          ? {
              ...prev,
              fillLevel: 0,
              lastEmptied: 'Just now (100% full auto-pickup)',
              bidPriority: 'low',
              currentBidAmount: 10,
              lidStatus: 'closed',
              sensorAlerts: [],
            }
          : prev
      );

      // 2. Update truck payload & status
      setTrucks((prev) =>
        prev.map((t) =>
          t.id === activeTruck.id
            ? {
                ...t,
                status: 'routing',
                roboticArmStatus: 'ready',
                currentLoadKg: Math.min(t.maxPayloadKg, t.currentLoadKg + collectedKg),
                completedPickups: t.completedPickups + 1,
                batteryLevel: Math.max(15, t.batteryLevel - 2),
              }
            : t
        )
      );

      // 3. Mark waypoint completed if bin was in activeRoute
      setActiveRoute((prev) => {
        if (!prev) return null;
        const hasWaypoint = prev.waypoints.some((w) => w.binId === binId);
        if (!hasWaypoint) return prev;
        return {
          ...prev,
          waypoints: prev.waypoints.map((w) =>
            w.binId === binId
              ? {
                  ...w,
                  status: 'completed',
                  collectedWeightKg: collectedKg,
                  servicedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              : w
          ),
        };
      });

      // 4. Update any corresponding bid status
      setBids((prev) =>
        prev.map((b) =>
          b.binId === binId
            ? {
                ...b,
                binFillLevel: 0,
                urgencyScore: 10,
                status: 'accepted',
                rationale: `Collected & emptied by ${activeTruck.name}. Tare weight: ${collectedKg} kg. Fill level restored to 0%.`,
              }
            : b
        )
      );

      setIsCollectingBinId(null);

      showToast(
        'success',
        '✅ 100% Full Bin Collected',
        `${targetBin.name} (${binId}) reached full capacity and has been collected by ${activeTruck.name}. 0% fill level restored!`
      );
    }, 1200);
  };

  // Simulate Waste Surge (Triggers 100% fill on BIN-108 to demonstrate mandatory collection rule)
  const handleSimulateSurge = () => {
    // Fill BIN-108 to 100%
    handleUpdateBinFill('BIN-108', 100);

    setBins((prev) =>
      prev.map((b) => {
        if (b.id === 'BIN-101' || b.id === 'BIN-112') {
          return {
            ...b,
            fillLevel: Math.min(95, b.fillLevel + 20),
            bidPriority: 'high',
            sensorAlerts: ['High volume surge detected (>20%/hr)'],
          };
        }
        return b;
      })
    );
  };

  // Quick action to fill sample bin to 100%
  const handleFillBinTo100 = (binId?: string) => {
    const targetId = binId || selectedBin?.id || 'BIN-108';
    handleUpdateBinFill(targetId, 100);
  };

  // Bin modifications with 100% collection rule enforcement
  const handleUpdateBinFill = (binId: string, newFill: number) => {
    const clampedFill = Math.max(0, Math.min(100, newFill));
    const targetBin = bins.find((b) => b.id === binId);

    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { 
        ...b, 
        fillLevel: clampedFill, 
        bidPriority: clampedFill >= 100 ? 'critical' : clampedFill >= 85 ? 'critical' : clampedFill >= 65 ? 'high' : 'normal',
        sensorAlerts: clampedFill >= 100 ? ['100% Capacity reached - Autonomous collection mandated'] : b.sensorAlerts,
      } : b))
    );
    if (selectedBin?.id === binId) {
      setSelectedBin((prev) => (prev ? { 
        ...prev, 
        fillLevel: clampedFill, 
        bidPriority: clampedFill >= 100 ? 'critical' : clampedFill >= 85 ? 'critical' : clampedFill >= 65 ? 'high' : 'normal',
        sensorAlerts: clampedFill >= 100 ? ['100% Capacity reached - Autonomous collection mandated'] : prev.sensorAlerts,
      } : null));
    }

    // CRITICAL: When a bin is filled to 100%, trigger autonomous collection!
    if (clampedFill >= 100) {
      showToast(
        'alert',
        '🚨 100% Capacity Reached!',
        `${targetBin?.name || binId} (${binId}) reached 100% full capacity. Zero-Overflow Mandate triggered! Autonomous truck dispatched for collection...`
      );

      if (autoCollectOn100) {
        setTimeout(() => {
          collectSpecificBin(binId, true);
        }, 1400);
      }
    }
  };

  // Dynamic Area / District Deployment Handler
  const handleDeployArea = (areaId: string) => {
    const target = availableAreas.find((a) => a.id === areaId);
    if (!target) return;

    setCurrentAreaId(areaId);
    setBins(target.bins);
    setTrucks(target.trucks);
    setActiveRoute(target.initialRoute);
    setSelectedBin(null);
    setSelectedTruck(null);

    // Recompute bids for the newly deployed area
    const newBids: NegotiationBid[] = target.bins.map((bin, idx) => {
      const is100 = bin.fillLevel >= 100;
      const isAccepted = is100 || bin.fillLevel >= 80;
      return {
        id: `BID-${areaId.slice(0, 3)}-${Date.now().toString().slice(-3)}${idx}`,
        timestamp: new Date().toLocaleTimeString(),
        binId: bin.id,
        binName: bin.name,
        truckId: target.trucks[0]?.id || 'TRUCK-01',
        truckName: target.trucks[0]?.name || 'Unit Alpha',
        binFillLevel: bin.fillLevel,
        urgencyScore: bin.fillLevel + (bin.bidPriority === 'critical' ? 20 : 0),
        proposedCostMetric: +(12 + Math.random() * 20).toFixed(1),
        status: isAccepted ? 'accepted' : bin.fillLevel > 50 ? 'truck_evaluated' : 'declined',
        rationale: is100 
          ? 'Mandatory 100% full capacity reached: immediate priority dispatch.' 
          : isAccepted 
          ? `Fill level ${bin.fillLevel}% exceeded auction threshold for ${target.name.split('&')[0]}.` 
          : `Fill level ${bin.fillLevel}% queued for next cycle.`,
      };
    });
    setBids(newBids);

    if (target.initialRoute?.aiOptimizationRationale) {
      setAiRationale(target.initialRoute.aiOptimizationRationale);
    } else {
      setAiRationale(`Autonomous fleet deployed to ${target.name}. Route optimized for ${target.bins.length} sensor nodes across ${target.zones.map(z => z.name).join(', ')}.`);
    }

    showToast(
      'success',
      `🌐 Deployed to ${target.name.split('&')[0]}`,
      `Autonomous fleet initialized with ${target.bins.length} smart bins, ${target.trucks.length} trucks, and active route ${target.initialRoute.routeId}.`
    );
  };

  const handleDeployCustomArea = (newArea: DeploymentArea) => {
    setAvailableAreas((prev) => [newArea, ...prev]);
    setCurrentAreaId(newArea.id);
    setBins(newArea.bins);
    setTrucks(newArea.trucks);
    setActiveRoute(newArea.initialRoute);
    setSelectedBin(null);
    setSelectedTruck(null);

    const newBids: NegotiationBid[] = newArea.bins.map((bin, idx) => {
      const is100 = bin.fillLevel >= 100;
      const isAccepted = is100 || bin.fillLevel >= 80;
      return {
        id: `BID-${newArea.id.slice(0, 3)}-${Date.now().toString().slice(-3)}${idx}`,
        timestamp: new Date().toLocaleTimeString(),
        binId: bin.id,
        binName: bin.name,
        truckId: newArea.trucks[0]?.id || 'TRUCK-01',
        truckName: newArea.trucks[0]?.name || 'Unit Nova',
        binFillLevel: bin.fillLevel,
        urgencyScore: bin.fillLevel + (bin.bidPriority === 'critical' ? 20 : 0),
        proposedCostMetric: +(12 + Math.random() * 20).toFixed(1),
        status: isAccepted ? 'accepted' : bin.fillLevel > 50 ? 'truck_evaluated' : 'declined',
        rationale: is100
          ? 'Mandatory 100% full capacity reached: immediate priority dispatch.'
          : isAccepted
          ? `Fill level ${bin.fillLevel}% exceeded auction threshold for ${newArea.name}.`
          : `Fill level ${bin.fillLevel}% queued for next cycle.`,
      };
    });
    setBids(newBids);

    if (newArea.initialRoute?.aiOptimizationRationale) {
      setAiRationale(newArea.initialRoute.aiOptimizationRationale);
    }

    showToast(
      'success',
      `🌐 Custom Area Deployed: ${newArea.name}`,
      `Autonomous logistics grid initialized for ${newArea.name} with ${newArea.bins.length} smart bins and ${newArea.trucks.length} trucks.`
    );
  };

  const handleToggleLid = (binId: string) => {
    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { ...b, lidStatus: b.lidStatus === 'closed' ? 'open' : 'closed' } : b))
    );
    if (selectedBin?.id === binId) {
      setSelectedBin((prev) => (prev ? { ...prev, lidStatus: prev.lidStatus === 'closed' ? 'open' : 'closed' } : null));
    }
  };

  const handleTriggerPriorityBid = (binId: string) => {
    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { ...b, bidPriority: 'critical', currentBidAmount: 99 } : b))
    );
    handleRunNegotiation();
  };

  // Resident report submissions with rich description processing
  const handleSubmitResidentReport = (reportData: Omit<ResidentReport, 'id' | 'timestamp' | 'rewardPoints' | 'status'>) => {
    const newReport: ResidentReport = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      rewardPoints: reportData.type === 'bulky_item_request' ? 50 : 25,
      status: 'scheduled',
      ...reportData,
    };
    setResidentReports((prev) => [newReport, ...prev]);

    // Attach description directly to the target smart bin's sensor alerts and elevate priority
    setBins((prev) =>
      prev.map((b) => {
        if (b.id !== reportData.binId) return b;

        const newAlerts = [
          `Citizen Report (${reportData.residentName}): "${reportData.description}"`,
          ...(b.sensorAlerts || []),
        ];

        let updatedFill = b.fillLevel;
        let updatedLid = b.lidStatus;
        let updatedOdor = b.odorPpm;
        let updatedPriority = b.bidPriority;
        let updatedBid = b.currentBidAmount;

        if (reportData.type === 'overflow_alert') {
          updatedFill = Math.max(b.fillLevel, 92);
          updatedPriority = 'critical';
          updatedBid = 98;
        } else if (reportData.type === 'replace_bin') {
          updatedPriority = 'critical';
          updatedBid = 100;
          newAlerts.unshift(`🚨 Citizen requested complete bin replacement: "${reportData.description}"`);
        } else if (reportData.type === 'lid_stuck') {
          updatedLid = 'open';
          updatedPriority = 'critical';
        } else if (reportData.type === 'odor_complaint') {
          updatedOdor = Math.max(b.odorPpm, 55);
        }

        return {
          ...b,
          fillLevel: updatedFill,
          lidStatus: updatedLid,
          odorPpm: updatedOdor,
          bidPriority: updatedPriority,
          currentBidAmount: updatedBid,
          sensorAlerts: newAlerts,
        };
      })
    );

    // If it's a mechanical defect or replacement, also generate a maintenance ticket with the resident's description
    if (reportData.type === 'lid_stuck' || reportData.type === 'odor_complaint' || reportData.type === 'replace_bin') {
      const newTicket: MaintenanceTicket = {
        id: `TCK-${Date.now().toString().slice(-4)}`,
        targetType: 'smart_bin',
        targetId: reportData.binId,
        targetName: bins.find((b) => b.id === reportData.binId)?.name || reportData.binId,
        severity: 'high',
        component: reportData.type === 'replace_bin' ? 'Complete Smart Bin Chassis' : reportData.type === 'lid_stuck' ? 'Pneumatic Lid & Seal' : 'Bio-Filter Odor Scrubber',
        issueDescription: `Citizen reported: "${reportData.description}"`,
        reportedAt: 'Just now',
        status: 'open',
        recommendedAction: reportData.type === 'replace_bin'
          ? 'Dispatch replacement truck with fresh calibrated smart bin node'
          : reportData.type === 'lid_stuck' 
          ? 'Inspect hydraulic actuator and clear jammed latch mechanism' 
          : 'Replace active carbon filter cartridge',
      };
      setTickets((prev) => [newTicket, ...prev]);
    }

    // Add bid item with the citizen description
    const newBid: NegotiationBid = {
      id: `BID-CITIZEN-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      binId: reportData.binId,
      binName: bins.find((b) => b.id === reportData.binId)?.name || reportData.binId,
      truckId: trucks[0]?.id || 'TRUCK-01',
      truckName: trucks[0]?.name || 'Unit Alpha',
      binFillLevel: bins.find((b) => b.id === reportData.binId)?.fillLevel || 85,
      urgencyScore: 95,
      proposedCostMetric: 14.5,
      status: 'accepted',
      rationale: `Citizen Report (${reportData.residentName}): "${reportData.description}" — Sent to Server Controller for replacement & dispatch.`,
    };
    setBids((prev) => [newBid, ...prev]);

    showToast(
      'success',
      `📢 Citizen Report Sent to Server Controller (${reportData.binId})`,
      `"${reportData.description}" recorded. Sent to Server Controller for replacement & dispatch.`
    );
  };

  // Server Controller action: Replace Smart Bin unit based on Citizen Report
  const handleReplaceBinFromReport = (reportId: string, binId: string) => {
    // 1. Mark report as replaced/resolved
    setResidentReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'replaced' } : r))
    );

    // 2. Replace the physical/sensor smart bin unit with fresh calibrated unit
    setBins((prev) =>
      prev.map((b) => {
        if (b.id !== binId) return b;
        return {
          ...b,
          fillLevel: 0,
          batteryLevel: 100,
          sensorStatus: 'optimal',
          lastEmptied: 'Replaced Just Now',
          bidPriority: 'normal',
          temperatureC: 18.5,
          odorPpm: 2,
          lidStatus: 'closed',
          currentBidAmount: 10,
          sensorAlerts: [
            `✓ Fresh Smart Bin Unit deployed by Server Controller (Replaced per Report #${reportId})`,
          ],
        };
      })
    );

    // 3. Close any associated maintenance tickets for this bin
    setTickets((prev) =>
      prev.map((t) => (t.targetId === binId ? { ...t, status: 'resolved' } : t))
    );

    showToast(
      'success',
      `♻️ Server Controller Replaced Bin (${binId})`,
      `New smart bin unit deployed and online. Fill reset to 0%, lid sealed, and citizen report #${reportId} marked resolved.`
    );
  };

  // Clean all bins helper (Zero Waste simulation)
  const handleCleanAllBins = () => {
    setBins((prev) =>
      prev.map((b) => ({
        ...b,
        fillLevel: 0,
        sensorStatus: 'optimal',
        sensorAlerts: [],
        bidPriority: 'normal',
        lastEmptied: 'Just now (Cleaned)',
        currentBidAmount: 10,
      }))
    );
    showToast(
      'success',
      '✨ City Cleaned (Zero Waste)',
      'All smart bins successfully emptied to 0% fill level. City cleanliness rating: 100% Optimal!'
    );
  };

  // Simulate a resident report sent to Server Controller
  const handleSimulateCitizenReport = () => {
    const targetBin = bins[0] || INITIAL_SMART_BINS[0];
    handleSubmitResidentReport({
      residentName: 'Sarah Jenkins (Civic Resident)',
      binId: targetBin.id,
      type: 'replace_bin',
      description: 'Cracked plastic lid from delivery truck impact. Trash exposed to rain, please replace unit.',
    });
    setCurrentPersona('Server Controller');
  };

  const handleToggleVoice = () => {
    const newState = !isVoiceActive;
    setIsVoiceActive(newState);
    setVoiceEnabled(newState);
    playAudioBeep('click');
    if (newState) {
      speak('Voice guide turned on. The app will speak aloud to guide you.', true);
    }
  };

  const handleTriggerTruckPickup = () => {
    playAudioBeep('pickup');
    handleAdvanceExecution();
    showToast(
      'success',
      '🚛 Robot Truck Dispatched',
      'Autonomous electric truck is emptying the nearest bin along its route!'
    );
  };

  const handleRequestBulkyDirect = () => {
    const targetBin = bins[0] || INITIAL_SMART_BINS[0];
    handleRequestBulkyPickup(targetBin.id, 'Discarded couch and table on sidewalk.');
  };

  const handleRequestBulkyPickup = (binId: string, description: string) => {
    const newReport: ResidentReport = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      residentName: 'Civic Resident',
      binId,
      type: 'bulky_item_request',
      description,
      timestamp: 'Just now',
      rewardPoints: 50,
      status: 'scheduled',
    };
    setResidentReports((prev) => [newReport, ...prev]);

    // Elevate bin priority for auction and append bulky item description
    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { 
        ...b, 
        bidPriority: 'critical', 
        currentBidAmount: 95,
        sensorAlerts: [`Bulky Item Request: "${description}"`, ...(b.sensorAlerts || [])]
      } : b))
    );

    const newBid: NegotiationBid = {
      id: `BID-BULKY-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      binId,
      binName: bins.find((b) => b.id === binId)?.name || binId,
      truckId: trucks[0]?.id || 'TRUCK-01',
      truckName: trucks[0]?.name || 'Unit Alpha',
      binFillLevel: bins.find((b) => b.id === binId)?.fillLevel || 75,
      urgencyScore: 92,
      proposedCostMetric: 18.0,
      status: 'accepted',
      rationale: `On-Demand Bulky Item Request: "${description}" — Dispatched to hydraulic robotic lifter.`,
    };
    setBids((prev) => [newBid, ...prev]);

    showToast(
      'success',
      `🛋️ Bulky Item Request Scheduled (${binId})`,
      `"${description}" queued for autonomous vehicle pickup. +50 Eco-Credits awarded.`
    );
  };

  // Maintenance tickets
  const handleResolveTicket = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'resolved' } : t))
    );
  };

  const handleCalibrateBin = (binId: string) => {
    setBins((prev) =>
      prev.map((b) => (b.id === binId ? { ...b, sensorStatus: 'optimal', sensorAlerts: [] } : b))
    );
    setTickets((prev) =>
      prev.map((t) => (t.targetId === binId ? { ...t, status: 'calibrated' } : t))
    );
  };

  // Truck controls
  const handleRechargeTruck = (truckId: string) => {
    setTrucks((prev) =>
      prev.map((t) => (t.id === truckId ? { ...t, batteryLevel: 100, currentLoadKg: 0 } : t))
    );
    if (selectedTruck?.id === truckId) {
      setSelectedTruck((prev) => (prev ? { ...prev, batteryLevel: 100, currentLoadKg: 0 } : null));
    }
  };

  const handleToggleTruckMode = (truckId: string) => {
    setTrucks((prev) =>
      prev.map((t) =>
        t.id === truckId
          ? {
              ...t,
              driverAgentMode: t.driverAgentMode === 'autonomous' ? 'teleoperation_override' : 'autonomous',
            }
          : t
      )
    );
    if (selectedTruck?.id === truckId) {
      setSelectedTruck((prev) =>
        prev
          ? {
              ...prev,
              driverAgentMode: prev.driverAgentMode === 'autonomous' ? 'teleoperation_override' : 'autonomous',
            }
          : null
      );
    }
  };

  // Calculate stats for header & workflow bar
  const criticalBinCount = bins.filter((b) => b.fillLevel >= 85 || b.bidPriority === 'critical').length;
  const activeTruckCount = trucks.filter((t) => t.status !== 'maintenance').length;
  const completedWaypoints = activeRoute?.waypoints.filter((w) => w.status === 'completed').length || 0;
  const totalWaypoints = activeRoute?.waypoints.length || 1;
  const collectionProgress = (completedWaypoints / totalWaypoints) * 100;

  return (
    <div className="min-h-screen bg-[#0c1017] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* Pega Blueprint Header with Persona Selector & Area Deployment Switcher */}
      <Header
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        personas={INITIAL_PERSONAS}
        aiEnabled={aiEnabled}
        activeTruckCount={activeTruckCount}
        criticalBinCount={criticalBinCount}
        currentAreaName={currentArea.name}
        onOpenAreaModal={() => setIsAreaModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Direct 1-Click Select Area Deployment Bar */}
      <div className="bg-[#0e141d] border-b border-[#1c2432] px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1 px-2 rounded-md bg-blue-500/10 text-blue-300 font-bold text-[10px] font-mono border border-blue-500/20 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              <span>MUNICIPAL SECTOR:</span>
            </span>

            {/* Direct 1-Click Area Selector Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {availableAreas.map((area) => {
                const isCurrent = area.id === currentAreaId;
                return (
                  <button
                    key={area.id}
                    id={`btn-deploy-area-${area.id}`}
                    onClick={() => handleDeployArea(area.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                        : 'bg-[#141b26] hover:bg-[#1a2332] text-slate-300 hover:text-white border border-[#222d3e]'
                    }`}
                    title={`Click to deploy autonomous fleet to ${area.name}`}
                  >
                    <span>{area.name.split('&')[0].trim()}</span>
                    {isCurrent && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-area-modal"
              onClick={() => setIsAreaModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-[#141b26] hover:bg-[#1a2332] text-slate-200 border border-[#263346] font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              <span>All Sectors</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pega Workflows Bar */}
      <WorkflowBar
        activeWorkflowTab={activeWorkflowTab}
        onSelectWorkflowTab={setActiveWorkflowTab}
        onTriggerNegotiation={handleRunNegotiation}
        onAdvanceExecution={handleAdvanceExecution}
        onSimulateSurge={handleSimulateSurge}
        onFillBinTo100={handleFillBinTo100}
        autoCollectOn100={autoCollectOn100}
        onToggleAutoCollect={() => setAutoCollectOn100(!autoCollectOn100)}
        isNegotiating={isNegotiating}
        isAdvancing={isAdvancing}
        collectionProgress={collectionProgress}
        activeRouteName={activeRoute ? activeRoute.routeId : 'None'}
      />

      {/* Floating System Notification Toast */}
      {toastNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className={`p-2 rounded-xl text-xs ${toastNotification.type === 'alert' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                {toastNotification.type === 'alert' ? '🚨' : '✅'}
              </div>
              <div className="space-y-1">
                <h4 className={`text-xs font-bold ${toastNotification.type === 'alert' ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {toastNotification.title}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {toastNotification.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="text-slate-500 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Subtle Metric Cards Section Grouping Fleet Telemetry */}
        <FleetMetricsCards
          bins={bins}
          trucks={trucks}
          activeRoute={activeRoute}
          collectionProgress={collectionProgress}
        />

        {/* Live Vector Map of Metro Grid */}
        <MapCanvas
          bins={bins}
          trucks={trucks}
          activeRoute={activeRoute}
          selectedBinId={selectedBin?.id || null}
          selectedTruckId={selectedTruck?.id || null}
          onSelectBin={(b) => setSelectedBin(b)}
          onSelectTruck={(t) => setSelectedTruck(t)}
          onCollectBin={collectSpecificBin}
          currentArea={currentArea}
          areas={availableAreas}
          onDeployArea={handleDeployArea}
          onOpenAreaModal={() => setIsAreaModalOpen(true)}
        />

        {/* Visual Picture & Voice Action Center (Accessible & Illiterate-Friendly) */}
        <PictureActionCenter
          bins={bins}
          trucks={trucks}
          onFillBinTo100={handleFillBinTo100}
          onSimulateCitizenReport={handleSimulateCitizenReport}
          onCleanAllBins={handleCleanAllBins}
          onTriggerTruckPickup={handleTriggerTruckPickup}
          onRequestBulkyPickup={handleRequestBulkyDirect}
          isVoiceActive={isVoiceActive}
          onToggleVoice={handleToggleVoice}
        />

        {/* Workflow Component: Multi-Agent Negotiation Hub */}
        {activeWorkflowTab === 'route_optimization' && (
          <NegotiationHub
            bids={bids}
            bins={bins}
            trucks={trucks}
            onRunNegotiation={handleRunNegotiation}
            isNegotiating={isNegotiating}
            aiRationale={aiRationale}
            onApplyRoute={handleApplyRoute}
            onAcceptBidManually={(bidId) => {
              setBids((prev) =>
                prev.map((b) => (b.id === bidId ? { ...b, status: 'accepted' } : b))
              );
            }}
            onCollectBin={collectSpecificBin}
          />
        )}

        {/* Role Guide Banner for Plain English Understanding */}
        <RoleGuideBanner
          currentPersona={currentPersona}
          onOpenGuide={() => setIsGuideModalOpen(true)}
          onSelectPersona={setCurrentPersona}
        />

        {/* Persona Channels Views */}
        <section id="persona-channel-view" className="transition-all duration-200">
          {currentPersona === 'Operations Supervisor' && (
            <SupervisorView
              bins={bins}
              trucks={trucks}
              activeRoute={activeRoute}
              onDispatchRoute={handleApplyRoute}
              onEmergencyRecall={() => {
                setTrucks((prev) =>
                  prev.map((t) => ({ ...t, status: 'returning', coords: { x: 50, y: 50 } }))
                );
              }}
              onCollectBin={collectSpecificBin}
            />
          )}

          {currentPersona === 'Driver Agent' && (
            <DriverAgentHUD
              truck={trucks[0]}
              activeRoute={activeRoute}
              onAdvanceWaypoint={handleAdvanceExecution}
              onToggleMode={() => handleToggleTruckMode(trucks[0].id)}
              onSimulateObstruction={() => {
                alert('Obstacle reported! Dynamic routing engine recalculated detour.');
              }}
            />
          )}

          {currentPersona === 'Maintenance Technician' && (
            <MaintenanceTechView
              tickets={tickets}
              bins={bins}
              trucks={trucks}
              onResolveTicket={handleResolveTicket}
              onCalibrateBin={handleCalibrateBin}
            />
          )}

          {currentPersona === 'City Resident' && (
            <ResidentPortal
              bins={bins}
              reports={residentReports}
              onSubmitReport={handleSubmitResidentReport}
              onRequestBulkyPickup={handleRequestBulkyPickup}
            />
          )}

          {currentPersona === 'Server Controller' && (
            <ControlAgentView
              bins={bins}
              trucks={trucks}
              reports={residentReports}
              onTriggerAuction={handleRunNegotiation}
              isNegotiating={isNegotiating}
              onFillBinTo100={handleFillBinTo100}
              autoCollectOn100={autoCollectOn100}
              onToggleAutoCollect={() => setAutoCollectOn100(!autoCollectOn100)}
              onReplaceBinFromReport={handleReplaceBinFromReport}
            />
          )}
        </section>

      </main>

      {/* Interactive Detail Modals */}
      <BinDetailModal
        bin={selectedBin}
        onClose={() => setSelectedBin(null)}
        onUpdateFill={handleUpdateBinFill}
        onToggleLid={handleToggleLid}
        onTriggerPriorityBid={handleTriggerPriorityBid}
        onCollectBin={collectSpecificBin}
        isCollecting={isCollectingBinId === selectedBin?.id}
      />

      <TruckDetailModal
        truck={selectedTruck}
        onClose={() => setSelectedTruck(null)}
        onRecharge={handleRechargeTruck}
        onToggleMode={handleToggleTruckMode}
      />

      {/* Municipal Area Deployment Selection Modal */}
      <AreaDeploymentModal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        areas={availableAreas}
        currentAreaId={currentAreaId}
        onDeployArea={handleDeployArea}
        onDeployCustomArea={handleDeployCustomArea}
      />

      {/* Interactive Plain-English How It Works & Demo Modal */}
      <HowItWorksModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onSelectPersona={setCurrentPersona}
        onSimulateOverflow={handleFillBinTo100}
        onSimulateCitizenReport={handleSimulateCitizenReport}
        onCleanAllBins={handleCleanAllBins}
      />
    </div>
  );
}
