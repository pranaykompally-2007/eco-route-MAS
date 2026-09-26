import React, { useState } from 'react';
import { 
  User, 
  Trash2, 
  Gift, 
  MapPin, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Leaf, 
  Package,
  Clock,
  Check,
  Tag,
  MessageSquare,
  Flame,
  AlertTriangle,
  FileText,
  Volume2
} from 'lucide-react';
import { SmartBin, ResidentReport } from '../types';
import { VisualTrashCan } from './VisualTrashCan';
import { speak, playAudioBeep } from '../utils/voiceGuide';

interface ResidentPortalProps {
  bins: SmartBin[];
  reports: ResidentReport[];
  onSubmitReport: (report: Omit<ResidentReport, 'id' | 'timestamp' | 'rewardPoints' | 'status'>) => void;
  onRequestBulkyPickup: (binId: string, description: string) => void;
}

export const ResidentPortal: React.FC<ResidentPortalProps> = ({
  bins,
  reports,
  onSubmitReport,
  onRequestBulkyPickup,
}) => {
  const [selectedBinId, setSelectedBinId] = useState<string>(bins[0]?.id || 'BIN-101');
  const [residentName, setResidentName] = useState<string>('Civic Resident (Apt #4B)');
  const [reportType, setReportType] = useState<ResidentReport['type']>('overflow_alert');
  const [description, setDescription] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<{ text: string; desc: string; pts: number } | null>(null);

  const [ecoPoints, setEcoPoints] = useState<number>(245);
  const [reportFilter, setReportFilter] = useState<'all' | 'my_reports' | 'scheduled' | 'resolved'>('all');

  // Quick description chips / template phrases to make reporting effortless
  const descriptionTemplates = [
    { label: '♻️ Replace damaged bin', text: 'Bin is cracked / defective and needs complete physical unit replacement by Server Controller' },
    { label: '⚠️ Overflow onto sidewalk', text: 'Waste is overflowing onto pedestrian pathway and blocking access' },
    { label: '🛋️ Bulky furniture dumped', text: 'Discarded armchair and wooden furniture left beside bin' },
    { label: '🔒 Lid mechanism jammed open', text: 'Smart lid sensor is stuck open and will not close pneumatically' },
    { label: '🦨 Strong rotting odor leak', text: 'Severe foul odor emanating from organic waste chamber' },
    { label: '📦 Oversized cardboard boxes', text: 'Unflattened delivery packaging boxes stacked 4 feet high' },
    { label: '🧪 Suspected hazardous waste', text: 'Paint cans and electronic lithium batteries left on top of lid' },
  ];

  const handleTemplateClick = (templateText: string) => {
    setDescription((prev) => (prev ? `${prev}. ${templateText}` : templateText));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const trimmedDesc = description.trim();
    const finalDesc = isUrgent ? `[URGENT OVERRIDE] ${trimmedDesc}` : trimmedDesc;
    const earnedPts = reportType === 'bulky_item_request' ? 50 : reportType === 'replace_bin' ? 35 : 25;

    if (reportType === 'bulky_item_request') {
      onRequestBulkyPickup(selectedBinId, finalDesc);
    } else {
      onSubmitReport({
        residentName: residentName.trim() || 'Civic Resident',
        binId: selectedBinId,
        type: reportType,
        description: finalDesc,
      });
    }

    setEcoPoints((prev) => prev + earnedPts);
    setSubmittedMessage({
      text: `Report for ${selectedBinId} sent to Server Controller to replace and dispatch!`,
      desc: finalDesc,
      pts: earnedPts
    });
    setDescription('');
    setIsUrgent(false);

    setTimeout(() => setSubmittedMessage(null), 6000);
  };

  const targetBin = bins.find((b) => b.id === selectedBinId) || bins[0];

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'scheduled') return r.status === 'scheduled' || r.status === 'submitted';
    if (reportFilter === 'resolved') return r.status === 'resolved';
    return true;
  });

  return (
    <div id="resident-portal" className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">City Resident Civic Channel & Waste Reporting</h3>
            <p className="text-xs text-slate-400">
              Report overflowing smart bins, request bulky item collections, and earn Eco-Reward points for keeping our city clean.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Big Audio Instruction Button for Illiterate Users */}
          <button
            type="button"
            onClick={() => {
              playAudioBeep('pickup');
              speak(
                'Welcome to the city clean up portal! You do not need to read. Step 1: Tap your trash can picture. Step 2: Tap the picture showing what is broken or full. Step 3: Tap the big green button to send help and earn points!'
              );
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:brightness-110 active:brightness-95 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
            title="Click to hear instructions spoken out loud"
          >
            <Volume2 className="w-4 h-4" />
            <span>🔊 Listen to Help</span>
          </button>

          {/* Eco-Points Badge */}
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Eco-Rewards Balance</span>
              <div className="text-lg font-bold font-mono text-emerald-400 leading-none mt-0.5">
                {ecoPoints} <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Grid: Local Bins Status & On-Demand Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Neighborhood Bin Explorer (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Nearby Smart Waste Bins ({bins.length})</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">Live Fill Telemetry</span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Select a smart bin below to check current ultrasonic fill level or submit a direct citizen report with issue description.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 max-h-[460px] overflow-y-auto pr-1">
              {bins.map((b) => {
                const isFull = b.fillLevel >= 85;
                const hasSpace = b.fillLevel < 60;
                const isSelected = selectedBinId === b.id;

                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      playAudioBeep('click');
                      setSelectedBinId(b.id);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate max-w-[140px]">{b.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">{b.id}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{b.address}</div>

                      {/* Fill progress bar */}
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="capitalize text-slate-400">{b.wasteType}</span>
                          <span className={b.fillLevel >= 100 ? 'text-rose-400 font-bold animate-pulse' : isFull ? 'text-rose-400 font-bold' : hasSpace ? 'text-emerald-400' : 'text-amber-300'}>
                            {b.fillLevel >= 100 ? '100% (FULL)' : `${b.fillLevel}%`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${b.fillLevel >= 100 ? 'bg-gradient-to-r from-rose-500 to-purple-500 animate-pulse' : isFull ? 'bg-rose-500' : hasSpace ? 'bg-emerald-500' : 'bg-amber-400'}`}
                            style={{ width: `${Math.min(100, b.fillLevel)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                        <span>Lid: <strong className={b.lidStatus === 'closed' ? 'text-slate-300' : 'text-rose-400'}>{b.lidStatus}</strong></span>
                        <span className={isSelected ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          {isSelected ? '✓ Selected' : 'Tap to select'}
                        </span>
                      </div>
                    </div>

                    {/* Visual Graphic Trash Can with Face */}
                    <div className="shrink-0 pl-1 border-l border-slate-800/80">
                      <VisualTrashCan fillLevel={b.fillLevel} name={b.name} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resident Action Request Form with Rich Description (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  Submit Citizen Waste Report
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                +25 to +50 Eco-Credits
              </span>
            </div>

            {/* Submission confirmation toast/card */}
            {submittedMessage && (
              <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-slate-200 text-xs space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between font-bold text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{submittedMessage.text}</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-400">+{submittedMessage.pts} pts</span>
                </div>
                <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 font-mono">
                  Recorded Description: "{submittedMessage.desc}"
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-3.5 space-y-3.5 text-xs">
              
              {/* Resident Identity / Submitter Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Resident Name / Unit:
                  </label>
                  <input
                    type="text"
                    value={residentName}
                    onChange={(e) => setResidentName(e.target.value)}
                    placeholder="e.g. Maria G. - Apt 4B"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Target Smart Bin:
                  </label>
                  <select
                    value={selectedBinId}
                    onChange={(e) => setSelectedBinId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    {bins.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} — {b.name} ({b.fillLevel}% full)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Bin quick summary indicator */}
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reporting for: <strong className="text-white">{targetBin?.name}</strong> ({targetBin?.address})</span>
                </span>
                <span className={`font-mono font-bold ${targetBin?.fillLevel >= 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {targetBin?.fillLevel}% Fill
                </span>
              </div>

            {/* Request Category Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold text-xs">
                    Choose Issue Category:
                  </label>
                  <span className="text-[10px] text-slate-400">Step 2 of 3</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    { 
                      id: 'replace_bin', 
                      label: 'Replace Bin', 
                      subtitle: 'Cracked, defective, broken', 
                      pts: '+35 pts', 
                      icon: '♻️',
                      voice: 'Replace Bin selected. Server controller will deploy a new clean bin.',
                      defText: 'Bin casing is cracked and physically damaged. Needs full unit replacement.'
                    },
                    { 
                      id: 'overflow_alert', 
                      label: 'Overflow Alert', 
                      subtitle: 'Trash spilling on sidewalk', 
                      pts: '+25 pts', 
                      icon: '🚨',
                      voice: 'Overflow Alert selected. Trash is spilling onto sidewalk.',
                      defText: 'Trash is overflowing past the lid onto the pavement. Urgent collection needed.'
                    },
                    { 
                      id: 'bulky_item_request', 
                      label: 'Bulky Pickup', 
                      subtitle: 'Furniture, sofas, mattresses', 
                      pts: '+50 pts', 
                      icon: '🛋️',
                      voice: 'Bulky Pickup selected. Sofa or large furniture on street.',
                      defText: 'Old couch and wooden furniture left on the curb for large item pickup.'
                    },
                    { 
                      id: 'lid_stuck', 
                      label: 'Lid Jammed', 
                      subtitle: 'Sensor / lid won\'t close', 
                      pts: '+25 pts', 
                      icon: '🔒',
                      voice: 'Lid Jammed selected. The bin lid will not open or close.',
                      defText: 'Hydraulic pneumatic lid is jammed open, exposing waste to rain.'
                    },
                    { 
                      id: 'odor_complaint', 
                      label: 'Odor Issue', 
                      subtitle: 'Foul decomposition smell', 
                      pts: '+15 pts', 
                      icon: '🦨',
                      voice: 'Odor Issue selected. Foul decomposition smell.',
                      defText: 'Strong rotting odor escaping from the bin. Active bio-filter needs replacement.'
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playAudioBeep('click');
                        setReportType(item.id as any);
                        speak(item.voice);
                        if (!description.trim()) {
                          setDescription(item.defText);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        reportType === item.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-white font-medium shadow-sm ring-1 ring-emerald-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs flex items-center gap-1 text-white">
                          <span>{item.icon}</span> {item.label}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">{item.pts}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                        {item.subtitle}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Template Chips for Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-semibold text-xs">
                    Quick Templates (Click to fill Description):
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">1-tap presets</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {descriptionTemplates.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTemplateClick(tmpl.text)}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/40 text-[11px] transition-colors cursor-pointer"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Description Input Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold text-xs">
                    Description & Observations (From Citizen):
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {description.length} characters
                  </span>
                </div>
                <textarea
                  id="resident-report-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail (e.g. 2 broken wooden dining chairs and overflowing cardboard boxes beside BIN-105 blocking the entrance)"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs leading-relaxed"
                />
              </div>

              {/* Urgent Priority Dispatch Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="urgent-checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="urgent-checkbox" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Request Urgent Autonomous Fleet Dispatch (Zero-Overflow Policy)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-submit-resident-report"
                disabled={!description.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 active:brightness-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Report to Server Controller & Claim Eco-Credits</span>
              </button>

              {/* What happens next explainer */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>How your report is handled:</span>
                </span>
                <p className="leading-relaxed">
                  1. Your report is transmitted directly to the <strong>Server Controller</strong>.<br />
                  2. Damaged bins are replaced with new calibrated units; full bins are scheduled for autonomous electric truck pickup.<br />
                  3. You earn instant Eco-Reward points added to your balance.
                </p>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Community Reports History & Full Description Viewer */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Active Citizen Reports & Autonomous Action Log</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Live records of all reports submitted by residents with descriptions, target smart bins, and dispatch status.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setReportFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                reportFilter === 'all' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setReportFilter('scheduled')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                reportFilter === 'scheduled' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Queue ({reports.filter(r => r.status !== 'resolved').length})
            </button>
            <button
              onClick={() => setReportFilter('resolved')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                reportFilter === 'resolved' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Resolved ({reports.filter(r => r.status === 'resolved').length})
            </button>
          </div>
        </div>

        {/* Reports Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredReports.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-slate-500 text-xs">
              No reports found in this category. Submit a new report above!
            </div>
          ) : (
            filteredReports.map((r) => {
              const binInfo = bins.find(b => b.id === r.binId);

              return (
                <div
                  key={r.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5 transition-all hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                        {r.id}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {r.residentName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                        r.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : r.status === 'scheduled'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {r.status === 'resolved' ? '✓ Cleaned & Resolved' : r.status === 'scheduled' ? '⚡ Truck Assigned' : '⏳ Queued'}
                      </span>
                      <span className="font-mono text-emerald-400 text-[11px] font-bold">
                        +{r.rewardPoints} pts
                      </span>
                    </div>
                  </div>

                  {/* Citizen's Exact Reported Description */}
                  <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/80 text-xs text-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>Citizen Description:</span>
                    </div>
                    <p className="italic text-slate-100 leading-relaxed font-sans">
                      "{r.description}"
                    </p>
                  </div>

                  {/* Target Smart Bin & Timestamp info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{r.binId} {binInfo ? `(${binInfo.name})` : ''}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                      <Clock className="w-3 h-3" />
                      <span>{r.timestamp}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
