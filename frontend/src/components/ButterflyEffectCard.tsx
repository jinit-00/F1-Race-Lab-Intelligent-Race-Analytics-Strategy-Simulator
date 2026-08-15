import React, { useState, useEffect, useMemo } from 'react';
import PlotlyPlot from 'react-plotly.js';
import type { DriverInfo, ButterflyEffectResponse } from '../types/race';
import { fetchButterflyAnalysis } from '../services/api';
import { Sparkles, Sliders } from 'lucide-react';

interface ButterflyEffectCardProps {
  season: number;
  round: number;
  drivers: DriverInfo[];
  selectedDriver: string | null;
  totalLaps: number;
}

const COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD'];

export const ButterflyEffectCard: React.FC<ButterflyEffectCardProps> = ({
  season,
  round,
  drivers,
  selectedDriver
}) => {
  const [driver, setDriver] = useState<string>(selectedDriver || (drivers[0]?.driver || 'VER'));
  const [pitLap, setPitLap] = useState<number>(38);
  const [compound, setCompound] = useState<string>('HARD');

  const [data, setData] = useState<ButterflyEffectResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDriver) {
      setDriver(selectedDriver);
    }
  }, [selectedDriver]);

  const loadButterflyData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchButterflyAnalysis(season, round, driver, compound);
      setData(res);
    } catch (err: any) {
      console.error('Butterfly effect analysis error:', err);
      setError(err?.message || 'Failed to compute Butterfly Effect strategy landscape.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadButterflyData();
  }, [driver, compound, season, round]);

  const selectedPoint = useMemo(() => {
    if (!data || !data.pit_lap_points) return null;
    return data.pit_lap_points.find((p) => p.pit_lap === pitLap) || data.pit_lap_points[0] || null;
  }, [data, pitLap]);

  const pitLapsList = data?.pit_laps || [];
  const points = data?.pit_lap_points || [];

  const finishPositions = points.map((p) => p.finish_pos_num);
  const winProbs = points.map((p) => p.win_probability);

  return (
    <div className="telemetry-card p-6 bg-white border border-neutral-200 rounded-3xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#E10600] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#E10600]">
              STEP 9 — THE BUTTERFLY EFFECT (SIGNATURE CENTERPIECE)
            </span>
          </div>
          <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
            How Much Does One Pit Lap Change the Race Outcome?
          </h3>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <div>
            <label className="text-[10px] font-extrabold text-neutral-400 uppercase block mb-1">
              TARGET DRIVER
            </label>
            <select
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-900"
            >
              {drivers.map((d) => (
                <option key={d.driver} value={d.driver}>
                  {d.driver} — {d.driver_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-neutral-400 uppercase block mb-1">
              TARGET COMPOUND
            </label>
            <select
              value={compound}
              onChange={(e) => setCompound(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-900"
            >
              {COMPOUNDS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Pit Lap Slider */}
      <div className="bg-neutral-900 text-white p-6 rounded-3xl space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-red-500" />
            <span className="text-xs font-black uppercase tracking-widest text-red-400">
              PIT LAP STRATEGY SLIDER
            </span>
          </div>
          <span className="text-3xl font-black font-mono text-white">
            LAP {pitLap}
          </span>
        </div>

        <input
          type="range"
          min={data?.pit_lap_range[0] || 30}
          max={data?.pit_lap_range[1] || 50}
          value={pitLap}
          onChange={(e) => setPitLap(parseInt(e.target.value))}
          className="w-full h-3 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#E10600]"
        />

        {/* Live Readout Cards */}
        {selectedPoint && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-neutral-800 p-3 rounded-2xl border border-neutral-700">
              <span className="text-[10px] font-black text-neutral-400 uppercase block">PREDICTED FINISH</span>
              <span className="text-2xl font-black text-white">{selectedPoint.finish_position}</span>
            </div>

            <div className="bg-neutral-800 p-3 rounded-2xl border border-neutral-700">
              <span className="text-[10px] font-black text-neutral-400 uppercase block">WIN PROBABILITY</span>
              <span className="text-2xl font-black text-amber-400">{selectedPoint.win_probability}%</span>
            </div>

            <div className="bg-neutral-800 p-3 rounded-2xl border border-neutral-700">
              <span className="text-[10px] font-black text-neutral-400 uppercase block">POSITION GAIN</span>
              <span className="text-2xl font-black text-emerald-400">+{selectedPoint.position_gain}</span>
            </div>

            <div className="bg-neutral-800 p-3 rounded-2xl border border-neutral-700">
              <span className="text-[10px] font-black text-neutral-400 uppercase block">TIME GAIN / LOSS</span>
              <span className="text-2xl font-black text-emerald-300">{selectedPoint.time_gain}s</span>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="py-12 text-center text-xs font-mono text-neutral-400 animate-pulse">
          Calculating Butterfly Effect strategy landscape across pit windows...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-bold">
          {error}
        </div>
      )}

      {/* Butterfly Effect Summary Card */}
      {!isLoading && data && (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-black uppercase tracking-wider text-[#E10600] block">
                OPTIMAL PIT WINDOW SUMMARY
              </span>
              <h4 className="text-2xl font-black text-neutral-900">
                Optimal Pit Window: Laps {data.optimal_window}
              </h4>
              <p className="text-xs text-neutral-600 font-medium">
                Pitting on Lap {data.best_pit_lap} yields maximum win probability ({data.best_win_probability}%) and best possible finish ({data.best_finish}).
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-white p-3 rounded-xl border border-red-100 shadow-sm font-mono text-xs text-neutral-800">
              <div>BEST: <strong className="text-emerald-600">{data.best_finish}</strong></div>
              <div>WORST: <strong className="text-red-600">{data.worst_finish}</strong></div>
              <div>MAX GAIN: <strong className="text-emerald-600">{data.max_position_gain} POS</strong></div>
            </div>
          </div>

          {/* Plotly Visualizations: 2D & 3D Centerpiece */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Pit Lap -> Position */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <h4 className="text-xs font-black uppercase text-neutral-700 tracking-wider mb-2">
                1. Pit Lap vs Predicted Finishing Position
              </h4>
              <PlotlyPlot
                data={[
                  {
                    x: pitLapsList,
                    y: finishPositions,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Finish Position',
                    line: { color: '#E10600', width: 3 },
                    marker: { size: 7, color: pitLapsList.map((l) => (l === pitLap ? '#171717' : '#E10600')) }
                  }
                ]}
                layout={{
                  autosize: true,
                  height: 280,
                  margin: { l: 40, r: 15, t: 15, b: 40 },
                  yaxis: { title: 'Position', autorange: 'reversed', dtick: 1 },
                  xaxis: { title: 'Pit Lap' }
                }}
                useResizeHandler={true}
                className="w-full"
              />
            </div>

            {/* Chart 2: Pit Lap -> Win Probability */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <h4 className="text-xs font-black uppercase text-neutral-700 tracking-wider mb-2">
                2. Pit Lap vs Win Probability (%)
              </h4>
              <PlotlyPlot
                data={[
                  {
                    x: pitLapsList,
                    y: winProbs,
                    type: 'scatter',
                    mode: 'lines+markers',
                    fill: 'tozeroy',
                    fillcolor: 'rgba(245, 158, 11, 0.15)',
                    name: 'Win Probability',
                    line: { color: '#F59E0B', width: 3 }
                  }
                ]}
                layout={{
                  autosize: true,
                  height: 280,
                  margin: { l: 40, r: 15, t: 15, b: 40 },
                  yaxis: { title: 'Win Probability (%)' },
                  xaxis: { title: 'Pit Lap' }
                }}
                useResizeHandler={true}
                className="w-full"
              />
            </div>

            {/* Chart 3: Pit Lap x Compound Heatmap */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <h4 className="text-xs font-black uppercase text-neutral-700 tracking-wider mb-2">
                3. Strategy Heatmap (Pit Lap × Tire Compound)
              </h4>
              <PlotlyPlot
                data={[
                  {
                    z: data.surface_z,
                    x: pitLapsList,
                    y: data.compounds,
                    type: 'heatmap',
                    colorscale: 'Viridis'
                  }
                ]}
                layout={{
                  autosize: true,
                  height: 280,
                  margin: { l: 70, r: 15, t: 15, b: 40 }
                }}
                useResizeHandler={true}
                className="w-full"
              />
            </div>

            {/* Chart 4: Signature 3D Strategy Surface */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <h4 className="text-xs font-black uppercase text-neutral-700 tracking-wider mb-2 flex items-center justify-between">
                <span>4. Signature 3D Strategy Surface</span>
                <span className="text-[10px] text-neutral-400 font-mono">Rotate / Zoom / Tilt 3D</span>
              </h4>
              <PlotlyPlot
                data={[
                  {
                    z: data.surface_z,
                    x: pitLapsList,
                    y: data.compounds,
                    type: 'surface',
                    colorscale: 'Portland'
                  }
                ]}
                layout={{
                  autosize: true,
                  height: 280,
                  margin: { l: 0, r: 0, t: 0, b: 0 },
                  scene: {
                    xaxis: { title: 'Pit Lap' },
                    yaxis: { title: 'Compound' },
                    zaxis: { title: 'Win %' },
                    camera: { eye: { x: 1.4, y: 1.4, z: 1.2 } }
                  }
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
