import React from 'react';
import { Compass, Flag, Calendar } from 'lucide-react';
import type { RaceInfo } from '../types/race';

interface RaceHeaderProps {
  raceInfo: RaceInfo | null;
}

export const RaceHeader: React.FC<RaceHeaderProps> = ({ raceInfo }) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 px-6 py-3.5 shadow-xs">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Branding & Logo */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#E10600] text-white font-bold text-lg shadow-[0_4px_12px_rgba(225,6,0,0.3)]">
            
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 font-sans uppercase">
                F1 RACE LAB
              </h1>
              <span className="text-[10px] font-extrabold tracking-wider uppercase bg-red-50 text-[#E10600] border border-red-200 px-2 py-0.5 rounded-full">
                HISTORICAL RACE
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Explore the race. Understand the data.
            </p>
          </div>
        </div>

        {/* Navigation & Current Race Info */}
        <div className="flex items-center space-x-6">
          <nav className="hidden sm:flex items-center space-x-6 text-xs font-semibold text-neutral-600">
            <span className="text-[#E10600] border-b-2 border-[#E10600] pb-0.5 cursor-pointer">
              Race Replay
            </span>
            <span className="hover:text-neutral-900 transition cursor-pointer">
              Analytics
            </span>
          </nav>

          {raceInfo && (
            <div className="flex items-center space-x-4 bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-xl text-xs">
              <div className="flex items-center space-x-2 text-neutral-800 font-bold">
                <Compass className="w-3.5 h-3.5 text-[#E10600]" />
                <span>{raceInfo.circuit}</span>
              </div>
              <div className="h-4 w-px bg-neutral-300"></div>
              <div className="flex items-center space-x-3 text-neutral-500 font-medium">
                <span className="flex items-center space-x-1">
                  <Flag className="w-3 h-3 text-neutral-400" />
                  <span>{raceInfo.total_laps} Laps</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-neutral-400" />
                  <span>{raceInfo.date}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
