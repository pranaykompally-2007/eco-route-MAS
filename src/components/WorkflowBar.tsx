import React from 'react';
import { 
  GitBranch, 
  Play, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Navigation,
  ArrowRight,
  Radio
} from 'lucide-react';

interface WorkflowBarProps {
  activeWorkflowTab: 'route_optimization' | 'collection_execution';
  onSelectWorkflowTab: (tab: 'route_optimization' | 'collection_execution') => void;
  onTriggerNegotiation: () => void;
  onAdvanceExecution: () => void;
  onSimulateSurge: () => void;
  onFillBinTo100?: () => void;
  autoCollectOn100?: boolean;
  onToggleAutoCollect?: () => void;
  isNegotiating: boolean;
  isAdvancing: boolean;
  collectionProgress: number;
  activeRouteName: string;
}

export const WorkflowBar: React.FC<WorkflowBarProps> = ({
  activeWorkflowTab,
  onSelectWorkflowTab,
  onTriggerNegotiation,
  onAdvanceExecution,
  onSimulateSurge,
  onFillBinTo100,
  autoCollectOn100 = true,
  onToggleAutoCollect,
  isNegotiating,
  isAdvancing,
  collectionProgress,
  activeRouteName,
}) => {
  return (
    <section id="workflow-bar" className="bg-[#0e131b]/95 border-b border-[#1c2432] backdrop-blur px-4 sm:px-6 lg:px-8 py-2.5 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        
        {/* Workflow Switcher & Stage Visualization */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span>Workflows:</span>
          </div>

          <div className="inline-flex rounded-lg bg-[#080c12] p-1 border border-[#1e2634]">
            <button
              id="tab-workflow-optimization"
              onClick={() => onSelectWorkflowTab('route_optimization')}
              title="Autonomous trucks and bins coordinate the shortest green collection route"
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                activeWorkflowTab === 'route_optimization'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>1. Smart Route Planning</span>
            </button>
            <button
              id="tab-workflow-execution"
              onClick={() => onSelectWorkflowTab('collection_execution')}
              title="Electric truck robotically collects trash from each assigned bin"
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                activeWorkflowTab === 'collection_execution'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>2. Live Truck Collection</span>
            </button>
          </div>
        </div>

        {/* Dynamic Workflow Process Steps */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-slate-400">
          {activeWorkflowTab === 'route_optimization' ? (
            <>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Smart Bins Broadcast
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-300 flex items-center gap-1">
                Truck Agents Bid
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="text-blue-400 flex items-center gap-1">
                AI Fuel Matrix
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-400">Dispatch Ready</span>
            </>
          ) : (
            <>
              <span className="text-blue-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Autonomous Transit
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="text-emerald-400 flex items-center gap-1">
                Optical/NFC Lock
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-300 flex items-center gap-1">
                Arm Lift & Tare
              </span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-400">Tare Reset</span>
            </>
          )}
        </div>

        {/* Live Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {onFillBinTo100 && (
            <button
              id="btn-fill-100"
              onClick={onFillBinTo100}
              title="Fills a smart bin to 100% to test mandatory autonomous collection"
              className="px-3 py-1.5 rounded-lg bg-[#24141a] hover:bg-[#301a24] text-rose-300 border border-rose-500/40 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Fill Bin to 100%</span>
            </button>
          )}

          {activeWorkflowTab === 'route_optimization' ? (
            <button
              id="btn-run-negotiation"
              onClick={onTriggerNegotiation}
              disabled={isNegotiating}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isNegotiating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isNegotiating ? 'Negotiating Bids...' : 'Run Multi-Agent Auction'}</span>
            </button>
          ) : (
            <button
              id="btn-advance-execution"
              onClick={onAdvanceExecution}
              disabled={isAdvancing}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isAdvancing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Advance Waypoint ({Math.round(collectionProgress)}%)</span>
            </button>
          )}

          <button
            id="btn-simulate-surge"
            onClick={onSimulateSurge}
            title="Simulate sudden trash accumulation (100% full capacity surge)"
            className="px-3 py-1.5 rounded-lg bg-[#1e1a14] hover:bg-[#282218] text-amber-300 border border-amber-500/30 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Waste Surge</span>
          </button>
        </div>

      </div>
    </section>
  );
};
