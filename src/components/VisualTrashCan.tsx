import React from 'react';
import { Volume2 } from 'lucide-react';
import { speak, playAudioBeep } from '../utils/voiceGuide';

interface VisualTrashCanProps {
  fillLevel: number; // 0 to 100
  name: string;
  wasteType?: string;
  size?: 'sm' | 'md' | 'lg';
  showAudioButton?: boolean;
  onAudioClick?: () => void;
}

export const VisualTrashCan: React.FC<VisualTrashCanProps> = ({
  fillLevel,
  name,
  wasteType = 'general',
  size = 'md',
  showAudioButton = true,
}) => {
  const isFull = fillLevel >= 85;
  const isHalf = fillLevel >= 65 && fillLevel < 85;

  const faceEmoji = isFull ? '🚨' : isHalf ? '😐' : '😊';
  const statusWord = isFull ? 'Full' : isHalf ? 'Warning' : 'Clean';

  const heightClass = size === 'lg' ? 'h-32 w-20' : size === 'md' ? 'h-24 w-16' : 'h-16 w-12';

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    playAudioBeep('click');
    speak(`${name}. Fill level is ${fillLevel} percent. Status is ${statusWord}.`);
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none font-sans">
      {/* Top Lid Graphic */}
      <div 
        className={`w-[110%] rounded-t-md transition-colors ${
          isFull ? 'bg-rose-500' : isHalf ? 'bg-amber-400' : 'bg-emerald-500'
        } ${size === 'lg' ? 'h-2.5' : size === 'md' ? 'h-2' : 'h-1.5'} shadow-sm`}
      />

      {/* Main Trash Can Body Container */}
      <div 
        className={`relative ${heightClass} bg-[#0e141e] border-2 rounded-b-xl overflow-hidden flex flex-col justify-end transition-all ${
          isFull 
            ? 'border-rose-500/80 shadow-md shadow-rose-950/40' 
            : isHalf 
            ? 'border-amber-400/80' 
            : 'border-emerald-500/80'
        }`}
      >
        {/* Can Structural Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex flex-col justify-between py-2">
          <div className="border-b border-white/30 w-full" />
          <div className="border-b border-white/30 w-full" />
          <div className="border-b border-white/30 w-full" />
        </div>

        {/* Dynamic Trash Level Fill */}
        <div 
          className={`w-full transition-all duration-500 relative flex items-center justify-center ${
            isFull 
              ? 'bg-gradient-to-t from-rose-700 via-rose-600 to-rose-500' 
              : isHalf 
              ? 'bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400' 
              : 'bg-gradient-to-t from-emerald-700 via-emerald-600 to-emerald-500'
          }`}
          style={{ height: `${Math.min(100, Math.max(14, fillLevel))}%` }}
        />

        {/* Big Emoji Face in the center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-xs'} drop-shadow`}>
            {faceEmoji}
          </span>
        </div>
      </div>

      {/* Status indicator with audio icon */}
      <div className="flex items-center gap-1 mt-0.5">
        <span 
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono tabular-nums ${
            isFull 
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' 
              : isHalf 
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {fillLevel}% {statusWord}
        </span>

        {showAudioButton && (
          <button
            type="button"
            onClick={handleSpeak}
            className="p-0.5 rounded bg-[#16202e] hover:bg-blue-600 text-blue-300 hover:text-white transition-colors cursor-pointer"
            title="Hear status aloud"
            aria-label={`Listen to status for ${name}`}
          >
            <Volume2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
