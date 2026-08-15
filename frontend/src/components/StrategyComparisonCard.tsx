import React, { useState, useEffect } from 'react';
import PlotlyPlot from 'react-plotly.js';
import type { DriverInfo, StrategyComparisonResponse, StrategyDefinition } from '../types/race';
import { fetchStrategyComparison } from '../services/api';
import { Flag, Sparkles, Plus, Trash2 } from 'lucide-react';

interface StrategyComparisonCardProps {
  season: number;
  round: number;
  drivers: DriverInfo[];
  selectedDriver: string | null;
  totalLaps: number;
}

const COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];

export const StrategyComparisonCard: React.FC<StrategyComparisonCardProps> = ({
  season,
  round,
  drivers,
  selectedDriver,
  totalLaps
}) => {
  const [driver, setDriver] = useState<string>(selectedDriver || (drivers[0]?.driver || 'VER'));

  const [strategies, setStrategies] = useState<StrategyDefinition[]>([
    { name: 'Strategy A (Standard 1-Stop)', starting_compound: 'MEDIUM', pit_lap: 38, compound: 'HARD' },
    { name: 'Strategy B (Early Undercut)', starting_compound: 'MEDIUM', pit_lap: 28, compound: 'HARD' },
    { name: 'Strategy C (Reverse Stint)', starting_compound: 'HARD', pit_lap: 42, compound: 'MEDIUM' }
  ]);

  const [data, setData] = useState<StrategyComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDriver) {
      setDriver(selectedDriver);
    }
  }, [selectedDriver]);

  const compare = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchStrategyComparison({
        season,
        round_num: round,
        driver,
        strategies
      });
      setData(res);
    } catch (err: any) {
      console.error('Strategy comparison error:', err);
      setError(err?.message || 'Failed to analyze strategies.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    compare();
  }, [driver, strategies, season, round]);

  const updateStrategy = (index: number, field: keyof StrategyDefinition, value: any) => {
    const updated = [...strategies];
    updated[index] = { ...updated[index], [field]: value };
    setStrategies(updated);
  };

  const addStrategy = () => {
    if (strategies.length >= 4) return;
    const newIdx = stratsLengthToChar(strategies.length);
    setStrategies([
      ...strategies,
      { name: `Strategy ${newIdx}`, starting_compound: 'MEDIUM', pit_lap: 35, compound: 'SOFT' }
    ]);
  };

  const removeStrategy = (index: number) => {
    if (strategies.length <= 2) return;
    setStrategies(strategies.filter((_, i) => i !== index));
  };

  function stratsLengthToChar(len: number) {
    return String.fromCharCode(65 + len);
  }

  const rankedStrats = data?.ranked_strategies || [];
  const stratNames = rankedStrats.map((s) => s.name);
  const winProbs = rankedStrats.map((s) => s.win_probability);
  const podiumProbs = rankedStrats.map((s) => s.podium_probability);

  return (
    <div className="telemetry-card p-6 bg-white border border-neutral-200 rounded-3xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Flag className="w-5 h-5 text-[#E10600]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#E10600]">
              STRATEGY COMPARISON & OPTIMIZATION
            </span>
          </div>
          <h3 className="text-xl font-black text-neutral-900 tracking-tight">
            Multi-Strategy Optimizer & Recommendation Engine
          </h3>
        </div>

        {/* Add strategy button */}
        {strategies.length < 4 && (
          <button
            onClick={addStrategy}
            className="flex items-center space-x-2 bg-neutral-900 text-white hover:bg-neutral-800 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD STRATEGY</span>
          </button>
        )}
      </div>

      {/* Strategy Definition Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies.map((strat, idx) => (
          <div key={idx} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3 relative">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={strat.name}
                onChange={(e) => updateStrategy(idx, 'name', e.target.value)}
                className="bg-transparent font-black text-sm text-neutral-900 focus:outline-none border-b border-dashed border-neutral-400 pb-0.5 w-4/5"
              />
              {strategies.length > 2 && (
                <button
                  onClick={() => removeStrategy(idx)}
                  className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">START</label>
                <select
                  value={strat.starting_compound || 'MEDIUM'}
                  onChange={(e) => updateStrategy(idx, 'starting_compound', e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-2 py-1 text-[11px] font-bold text-neutral-900"
                >
                  {COMPOUNDS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">PIT LAP</label>
                <input
                  type="number"
                  min={1}
                  max={totalLaps - 1}
                  value={strat.pit_lap}
                  onChange={(e) => updateStrategy(idx, 'pit_lap', parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs font-black text-neutral-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-400 block mb-1">NEW</label>
                <select
                  value={strat.compound}
                  onChange={(e) => updateStrategy(idx, 'compound', e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-2 py-1 text-[11px] font-bold text-neutral-900"
                >
                  {COMPOUNDS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="py-10 text-center text-xs font-mono text-neutral-400 animate-pulse">
          Simulating strategies across Monte Carlo runs...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-bold">
          {error}
        </div>
      )}

      {!isLoading && data && (
        <div className="space-y-6">
          {/* Strategy Ranking Cards */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase text-neutral-500 tracking-wider block">
              STRATEGY RANKINGS & RECOMMENDATIONS
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rankedStrats.map((st) => (
                <div
                  key={st.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    st.recommended
                      ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/50 shadow-sm'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-neutral-900 uppercase">{st.name}</span>
                    {st.recommended && (
                      <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 fill-current" />
                        <span>RECOMMENDED</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">WIN PROB</span>
                      <strong className="text-amber-600 font-sans text-base">{st.win_probability}%</strong>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px]">PODIUM PROB</span>
                      <strong className="text-emerald-600 font-sans text-base">{st.podium_probability}%</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-600 font-semibold space-y-1">
                    <div>Expected Position: <strong className="text-neutral-900">P{st.expected_position}</strong></div>
                    <div>Stint Timeline: <strong className="text-neutral-900">{st.starting_compound} ({st.pit_lap} Laps)  {st.new_compound}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plotly Strategy Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Win / Podium Comparison */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <h4 className="text-xs font-black uppercase text-neutral-700 tracking-wider mb-2">
                Win & Podium Probability Comparison (%)
              </h4>
              <PlotlyPlot
                data={[
                  {
                    x: stratNames,
                    y: winProbs,
                    type: 'bar',
                    name: 'Win Probability %',
                    marker: { color: '#F59E0B' }
                  },
                  {
                    x: stratNames,
                    y: podiumProbs,
                    type: 'bar',
                    name: 'Podium Probability %',
                    marker: { color: '#10B981' }
                  }
                ]}
                layout={{
                  autosize: true,
                  height: 280,
                  margin: { l: 40, r: 15, t: 15, b: 40 },
                  barmode: 'group',
                  yaxis: { title: 'Probability (%)' },
                  legend: { orientation: 'h', y: -0.2 }
                }}
                useResizeHandler={true}
                className="w-full"
              />
            </div>

            {/* Chart 2: Strategy Performance Heatmap Matrix */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <h4 className="text-xs font-black uppercase text-neutral-700 tracking-wider mb-2">
                Strategy Performance Heatmap Matrix
              </h4>
              <PlotlyPlot
                data={[
                  {
                    z: data.matrix.z_values,
                    x: data.matrix.metrics,
                    y: data.matrix.strategies,
                    type: 'heatmap',
                    colorscale: 'Reds',
                    reversescale: true
                  }
                ]}
                layout={{
                  autosize: true,
                  height: 280,
                  margin: { l: 80, r: 15, t: 15, b: 40 }
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
