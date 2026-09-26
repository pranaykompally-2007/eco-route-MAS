import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Check, 
  ArrowRight, 
  Truck,
  Trash2,
  Wrench,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SmartBin, TruckAgent } from '../types';
import { speak, playAudioBeep } from '../utils/voiceGuide';

interface PictureActionCenterProps {
  bins: SmartBin[];
  trucks: TruckAgent[];
  onFillBinTo100: () => void;
  onSimulateCitizenReport: () => void;
  onCleanAllBins: () => void;
  onTriggerTruckPickup: () => void;
  onRequestBulkyPickup: () => void;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
}

export const PictureActionCenter: React.FC<PictureActionCenterProps> = ({
  bins,
  trucks,
  onFillBinTo100,
  onSimulateCitizenReport,
  onCleanAllBins,
  onTriggerTruckPickup,
  onRequestBulkyPickup,
  isVoiceActive,
  onToggleVoice,
}) => {
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);

  const fullBins = bins.filter((b) => b.fillLevel >= 85);
  const cleanBins = bins.filter((b) => b.fillLevel < 65);

  const speakAction = (title: string, voiceMessage: string, actionFn: () => void) => {
    playAudioBeep('click');
    setActiveSpeechText(voiceMessage);
    speak(voiceMessage, true);
    actionFn();
    setTimeout(() => {
      setActiveSpeechText(null);
    }, 4500);
  };

  const handleReadCityStatus = () => {
    playAudioBeep('pickup');
    const msg = `City status: ${cleanBins.length} bins are clean. ${fullBins.length} bins are full and need a truck. ${trucks.length} electric trucks are driving. Tap any big picture button to test!`;
    setActiveSpeechText(msg);
    speak(msg, true);
    setTimeout(() => {
      setActiveSpeechText(null);
    }, 6000);
  };

  return (
    <section 
      id="picture-action-center" 
      className="bg-[#0e141e] border border-[#212c3d] rounded-2xl p-4 sm:p-5 shadow-lg text-slate-100 space-y-4 font-sans"
    >
      {/* Top Banner: Easy Picture Mode & Voice Read-Aloud */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2635] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xl shadow-sm">
            🖼️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Visual Picture & Voice Controls
              </h3>
              <span className="text-[10px] bg-blue-500/15 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-500/30">
                1-TAP TOUCH
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-contrast picture shortcuts with spoken voice assistance for instant fleet operations.
            </p>
          </div>
        </div>

        {/* Big Voice Assistant Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReadCityStatus}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/20 cursor-pointer"
            title="Hear the voice assistant speak city status out loud"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>🔊 Speak City Status</span>
          </button>

          <button
            onClick={onToggleVoice}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isVoiceActive
                ? 'bg-blue-600/15 text-blue-300 border-blue-500/30'
                : 'bg-[#151c27] text-slate-400 border-[#243042]'
            }`}
            title="Turn voice speaking on or off"
          >
            {isVoiceActive ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice: {isVoiceActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Voice feedback bubble when speaking */}
      {activeSpeechText && (
        <div className="p-3 bg-[#111c2c] border border-blue-500/40 rounded-xl flex items-center gap-3 text-blue-200 text-xs animate-in fade-in">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white font-bold animate-pulse">
            🔊
          </div>
          <span className="font-medium text-white text-xs">
            {activeSpeechText}
          </span>
        </div>
      )}

      {/* 5 High-Contrast Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* CARD 1: TRASH IS FULL! (Controlled Crimson) */}
        <button
          onClick={() =>
            speakAction(
              'Trash Full',
              'Trash is full! An emergency alert is sent and the nearest robot truck is dispatched to empty it!',
              onFillBinTo100
            )
          }
          className="p-3.5 rounded-xl bg-[#191116] border border-rose-500/40 hover:border-rose-400 active:scale-95 transition-all text-center flex flex-col items-center justify-between gap-2 shadow-sm cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🚨
          </div>
          <div>
            <div className="font-bold text-rose-300 text-xs tracking-wide">
              TRASH FULL!
            </div>
            <div className="text-[10px] text-rose-300/70 mt-0.5">
              1-Tap Surge
            </div>
          </div>
          <div className="w-full py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors">
            <Volume2 className="w-3 h-3" />
            <span>Make Full</span>
          </div>
        </button>

        {/* CARD 2: BIN IS BROKEN! (Violet/Purple) */}
        <button
          onClick={() =>
            speakAction(
              'Bin Broken',
              'Bin is broken! Sending a report to the server controller to replace it with a brand new clean bin!',
              onSimulateCitizenReport
            )
          }
          className="p-3.5 rounded-xl bg-[#171221] border border-purple-500/40 hover:border-purple-400 active:scale-95 transition-all text-center flex flex-col items-center justify-between gap-2 shadow-sm cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🔨
          </div>
          <div>
            <div className="font-bold text-purple-300 text-xs tracking-wide">
              BIN BROKEN!
            </div>
            <div className="text-[10px] text-purple-300/70 mt-0.5">
              Request New
            </div>
          </div>
          <div className="w-full py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors">
            <Volume2 className="w-3 h-3" />
            <span>Replace Bin</span>
          </div>
        </button>

        {/* CARD 3: BIG FURNITURE! (Soft Amber) */}
        <button
          onClick={() =>
            speakAction(
              'Big Furniture',
              'Big sofa and furniture pickup requested! Electric heavy-lift truck scheduled!',
              onRequestBulkyPickup
            )
          }
          className="p-3.5 rounded-xl bg-[#1b1710] border border-amber-500/40 hover:border-amber-400 active:scale-95 transition-all text-center flex flex-col items-center justify-between gap-2 shadow-sm cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            🛋️
          </div>
          <div>
            <div className="font-bold text-amber-300 text-xs tracking-wide">
              BIG FURNITURE!
            </div>
            <div className="text-[10px] text-amber-300/70 mt-0.5">
              Sofas & Desks
            </div>
          </div>
          <div className="w-full py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors">
            <Volume2 className="w-3 h-3" />
            <span>Pickup Couch</span>
          </div>
        </button>

        {/* CARD 4: CALL TRUCK! (Vibrant Electric Blue) */}
        <button
          onClick={() =>
            speakAction(
              'Call Truck',
              'Calling autonomous electric robot truck! The truck is driving to collect trash right now!',
              onTriggerTruckPickup
            )
          }
          className="p-3.5 rounded-xl bg-[#101726] border border-blue-500/40 hover:border-blue-400 active:scale-95 transition-all text-center flex flex-col items-center justify-between gap-2 shadow-sm cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform text-blue-400">
            🚛
          </div>
          <div>
            <div className="font-bold text-blue-300 text-xs tracking-wide">
              CALL TRUCK!
            </div>
            <div className="text-[10px] text-blue-300/70 mt-0.5">
              Next Waypoint
            </div>
          </div>
          <div className="w-full py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors">
            <Volume2 className="w-3 h-3" />
            <span>Drive Truck</span>
          </div>
        </button>

        {/* CARD 5: CLEAN EVERYTHING! (Emerald Green) */}
        <button
          onClick={() =>
            speakAction(
              'Clean Everything',
              'All trash emptied! The whole city is sparkling clean and green! Zero waste on the streets!',
              onCleanAllBins
            )
          }
          className="p-3.5 rounded-xl bg-[#0e1a17] border border-emerald-500/40 hover:border-emerald-400 active:scale-95 transition-all text-center flex flex-col items-center justify-between gap-2 shadow-sm cursor-pointer col-span-2 sm:col-span-1 group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform text-emerald-400">
            ✨
          </div>
          <div>
            <div className="font-bold text-emerald-300 text-xs tracking-wide">
              CLEAN CITY!
            </div>
            <div className="text-[10px] text-emerald-300/70 mt-0.5">
              Zero-Waste (0%)
            </div>
          </div>
          <div className="w-full py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors">
            <Volume2 className="w-3 h-3" />
            <span>Clean All</span>
          </div>
        </button>

      </div>

      {/* High-Contrast Color Key */}
      <div className="pt-2 border-t border-[#1a2332] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 font-semibold text-[11px] tracking-wide">
          SYSTEM STATUS KEY:
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <span className="font-medium text-emerald-400">Emerald = Clean & Nominal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
            <span className="font-medium text-blue-400">Blue = Active Route / Vehicle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <span className="font-medium text-amber-300">Amber = Approaching Capacity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm animate-pulse" />
            <span className="font-medium text-rose-400">Crimson = Critical Attention</span>
          </div>
        </div>
      </div>
    </section>
  );
};
