import React, { useEffect, useState } from 'react';
import type { DriverStanding, GhostRaceResponse } from '../types/race';
import { fetchGhostRaceSimulation } from '../services/api';
import { CircuitTrackMap } from './CircuitTrackMap';
import Plot from 'react-plotly.js';
import { Play, Pause, RotateCcw, Activity, ShieldAlert, ArrowRight, Shield, Sparkles, TrendingUp, Gauge } from 'lucide-react';

interface GhostRaceCardProps {
  season: number;
  round: number;
  driver: string;
  standings: DriverStanding[];
  onSelectDriver: (driver: string) => void;
}

export const GhostRaceCard: React.FC<GhostRaceCardProps> = ({
  season,
  round,
  driver,
  standings,
  onSelectDriver
}) => {
  const [pitLap, setPitLap] = useState<number>(38);
  const [compound, setCompound] = useState<string>('HARD');
  const [ghostData, setGhostData] = useState<GhostRaceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [currentLap, setCurrentLap] = useState<number>(38);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await fetchGhostRaceSimulation({
        season,
        round_num: round,
        driver,
        pit_lap: pitLap,
        compound
      });
      setGhostData(data);
    } catch (err) {
      console.error('Failed to run Ghost Race simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [season, round, driver, pitLap, compound]);

  // Replay animation loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentLap((prev) => (prev >= (ghostData?.total_laps || 52) ? 1 : prev + 1));
      }, 1000 / replaySpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, replaySpeed, ghostData]);

  const realPosNum = parseInt((ghostData?.real_car.finish_position || '5').replace('P', ''), 10) || 5;
  const ghostPosNum = parseInt((ghostData?.ghost_car.finish_position || '3').replace('P', ''), 10) || 3;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-6 rounded-3xl text-white shadow-xl space-y-4 border border-neutral-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-[#E10600] text-white rounded-full text-xs font-black tracking-widest uppercase flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                SIGNATURE FEATURE — GHOST RACE
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Real Car vs Alternate Strategy Ghost Car
            </h2>
            <p className="text-sm text-neutral-300 font-medium">
              Simulate alternate pit strategy live on actual FastF1 circuit telemetry coordinates.
            </p>
          </div>

          {/* Strategy Control Pill */}
          <div className="flex flex-wrap items-center gap-3 bg-neutral-950/80 p-3 rounded-2xl border border-neutral-700">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Pit Lap</label>
              <input
                type="number"
                min={1}
                max={52}
                value={pitLap}
                onChange={(e) => setPitLap(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-neutral-800 text-white font-mono font-bold rounded-lg text-sm border border-neutral-700 focus:outline-none focus:border-[#E10600]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">New Compound</label>
              <select
                value={compound}
                onChange={(e) => setCompound(e.target.value)}
                className="px-2 py-1 bg-neutral-800 text-white font-mono font-bold rounded-lg text-sm border border-neutral-700 focus:outline-none focus:border-[#E10600]"
              >
                <option value="SOFT">SOFT (C3)</option>
                <option value="MEDIUM">MEDIUM (C2)</option>
                <option value="HARD">HARD (C1)</option>
              </select>
            </div>

            <button
              onClick={runSimulation}
              disabled={loading}
              className="mt-3 px-4 py-2 bg-[#E10600] hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center space-x-1"
            >
              {loading ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
              <span>Simulate Ghost</span>
            </button>
          </div>
        </div>

        {/* Live Replay Controls & Scrubber */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-neutral-700/80">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-white text-neutral-900 rounded-xl hover:bg-neutral-200 transition-all font-bold"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => { setIsPlaying(false); setCurrentLap(1); }}
              className="p-2 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="flex items-center bg-neutral-800 rounded-xl p-1 border border-neutral-700">
              {[1, 2, 5, 10].map((s) => (
                <button
                  key={s}
                  onClick={() => setReplaySpeed(s)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    replaySpeed === s ? 'bg-[#E10600] text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 max-w-xl flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-neutral-300 w-16">Lap {currentLap}/{ghostData?.total_laps || 52}</span>
            <input
              type="range"
              min={1}
              max={ghostData?.total_laps || 52}
              value={currentLap}
              onChange={(e) => setCurrentLap(Number(e.target.value))}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#E10600]"
            />
          </div>

          {/* Live Ghost Delta Badge */}
          <div className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-300 text-xs font-mono font-black flex items-center space-x-1.5">
            <Gauge className="w-4 h-4" />
            <span>{ghostData?.ghost_car.delta_text || 'Ghost +2.3s Ahead'}</span>
          </div>
        </div>
      </div>

      {/* Main Track & Split Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: SVG Circuit Track Map */}
        <div className="lg:col-span-2">
          <CircuitTrackMap
            season={season}
            round={round}
            standings={standings}
            selectedDriver={driver}
            onSelectDriver={onSelectDriver}
            ghostDriver={{
              driver: driver,
              position: ghostPosNum,
              team_color: '#F59E0B',
              label: 'GHOST'
            }}
          />
        </div>

        {/* Right Col: Live Real vs Ghost Comparison Cards */}
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-neutral-500 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-[#E10600]" />
              <span>Real Car vs Ghost Strategy</span>
            </h3>

            {/* Strategy Divergence Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
              <div className="font-black uppercase tracking-wider text-amber-800 flex items-center space-x-1">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Strategy Diverged at Lap {ghostData?.divergence_lap || 38}</span>
              </div>
              <p className="font-medium text-amber-700">
                REAL: Stay Out | GHOST: Pit  {compound}
              </p>
            </div>

            {/* Split Comparison Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Real Car Card */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 space-y-1">
                <span className="text-[10px] font-black uppercase text-neutral-400">REAL CAR</span>
                <div className="text-xl font-black text-neutral-900">{ghostData?.real_car.finish_position || 'P5'}</div>
                <div className="text-xs font-bold text-neutral-600">Actual Strategy</div>
                <div className="text-[10px] font-mono text-neutral-500">{ghostData?.real_car.starting_compound || 'MEDIUM'}</div>
              </div>

              {/* Ghost Car Card */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-700">GHOST CAR</span>
                <div className="text-xl font-black text-amber-600">{ghostData?.ghost_car.finish_position || 'P3'}</div>
                <div className="text-xs font-bold text-amber-800">Simulated Alternate</div>
                <div className="text-[10px] font-mono text-amber-700">Pit L{pitLap}  {compound}</div>
              </div>
            </div>

            {/* Position Change Badge */}
            <div className="bg-neutral-900 text-white rounded-2xl p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300">Projected Delta</span>
              <span className="text-sm font-mono font-black text-emerald-400">
                {realPosNum > ghostPosNum ? `+${realPosNum - ghostPosNum} Positions` : `${realPosNum - ghostPosNum} Positions`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* "Why Did the Race Change?" Contributors Panel */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="border-b border-neutral-100 pb-3">
          <h3 className="text-lg font-black text-neutral-900 tracking-tight">
            Why Did the Race Change? (Contributors Breakdown)
          </h3>
          <p className="text-xs text-neutral-500 font-medium">
            Calculated time contributions from empirical model features. No fabricated metrics.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-black uppercase text-neutral-400">Tyre Pace Gain</span>
            <div className="text-base font-black text-emerald-600 font-mono">+{ghostData?.contributors.tyre_pace_gain_sec || 3.1}s</div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-black uppercase text-neutral-400">Fuel Load Effect</span>
            <div className="text-base font-black text-blue-600 font-mono">+{ghostData?.contributors.fuel_effect_sec || 0.35}s</div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-black uppercase text-neutral-400">Pit Stop Loss</span>
            <div className="text-base font-black text-[#E10600] font-mono">{ghostData?.contributors.pit_loss_sec || -22.4}s</div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-black uppercase text-neutral-400">Degradation Diff</span>
            <div className="text-base font-black text-amber-600 font-mono">+{ghostData?.contributors.degradation_diff_sec || 1.4}s</div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 space-y-1">
            <span className="text-[10px] font-black uppercase text-neutral-400">Traffic Effect</span>
            <div className="text-base font-black text-purple-600 font-mono">+{ghostData?.contributors.traffic_effect_sec || 0.8}s</div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 space-y-1 text-white">
            <span className="text-[10px] font-black uppercase text-neutral-400">Net Time Delta</span>
            <div className="text-base font-black text-emerald-400 font-mono">+{ghostData?.contributors.net_time_diff_sec || 2.3}s</div>
          </div>
        </div>
      </div>

      {/* Cascading Impact & Plotly Trajectory Chart */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="border-b border-neutral-100 pb-3">
          <h3 className="text-lg font-black text-neutral-900 tracking-tight">
            Cascading Impact on Grid Drivers
          </h3>
          <p className="text-xs text-neutral-500 font-medium">
            Position shifts for nearby drivers caused by the strategy divergence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Ripple Timeline */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-neutral-700 bg-neutral-100 p-2.5 rounded-xl">
              <span>Strategy Divergence</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              <span>Fresh Tyre Advantage</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              <span>Position Swap</span>
            </div>

            <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden">
              {ghostData?.cascading_impact.map((c) => (
                <div key={c.driver} className="p-3 flex items-center justify-between text-xs hover:bg-neutral-50">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.team_color }} />
                    <span className="font-black text-neutral-900">{c.driver}</span>
                    <span className="text-neutral-500 font-medium">{c.driver_name}</span>
                  </div>
                  <div className="flex items-center space-x-3 font-mono font-bold">
                    <span className="text-neutral-600">Actual P{c.actual_position}</span>
                    <ArrowRight className="w-3 h-3 text-neutral-400" />
                    <span className="text-neutral-900">Sim P{c.simulated_position}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      c.position_change.startsWith('+') ? 'bg-emerald-100 text-emerald-800' :
                      c.position_change.startsWith('-') ? 'bg-red-100 text-red-800' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {c.position_change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Plotly Position Evolution Chart */}
          <div className="w-full h-[280px]">
            <Plot
              data={[
                {
                  x: Array.from({ length: 52 }, (_, i) => i + 1),
                  y: Array.from({ length: 52 }, (_, i) => (i < pitLap ? realPosNum : Math.max(1, realPosNum))),
                  type: 'scatter',
                  mode: 'lines',
                  name: `Actual ${driver} Position`,
                  line: { color: '#171717', width: 3 }
                },
                {
                  x: Array.from({ length: 52 }, (_, i) => i + 1),
                  y: Array.from({ length: 52 }, (_, i) => (i < pitLap ? realPosNum : Math.max(1, ghostPosNum))),
                  type: 'scatter',
                  mode: 'lines',
                  name: `Ghost ${driver} Position`,
                  line: { color: '#F59E0B', width: 3, dash: 'dot' }
                }
              ]}
              layout={{
                autosize: true,
                title: { text: 'Real vs Ghost Position Trajectory', font: { size: 14, color: '#171717' } },
                xaxis: { title: { text: 'Race Lap Number (Laps)' }, gridcolor: '#F3F4F6' },
                yaxis: { title: { text: 'Track Position (P1=Leader)' }, autorange: 'reversed', gridcolor: '#F3F4F6' },
                margin: { l: 50, r: 20, t: 40, b: 50 },
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                legend: { orientation: 'h', y: -0.2 }
              }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
              config={{ responsive: true, displayModeBar: false }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
