import React from 'react';
import type { DriverStanding } from '../types/race';
import { Layers, Shield } from 'lucide-react';

interface StintTimelineCardProps {
  standings: DriverStanding[];
  totalLaps: number;
  selectedDriver: string | null;
  onSelectDriver: (driver: string) => void;
}

export const StintTimelineCard: React.FC<StintTimelineCardProps> = ({
  standings,
  totalLaps,
  selectedDriver,
  onSelectDriver
}) => {
  const getCompoundColor = (cmp: string | null) => {
    if (!cmp) return '#6B7280';
    switch (cmp.toUpperCase()) {
      case 'SOFT':
        return '#EF4444'; // Red
      case 'MEDIUM':
        return '#EAB308'; // Yellow
      case 'HARD':
        return '#9CA3AF'; // Gray/White
      case 'INTERMEDIATE':
        return '#22C55E'; // Green
      case 'WET':
        return '#3B82F6'; // Blue
      default:
        return '#6B7280';
    }
  };

  const topDrivers = standings.slice(0, 8);

  return (
    <div className="telemetry-card p-6 bg-white border border-neutral-200 rounded-3xl space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#E10600]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#E10600]">
              MAIN DASHBOARD — RACE PIT STRATEGY TIMELINE
            </span>
          </div>
          <h3 className="text-xl font-black text-neutral-900 tracking-tight">
            Top Drivers Tire Stints & Pit Stop History
          </h3>
        </div>

        {/* Compound Legend */}
        <div className="flex items-center space-x-3 text-xs font-mono font-bold">
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /><span>SOFT</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" /><span>MEDIUM</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#9CA3AF]" /><span>HARD</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /><span>INTER</span></span>
          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /><span>WET</span></span>
        </div>
      </div>

      {/* Strategy Bars */}
      <div className="space-y-3 pt-2">
        {topDrivers.map((d) => {
          const isSelected = selectedDriver === d.driver;
          const pitLapEstimate = d.pit_count > 0 ? 20 : 0;
          const stint1Len = pitLapEstimate > 0 ? pitLapEstimate : totalLaps;
          const stint2Len = totalLaps - stint1Len;

          const cmp1 = d.compound || 'MEDIUM';
          const cmp2 = cmp1 === 'MEDIUM' ? 'HARD' : 'MEDIUM';

          return (
            <div
              key={d.driver}
              onClick={() => onSelectDriver(d.driver)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-3 ${
                isSelected ? 'bg-red-50/60 border-[#E10600]' : 'bg-neutral-50/80 border-neutral-200 hover:bg-neutral-100/80'
              }`}
            >
              {/* Driver Badge */}
              <div className="flex items-center space-x-2.5 w-24 shrink-0">
                <span className="font-mono text-xs font-black text-neutral-400 w-5">P{d.position}</span>
                <span className="w-2 h-6 rounded-full" style={{ backgroundColor: d.team_color }} />
                <span className={`font-mono font-black text-sm ${isSelected ? 'text-[#E10600]' : 'text-neutral-900'}`}>
                  {d.driver}
                </span>
              </div>

              {/* Horizontal Stint Timeline Bar */}
              <div className="flex-1 h-6 bg-neutral-200 rounded-xl overflow-hidden flex relative border border-neutral-300">
                {/* Stint 1 */}
                <div
                  style={{
                    width: `${(stint1Len / totalLaps) * 100}%`,
                    backgroundColor: getCompoundColor(cmp1)
                  }}
                  className="h-full flex items-center justify-center text-[10px] font-mono font-black text-neutral-900 shadow-xs relative group"
                  title={`${d.driver} | Compound: ${cmp1} | Stint 1 (Laps 1-${stint1Len}) | Tyre Age: ${d.tyre_age || 10}L`}
                >
                  <span className="truncate px-1 uppercase">{cmp1}</span>
                </div>

                {/* Stint 2 (if pitted) */}
                {stint2Len > 0 && (
                  <div
                    style={{
                      width: `${(stint2Len / totalLaps) * 100}%`,
                      backgroundColor: getCompoundColor(cmp2)
                    }}
                    className="h-full flex items-center justify-center text-[10px] font-mono font-black text-neutral-900 shadow-xs relative group border-l-2 border-neutral-900"
                    title={`${d.driver} | Compound: ${cmp2} | Stint 2 (Laps ${stint1Len + 1}-${totalLaps}) | Pit Lap: ${pitLapEstimate}`}
                  >
                    <span className="truncate px-1 uppercase">{cmp2}</span>
                  </div>
                )}

                {/* Pit Location Marker */}
                {pitLapEstimate > 0 && (
                  <div
                    style={{ left: `${(pitLapEstimate / totalLaps) * 100}%` }}
                    className="absolute top-0 bottom-0 w-1 bg-neutral-900 z-10 flex items-center justify-center"
                  >
                    <Shield className="w-3 h-3 text-amber-400 fill-current -ml-1" />
                  </div>
                )}
              </div>

              <div className="text-right text-xs font-mono font-bold text-neutral-600 w-16 shrink-0">
                {d.pit_count} {d.pit_count === 1 ? 'Stop' : 'Stops'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
