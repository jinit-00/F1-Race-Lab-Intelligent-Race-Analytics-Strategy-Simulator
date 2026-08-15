import React, { useState, useEffect } from 'react';
import PlotlyPlot from 'react-plotly.js';
import type { DriverInfo, RaceSnapshot, TimeMachineResponse } from '../types/race';
import { fetchRaceSnapshot, fetchTimeMachineSimulation } from '../services/api';
import { History, Sparkles, Fuel, Sun, Gauge, Flame } from 'lucide-react';

interface RaceTimeMachineCardProps {
  season: number;
  round: number;
  drivers: DriverInfo[];
  selectedDriver: string | null;
  totalLaps?: number;
}

const COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];

export const RaceTimeMachineCard: React.FC<RaceTimeMachineCardProps> = ({
  season,
  round,
  drivers,
  selectedDriver,
  totalLaps = 52
}) => {
  const [driver, setDriver] = useState<string>(selectedDriver || (drivers[0]?.driver || 'VER'));
  const [rewindLap, setRewindLap] = useState<number>(38);
  const [decision, setDecision] = useState<'PIT_NOW' | 'STAY_OUT' | 'CHANGE_COMPOUND'>('PIT_NOW');
  const [newCompound, setNewCompound] = useState<string>('SOFT');

  const [snapshot, setSnapshot] = useState<RaceSnapshot | null>(null);
  const [simResult, setSimResult] = useState<TimeMachineResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDriver) {
      setDriver(selectedDriver);
    }
  }, [selectedDriver]);

  // Load lap snapshot when rewindLap, driver, season, round change
  useEffect(() => {
    const loadSnapshot = async () => {
      try {
        const data = await fetchRaceSnapshot(season, round, rewindLap);
        setSnapshot(data);
      } catch (err) {
        console.error('Failed to load lap snapshot:', err);
      }
    };
    loadSnapshot();
  }, [season, round, rewindLap]);

  const runTimeMachine = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchTimeMachineSimulation({
        season,
        round_num: round,
        driver,
        rewind_lap: rewindLap,
        decision,
        new_compound: newCompound,
        num_simulations: 5000
      });
      setSimResult(res);
    } catch (err: any) {
      console.error('Race Time Machine failed:', err);
      setError(err?.message || 'Time Machine simulation failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTimeMachine();
  }, [driver, rewindLap, decision, newCompound, season, round]);

  const targetDriverSnap = snapshot?.drivers?.find((d) => d.driver === driver);

  const actualTraj = simResult?.actual_reality?.trajectory || [];
  const altTraj = simResult?.alternate_reality?.trajectory || [];

  return (
    <div className="telemetry-card p-6 bg-gradient-to-b from-neutral-900 to-black text-white rounded-3xl space-y-6 shadow-2xl border border-neutral-800">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-red-500 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="text-xs font-black uppercase tracking-widest text-red-500">
              FLAGSHIP FEATURE — ⭐ RACE TIME MACHINE
            </span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Rewind History. Take Control as Team Principal.
          </h2>
        </div>

        {/* Driver Selector */}
        <div className="flex items-center space-x-3">
          <div>
            <label className="text-[10px] font-extrabold text-neutral-400 uppercase block mb-1">
              TARGET DRIVER
            </label>
            <select
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
            >
              {drivers.map((d) => (
                <option key={d.driver} value={d.driver}>
                  {d.driver} — {d.driver_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 1. HISTORICAL RACE TIMELINE SLIDER */}
      <div className="bg-neutral-800/80 p-5 rounded-2xl border border-neutral-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-red-400 tracking-wider">
            1. REWIND RACE TIMELINE
          </span>
          <span className="text-sm font-black font-mono text-amber-400 bg-black/40 px-3 py-1 rounded-lg border border-neutral-700">
            LAP {rewindLap} / {totalLaps}
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={totalLaps}
          value={rewindLap}
          onChange={(e) => setRewindLap(parseInt(e.target.value))}
          className="w-full h-3 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#E10600]"
        />

        <div className="flex justify-between text-[10px] font-mono text-neutral-400">
          <span>Lap 1 (Race Start)</span>
          <span>Lap {Math.floor(totalLaps / 2)} (Mid Race)</span>
          <span>Lap {totalLaps} (Finish Flag)</span>
        </div>
      </div>

      {/* 2. HISTORICAL STATE SNAPSHOT AT LAP N */}
      {snapshot && (
        <div className="bg-black/60 p-5 rounded-2xl border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="text-xs font-black uppercase text-neutral-300 tracking-wider">
              2. HISTORICAL TELEMETRY SNAPSHOT AT LAP {rewindLap}
            </span>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <span className="text-amber-400 flex items-center space-x-1">
                <Fuel className="w-3.5 h-3.5" />
                <span>ESTIMATED FUEL: {snapshot.estimated_fuel_kg} kg</span>
              </span>
              <span className="text-neutral-400 flex items-center space-x-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>TRACK: {snapshot.weather?.track_temp}°C</span>
              </span>
            </div>
          </div>

          {/* Target Driver Live Snapshot Card */}
          {targetDriverSnap && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono bg-neutral-900/90 p-4 rounded-xl border border-neutral-700">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block mb-1">TRACK POSITION</span>
                <strong className="text-2xl font-black text-amber-400">P{targetDriverSnap.position}</strong>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase block mb-1">GAP TO LEADER</span>
                <strong className="text-base font-black text-white">{targetDriverSnap.gap_text}</strong>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase block mb-1">TYRE COMPOUND</span>
                <strong className="text-base font-black text-emerald-400">{targetDriverSnap.compound}</strong>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase block mb-1">TYRE AGE</span>
                <strong className="text-base font-black text-white">{targetDriverSnap.tyre_age} laps</strong>
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 uppercase block mb-1">PITS COMPLETED</span>
                <strong className="text-base font-black text-white">{targetDriverSnap.pits_made} stop(s)</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TAKE CONTROL AS TEAM PRINCIPAL */}
      <div className="bg-neutral-800/90 p-5 rounded-2xl border border-red-500/40 space-y-4">
        <div className="flex items-center space-x-2">
          <Gauge className="w-5 h-5 text-red-500" />
          <span className="text-xs font-black uppercase text-red-400 tracking-wider">
            3. YOU ARE THE TEAM PRINCIPAL — CHOOSE STRATEGY AT LAP {rewindLap}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setDecision('PIT_NOW')}
            className={`p-4 rounded-xl border font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between ${
              decision === 'PIT_NOW'
                ? 'bg-[#E10600] border-red-400 text-white shadow-lg'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <span>PIT NOW</span>
            <Flame className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDecision('STAY_OUT')}
            className={`p-4 rounded-xl border font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between ${
              decision === 'STAY_OUT'
                ? 'bg-[#E10600] border-red-400 text-white shadow-lg'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <span>STAY OUT</span>
            <Gauge className="w-4 h-4" />
          </button>

          <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-700 flex flex-col justify-between">
            <span className="text-[10px] font-black text-neutral-400 uppercase">CHANGE COMPOUND</span>
            <select
              value={newCompound}
              onChange={(e) => {
                setNewCompound(e.target.value);
                setDecision('CHANGE_COMPOUND');
              }}
              className="bg-black border border-neutral-700 rounded-lg px-2.5 py-1 text-xs font-black text-emerald-400"
            >
              {COMPOUNDS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="py-8 text-center space-y-2">
          <div className="text-xs font-extrabold text-red-500 uppercase tracking-widest animate-pulse">
            ALTERING RACE REALITY WITH 5,000 MONTE CARLO FORWARD SIMULATIONS...
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-xs text-red-300 font-bold">
          {error}
        </div>
      )}

      {/* 4. SPLIT-SCREEN EXPERIENCE: ACTUAL REALITY VS YOUR ALTERNATE REALITY */}
      {!isLoading && simResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT: ACTUAL REALITY */}
            <div className="bg-neutral-900/90 p-5 rounded-2xl border border-neutral-700 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-black uppercase text-neutral-400">ACTUAL REALITY</span>
                <span className="text-xs font-mono text-neutral-500">HISTORICAL OUTCOME</span>
              </div>

              <div className="space-y-2">
                <div className="text-3xl font-black text-white">
                  {simResult.actual_reality.finish_position}
                </div>
                <div className="text-xs font-mono text-neutral-400">
                  Win Probability: <strong className="text-white">{simResult.actual_reality.win_probability}%</strong>
                </div>
              </div>
            </div>

            {/* RIGHT: YOUR ALTERNATE REALITY */}
            <div className="bg-gradient-to-br from-red-950/80 to-neutral-900 p-5 rounded-2xl border border-red-500/60 space-y-3">
              <div className="flex items-center justify-between border-b border-red-800/60 pb-2">
                <span className="text-xs font-black uppercase text-amber-300 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>YOUR ALTERNATE REALITY</span>
                </span>
                <span className="text-xs font-mono text-red-300">SIMULATED OUTCOME</span>
              </div>

              <div className="space-y-2">
                <div className="text-3xl font-black text-amber-300">
                  {simResult.alternate_reality.finish_position}
                </div>
                <div className="text-xs font-mono text-neutral-300">
                  Win Probability: <strong className="text-amber-300">{simResult.alternate_reality.win_probability}% ({simResult.comparison.win_gain_pct})</strong>
                </div>
              </div>
            </div>
          </div>

          {/* DELTA BADGES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] font-black text-neutral-400 uppercase block">POSITION GAIN</span>
              <strong className="text-2xl font-black text-emerald-400">{simResult.comparison.position_gain_text}</strong>
            </div>

            <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] font-black text-neutral-400 uppercase block">EXPECTED TIME GAIN</span>
              <strong className="text-2xl font-black text-emerald-400">{simResult.comparison.time_gain_text}</strong>
            </div>

            <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 text-center">
              <span className="text-[10px] font-black text-neutral-400 uppercase block">WIN PROBABILITY GAIN</span>
              <strong className="text-2xl font-black text-emerald-400">{simResult.comparison.win_gain_pct}</strong>
            </div>
          </div>

          {/* DECISION EXPLANATION BREAKDOWN */}
          <div className="bg-black/80 p-5 rounded-2xl border border-neutral-800 space-y-3">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider block">
              WHY DID THE OUTCOME CHANGE? (NUMERICAL BREAKDOWN)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">FRESHER TIRES PACE</span>
                <strong className="text-emerald-400">+{simResult.decision_breakdown.fresh_tyre_pace_gain_sec}s</strong>
              </div>

              <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">DEGRADATION REDUCTION</span>
                <strong className="text-emerald-400">+{simResult.decision_breakdown.degradation_reduction_sec}s</strong>
              </div>

              <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">PIT LOSS PENALTY</span>
                <strong className="text-red-400">{simResult.decision_breakdown.pit_loss_penalty_sec}s</strong>
              </div>

              <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">NET TIME GAIN</span>
                <strong className="text-amber-400">{simResult.comparison.time_gain_text}</strong>
              </div>
            </div>
          </div>

          {/* DIVERGENCE TRAJECTORY PLOTLY CHART */}
          <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
            <h4 className="text-xs font-black uppercase text-neutral-300 tracking-wider mb-2">
              REALITY DIVERGENCE TRAJECTORY (LAP {rewindLap} TO FINISH)
            </h4>
            <PlotlyPlot
              data={[
                {
                  x: actualTraj.map((t) => t.lap),
                  y: actualTraj.map((t) => t.position),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Actual Reality Position',
                  line: { color: '#9CA3AF', width: 2, dash: 'dot' },
                  hovertemplate: 'Lap %{x}: Actual P%{y}<extra></extra>'
                },
                {
                  x: altTraj.map((t) => t.lap),
                  y: altTraj.map((t) => t.position),
                  type: 'scatter',
                  mode: 'lines+markers',
                  name: 'Your Alternate Reality Position',
                  line: { color: '#E10600', width: 3 },
                  hovertemplate: 'Lap %{x}: Alternate P%{y}<extra></extra>'
                }
              ]}
              layout={{
                autosize: true,
                height: 260,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                margin: { l: 45, r: 15, t: 15, b: 45 },
                xaxis: { title: { text: 'Race Lap', font: { size: 11, color: '#D4D4D4' } }, gridcolor: '#262626' },
                yaxis: { title: { text: 'Track Position', font: { size: 11, color: '#D4D4D4' } }, autorange: 'reversed', dtick: 1, gridcolor: '#262626' },
                legend: { font: { color: '#FFFFFF' }, orientation: 'h', y: -0.3 }
              }}
              useResizeHandler={true}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
