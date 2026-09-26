import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Fuel, 
  Zap, 
  ShieldAlert
} from 'lucide-react';
import { NegotiationBid, SmartBin, TruckAgent } from '../types';

interface NegotiationHubProps {
  bids: NegotiationBid[];
  bins: SmartBin[];
  trucks: TruckAgent[];
  onRunNegotiation: () => void;
  isNegotiating: boolean;
  aiRationale: string | null;
  onApplyRoute: () => void;
  onAcceptBidManually: (bidId: string) => void;
  onCollectBin?: (binId: string) => void;
}

export const NegotiationHub: React.FC<NegotiationHubProps> = ({
  bids,
  bins,
  trucks,
  onRunNegotiation,
  isNegotiating,
  aiRationale,
  onApplyRoute,
  onAcceptBidManually,
  onCollectBin,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredBids = bids.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  const acceptedCount = bids.filter((b) => b.status === 'accepted').length;
  const full100Bins = bins.filter((b) => b.fillLevel >= 100);

  return (
    <div id="negotiation-hub" className="bg-[#0e141d] rounded-2xl border border-[#1f2939] p-5 space-y-4 shadow-lg font-sans">
      {/* Header & Metric Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b2432] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">
              Multi-Agent Negotiation Exchange
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#16202e] text-blue-300 font-mono border border-[#233146]">
              Optimization Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Smart bins broadcast urgency bids; autonomous truck agents evaluate payload capacity and marginal detour costs.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            id="negotiation-run-btn"
            onClick={onRunNegotiation}
            disabled={isNegotiating}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isNegotiating ? (
              <Sparkles className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-white" />
            )}
            <span>{isNegotiating ? 'Simulating Auction...' : 'Run Negotiation Auction'}</span>
          </button>

          {acceptedCount > 0 && (
            <button
              id="apply-optimized-route-btn"
              onClick={onApplyRoute}
              className="px-4 py-2 rounded-xl bg-[#182333] hover:bg-[#202e42] text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Build Route ({acceptedCount} Bins)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 100% Full Capacity Alert in Negotiation Hub */}
      {full100Bins.length > 0 && (
        <div className="bg-[#1f1218] border border-rose-500/40 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-rose-200 shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-rose-300 flex items-center gap-2">
                <span>Mandatory Zero-Overflow Rule: {full100Bins.length} Smart Bin(s) at 100% Full</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  AUTO-DISPATCH MANDATE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Bins at 100% capacity ({full100Bins.map(b => b.id).join(', ')}) bypass normal bidding queues and are guaranteed immediate collection.
              </p>
            </div>
          </div>

          {onCollectBin && (
            <button
              onClick={() => onCollectBin(full100Bins[0].id)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Collect {full100Bins[0].id} (0%)
            </button>
          )}
        </div>
      )}

      {/* Rationale & Energy Savings Highlight */}
      {aiRationale && (
        <div className="bg-[#101723] border border-blue-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-300">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-blue-300 flex items-center gap-2">
              <span>Agentic Negotiation Consensus & Fuel Matrix</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                Optimization Score: 96.4%
              </span>
            </div>
            <p className="leading-relaxed text-slate-300">
              {aiRationale}
            </p>
          </div>
        </div>
      )}

      {/* Subtle Metric Cards Section Grouping Negotiation Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#121822] border border-[#1e2634] rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400 block">Total Active Bids</span>
          <div className="text-xl font-bold text-white mt-0.5 font-mono tabular-nums">{bids.length}</div>
          <span className="text-[10px] text-slate-500 font-mono">From IoT Nodes</span>
        </div>

        <div className="bg-[#121822] border border-[#1e2634] rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400 block">Accepted for Route</span>
          <div className="text-xl font-bold text-emerald-400 mt-0.5 font-mono tabular-nums">{acceptedCount}</div>
          <span className="text-[10px] text-emerald-400 font-mono">Assigned to Alpha</span>
        </div>

        <div className="bg-[#121822] border border-[#1e2634] rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400 block">Est. Energy Economy</span>
          <div className="text-xl font-bold text-blue-400 mt-0.5 font-mono tabular-nums">14.2 kWh</div>
          <span className="text-[10px] text-blue-400/80 font-mono">-32% vs static routes</span>
        </div>

        <div className="bg-[#121822] border border-[#1e2634] rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400 block">CO2 Emissions Avoided</span>
          <div className="text-xl font-bold text-emerald-400 mt-0.5 font-mono tabular-nums">38.6 kg</div>
          <span className="text-[10px] text-emerald-400/80 font-mono">Electric collector</span>
        </div>
      </div>

      {/* Bids Table & Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Live Auction Bids & Agent Dialogue
          </h3>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 text-[11px] mr-1">Filter:</span>
            {['all', 'accepted', 'declined', 'truck_evaluated'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors cursor-pointer ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 bg-[#141b26]'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1e2634]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0f16] text-slate-400 font-mono text-[11px] uppercase border-b border-[#1e2634]">
              <tr>
                <th className="py-2.5 px-3">Bid ID</th>
                <th className="py-2.5 px-3">Smart Bin</th>
                <th className="py-2.5 px-3">Fill / Urgency</th>
                <th className="py-2.5 px-3">Truck Agent</th>
                <th className="py-2.5 px-3">Marginal Cost Metric</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Agent Rationale</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18212e] bg-[#0d121a]">
              {filteredBids.map((bid) => {
                const isAccepted = bid.status === 'accepted';
                const isDeclined = bid.status === 'declined';

                return (
                  <tr key={bid.id} className="hover:bg-[#121924] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-300 font-medium">
                      {bid.id}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{bid.binName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{bid.binId}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-mono font-bold ${bid.binFillLevel >= 85 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {bid.binFillLevel}%
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Score: {bid.urgencyScore}/100
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      {bid.truckName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300 tabular-nums">
                      ${bid.proposedCostMetric.toFixed(2)} kWh
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                          isAccepted
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : isDeclined
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isAccepted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Accepted</span>
                          </>
                        ) : isDeclined ? (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Declined</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Evaluating</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs text-[11px] leading-relaxed">
                      {bid.rationale}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {!isAccepted && (
                        <button
                          onClick={() => onAcceptBidManually(bid.id)}
                          className="px-2.5 py-1 rounded bg-[#182333] hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Force Add
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
