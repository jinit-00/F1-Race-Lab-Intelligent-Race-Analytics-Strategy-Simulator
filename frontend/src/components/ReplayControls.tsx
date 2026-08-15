import React from 'react';
import { Play, Pause, SkipBack, SkipForward, FastForward } from 'lucide-react';
import type { ReplaySpeed } from '../types/race';

interface ReplayControlsProps {
  currentLap: number;
  totalLaps: number;
  isPlaying: boolean;
  replaySpeed: ReplaySpeed;
  onLapChange: (lap: number) => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: ReplaySpeed) => void;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  currentLap,
  totalLaps,
  isPlaying,
  replaySpeed,
  onLapChange,
  onTogglePlay,
  onSpeedChange
}) => {
  const speeds: ReplaySpeed[] = [1, 2, 5, 10];

  const handlePrev = () => {
    if (currentLap > 1) {
      onLapChange(currentLap - 1);
    }
  };

  const handleNext = () => {
    if (currentLap < totalLaps) {
      onLapChange(currentLap + 1);
    }
  };

  return (
    <div className="telemetry-card p-6 space-y-5">
      {/* Header & Lap Counter */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E10600] block mb-0.5">
            RACE REPLAY TIMELINE
          </span>
          <h2 className="text-base font-extrabold text-neutral-900">
            Race Progress
          </h2>
        </div>
        <div className="text-right bg-neutral-50 border border-neutral-200 px-4 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            ACTIVE LAP
          </span>
          <div className="text-lg font-black font-mono text-neutral-900">
            LAP {currentLap} <span className="text-xs font-semibold text-neutral-400">/ {totalLaps}</span>
          </div>
        </div>
      </div>

      {/* Timeline Slider & Tick marks */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono font-semibold text-neutral-500">
          <span>LAP 1</span>
          <span className="text-[#E10600] font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            LAP {currentLap}
          </span>
          <span>LAP {totalLaps}</span>
        </div>
        <div className="relative flex items-center pt-1">
          <input
            type="range"
            min={1}
            max={Math.max(totalLaps, 1)}
            value={currentLap}
            onChange={(e) => onLapChange(Number(e.target.value))}
            className="w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#E10600] focus:outline-none"
          />
        </div>
      </div>

      {/* Play / Pause / Prev / Next & Speed Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-100">
        {/* Main Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrev}
            disabled={currentLap <= 1}
            className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Lap"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="flex items-center space-x-2 bg-[#E10600] hover:bg-[#c90500] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider px-7 py-3 rounded-xl shadow-[0_4px_12px_rgba(225,6,0,0.3)] transition cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white ml-0.5" />
                <span>PLAY</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentLap >= totalLaps}
            className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next Lap"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center space-x-1.5 bg-neutral-100 p-1.5 rounded-xl border border-neutral-200">
          <FastForward className="w-3.5 h-3.5 text-neutral-400 ml-1.5 mr-0.5" />
          {speeds.map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition cursor-pointer ${
                replaySpeed === speed
                  ? 'bg-[#E10600] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
