import React, { useEffect, useState } from 'react';
import type { DriverStanding } from '../types/race';
import { formatLapTime, fetchDriverHeadshots } from '../services/api';

interface DriverStandingsProps {
  standings: DriverStanding[];
  selectedDriver: string | null;
  onSelectDriver: (driverCode: string) => void;
}

export const DriverStandings: React.FC<DriverStandingsProps> = ({
  standings,
  selectedDriver,
  onSelectDriver
}) => {
  const [headshots, setHeadshots] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadHeadshots = async () => {
      try {
        const data = await fetchDriverHeadshots();
        setHeadshots(data);
      } catch (err) {
        console.error('Failed to load headshots:', err);
      }
    };
    loadHeadshots();
  }, []);

  const getCompoundBadgeClass = (compound: string | null) => {
    if (!compound) return 'bg-neutral-100 text-neutral-600';
    switch (compound.toUpperCase()) {
      case 'SOFT':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'HARD':
        return 'bg-neutral-200 text-neutral-800 border border-neutral-300';
      case 'INTERMEDIATE':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'WET':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };

  return (
    <div className="telemetry-card p-5 bg-white border border-neutral-200 rounded-3xl space-y-3 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-[#E10600]">
            LIVE DRIVER STANDINGS
          </h2>
          <span className="text-xs font-semibold text-neutral-500">
            Real FastF1 Race Classification
          </span>
        </div>
        <span className="text-xs font-mono font-black bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full border border-neutral-200">
          {standings.length} Drivers
        </span>
      </div>

      <div className="overflow-y-auto max-h-[520px] pr-1 space-y-2 custom-scrollbar">
        {standings.length === 0 ? (
          <div className="text-center py-12 text-xs text-neutral-400 font-mono">
            No driver standing data for this lap
          </div>
        ) : (
          standings.map((d) => {
            const isSelected = selectedDriver === d.driver;
            const posFormatted = d.position < 10 ? `0${d.position}` : `${d.position}`;
            const imgUrl = headshots[d.driver];

            return (
              <div
                key={d.driver}
                onClick={() => onSelectDriver(d.driver)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-red-50/80 border-[#E10600] shadow-sm'
                    : 'bg-white border-neutral-200/80 hover:bg-neutral-50 hover:border-neutral-300'
                }`}
              >
                {/* Left: Position & Driver Thumbnail */}
                <div className="flex items-center space-x-3 min-w-0">
                  <span className={`font-mono text-sm font-black w-6 text-center ${isSelected ? 'text-[#E10600]' : 'text-neutral-400'}`}>
                    {posFormatted}
                  </span>

                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center">
                    {imgUrl ? (
                      <img src={imgUrl} alt={d.driver} className="w-full h-full object-cover object-top" />
                    ) : (
                      <span className="font-mono text-[9px] font-black text-neutral-700">{d.driver}</span>
                    )}
                  </div>

                  <div
                    className="w-1.5 h-7 rounded-full shrink-0"
                    style={{ backgroundColor: d.team_color }}
                  ></div>

                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono font-black text-sm ${isSelected ? 'text-[#E10600]' : 'text-neutral-900'}`}>
                        {d.driver}
                      </span>
                      <span className="text-xs text-neutral-600 truncate font-semibold hidden sm:inline">
                        {d.driver_name}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 truncate block">
                      {d.team_name}
                    </span>
                  </div>
                </div>

                {/* Right: Compound, Tyre Age, Lap time */}
                <div className="flex items-center space-x-2 shrink-0">
                  {d.compound && (
                    <span
                      className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full uppercase ${getCompoundBadgeClass(
                        d.compound
                      )}`}
                    >
                      {d.compound} {d.tyre_age !== null ? `(${d.tyre_age}L)` : ''}
                    </span>
                  )}
                  {d.pit_stop && (
                    <span className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                      PIT
                    </span>
                  )}
                  <span className="font-mono text-xs font-black text-neutral-800 w-16 text-right">
                    {formatLapTime(d.lap_time)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
