import React, { useState, useEffect } from 'react';
import { ChevronDown, RefreshCw, Trophy } from 'lucide-react';
import type { RaceSummary } from '../types/race';
import { fetchRaces } from '../services/api';

interface RaceSelectorProps {
  currentSeason: number;
  currentRound: number;
  onSelectRace: (season: number, round: number) => void;
  isLoading: boolean;
}

export const RaceSelector: React.FC<RaceSelectorProps> = ({
  currentSeason,
  currentRound,
  onSelectRace,
  isLoading
}) => {
  const [season, setSeason] = useState<number>(currentSeason);
  const [races, setRaces] = useState<RaceSummary[]>([]);
  const [selectedRound, setSelectedRound] = useState<number>(currentRound);
  const [isFetchingSchedule, setIsFetchingSchedule] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSchedule() {
      setIsFetchingSchedule(true);
      try {
        const raceList = await fetchRaces(season);
        if (isMounted) {
          setRaces(raceList);
          const hasCurrentRound = raceList.some((r) => r.round === selectedRound);
          if (!hasCurrentRound && raceList.length > 0) {
            setSelectedRound(raceList[0].round);
          }
        }
      } catch (err) {
        console.error('Failed to load races schedule:', err);
      } finally {
        if (isMounted) setIsFetchingSchedule(false);
      }
    }
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, [season]);

  const handleLoadClick = () => {
    onSelectRace(season, selectedRound);
  };

  return (
    <div className="telemetry-card p-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-red-50 text-[#E10600] rounded-xl border border-red-100">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
            RACE SELECTION
          </span>
          <span className="text-sm font-extrabold text-neutral-900">
            Select Season & Grand Prix
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Season Selector */}
        <div className="relative">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Season
          </label>
          <div className="relative">
            <select
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
              className="appearance-none bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-semibold rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:border-[#E10600] focus:ring-2 focus:ring-red-100 transition cursor-pointer"
              disabled={isLoading || isFetchingSchedule}
            >
              <option value={2024}>2024 Season</option>
              <option value={2023}>2023 Season</option>
              <option value={2022}>2022 Season</option>
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Grand Prix Selector */}
        <div className="relative min-w-[240px]">
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Grand Prix
          </label>
          <div className="relative">
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number(e.target.value))}
              className="w-full appearance-none bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-semibold rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:border-[#E10600] focus:ring-2 focus:ring-red-100 transition cursor-pointer"
              disabled={isLoading || isFetchingSchedule || races.length === 0}
            >
              {races.map((r) => (
                <option key={r.round} value={r.round}>
                  Round {r.round} — {r.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Load Race Button */}
        <div className="pt-4">
          <button
            onClick={handleLoadClick}
            disabled={isLoading || isFetchingSchedule}
            className="flex items-center space-x-2 bg-[#E10600] hover:bg-[#c90500] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-[0_4px_12px_rgba(225,6,0,0.25)] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>LOADING...</span>
              </>
            ) : (
              <span>LOAD RACE</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
