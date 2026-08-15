import React, { useState, useEffect } from 'react';
import PlotlyPlot from 'react-plotly.js';
import type { DriverInfo, WhatIfComparisonResponse } from '../types/race';
import { fetchWhatIfComparison } from '../services/api';
import { GitCompare } from 'lucide-react';

interface WhatIfComparisonCardProps {
  season: number;
  round: number;
  drivers: DriverInfo[];
  selectedDriver: string | null;
  currentLap: number;
  totalLaps: number;
}

const COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];

export const WhatIfComparisonCard: React.FC<WhatIfComparisonCardProps> = ({
  season,
  round,
  drivers,
  selectedDriver,
  totalLaps
}) => {
  const [driver, setDriver] = useState<string>(selectedDriver || (drivers[0]?.driver || 'VER'));
  const [actualPitLap, setActualPitLap] = useState<number>(42);
  const [actualCompound, setActualCompound] = useState<string>('HARD');
  const [whatIfPitLap, setWhatIfPitLap] = useState<number>(38);
  const [whatIfCompound, setWhatIfCompound] = useState<string>('HARD');

  const [data, setData] = useState<WhatIfComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDriver) {
      setDriver(selectedDriver);
    }
  }, [selectedDriver]);

  const loadComparison = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchWhatIfComparison({
        season,
        round_num: round,
        driver,
        actual_pit_lap: actualPitLap,
        actual_compound: actualCompound,
        whatif_pit_lap: whatIfPitLap,
        whatif_compound: whatIfCompound
      });
      setData(res);
    } catch (err: any) {
      console.error('What-If Comparison failed:', err);
      setError(err?.message || 'Failed to generate strategy comparison.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, [driver, actualPitLap, actualCompound, whatIfPitLap, whatIfCompound, season, round]);

  const trajectory = data?.trajectory || [];
  const lapsList = trajectory.map((t) => t.lap);
  const actualPositions = trajectory.map((t) => t.actual_position);
  const whatIfPositions = trajectory.map((t) => t.whatif_position);
  const actualTimes = trajectory.map((t) => t.actual_time);
  const whatIfTimes = trajectory.map((t) => t.whatif_time);

  return (
    <div className="telemetry-card p-6 bg-white border border-neutral-200 rounded-3xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-[#E10600]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#E10600]">
              FULL WHAT-IF RACE COMPARISON
            </span>
          </div>
          <h3 className="text-xl font-black text-neutral-900 tracking-tight">
            Actual Strategy vs What-If Strategy
          </h3>
        </div>

        {/* Driver selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-extrabold text-neutral-500 uppercase">Driver:</label>
          <select
            value={driver}
            onChange={(e) => setDriver(e.target.value)}
            className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#E10600]"
          >
            {drivers.map((d) => (
              <option key={d.driver} value={d.driver}>
                {d.driver} — {d.driver_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Strategy Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Actual Strategy Box */}
        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
          <span className="text-xs font-black uppercase text-neutral-500 tracking-wider block">
            ACTUAL STRATEGY
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 block mb-1">PIT LAP</label>
              <input
                type="number"
                min={1}
                max={totalLaps - 1}
                value={actualPitLap}
                onChange={(e) => setActualPitLap(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-sm font-black text-neutral-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-400 block mb-1">COMPOUND</label>
              <select
                value={actualCompound}
                onChange={(e) => setActualCompound(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-900"
              >
                {COMPOUNDS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* What-If Strategy Box */}
        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-200 space-y-3">
          <span className="text-xs font-black uppercase text-[#E10600] tracking-wider block">
            WHAT-IF STRATEGY
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-red-500 block mb-1">PIT LAP</label>
              <input
                type="number"
                min={1}
                max={totalLaps - 1}
                value={whatIfPitLap}
                onChange={(e) => setWhatIfPitLap(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-red-300 rounded-xl px-3 py-1.5 text-sm font-black text-neutral-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-red-500 block mb-1">COMPOUND</label>
              <select
                value={whatIfCompound}
                onChange={(e) => setWhatIfCompound(e.target.value)}
                className="w-full bg-white border border-red-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-900"
              >
                {COMPOUNDS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-xs font-mono text-neutral-400 animate-pulse">
          Simulating full race trajectories...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-bold">
          {error}
        </div>
      )}

      {/* Comparison Summary Banner */}
      {!isLoading && data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-900 text-white p-5 rounded-2xl shadow-sm">
            {/* Actual readout */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">
                ACTUAL RESULT
              </span>
              <div className="text-3xl font-black">{data.actual_strategy.finish_position}</div>
              <div className="text-xs text-neutral-300 font-mono">
                Lap {data.actual_strategy.pit_lap} Pit ({data.actual_strategy.compound})
              </div>
              <div className="text-xs text-neutral-400 font-mono">Time: {data.actual_strategy.race_time}</div>
            </div>

            {/* Side-by-side indicator */}
            <div className="flex flex-col items-center justify-center py-2 border-y md:border-y-0 md:border-x border-neutral-800 space-y-1">
              <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">
                STRATEGY GAIN
              </span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {data.comparison.position_gain_text}
              </div>
              <div className="text-sm font-bold text-emerald-300 font-mono">
                Time Gain: {data.comparison.time_gain_text}
              </div>
            </div>

            {/* What-If readout */}
            <div className="space-y-1 text-right">
              <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-widest block">
                WHAT-IF PROJECTION
              </span>
              <div className="text-3xl font-black text-red-500">{data.whatif_strategy.finish_position}</div>
              <div className="text-xs text-neutral-300 font-mono">
                Lap {data.whatif_strategy.pit_lap} Pit ({data.whatif_strategy.compound})
              </div>
              <div className="text-xs text-neutral-400 font-mono">Time: {data.whatif_strategy.race_time}</div>
            </div>
          </div>

          {/* Plotly Dual Progression Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Lap -> Position */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <h4 className="text-xs font-black uppercase text-neutral-700 tracking-wider mb-3">
                Lap vs Position Evolution
              </h4>
              <PlotlyPlot
                data={[
                  {
                    x: lapsList,
                    y: actualPositions,
                    type: 'scatter',
                    mode: 'lines',
                    name: `Actual (Lap ${actualPitLap})`,
                    line: { color: '#6B7280', width: 2.5 }
                  },
                  {
                    x: lapsList,
                    y: whatIfPositions,
                    type: 'scatter',
                    mode: 'lines',
                    name: `What-If (Lap ${whatIfPitLap})`,
                    line: { color: '#E10600', width: 3 }
                  }
                ]}
                layout={{
                  autosize: true,
                  height: 300,
                  margin: { l: 40, r: 20, t: 20, b: 40 },
                  yaxis: { title: 'Position', autorange: 'reversed', dtick: 2 },
                  xaxis: { title: 'Lap Number' },
                  legend: { orientation: 'h', y: -0.2 }
                }}
                useResizeHandler={true}
                className="w-full"
              />
            </div>

            {/* Chart 2: Lap -> Lap Time */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <h4 className="text-xs font-black uppercase text-neutral-700 tracking-wider mb-3">
                Lap vs Simulated Lap Time Pace
              </h4>
              <PlotlyPlot
                data={[
                  {
                    x: lapsList,
                    y: actualTimes,
                    type: 'scatter',
                    mode: 'lines',
                    name: `Actual Pace`,
                    line: { color: '#6B7280', width: 2, dash: 'dot' }
                  },
                  {
                    x: lapsList,
                    y: whatIfTimes,
                    type: 'scatter',
                    mode: 'lines',
                    name: `What-If Pace`,
                    line: { color: '#E10600', width: 2.5 }
                  }
                ]}
                layout={{
                  autosize: true,
                  height: 300,
                  margin: { l: 45, r: 20, t: 20, b: 40 },
                  yaxis: { title: 'Lap Time (s)' },
                  xaxis: { title: 'Lap Number' },
                  legend: { orientation: 'h', y: -0.2 }
                }}
                useResizeHandler={true}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
