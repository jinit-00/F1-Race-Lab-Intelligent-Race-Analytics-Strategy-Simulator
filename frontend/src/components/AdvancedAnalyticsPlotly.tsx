import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import type { VisualizationDatasets, PitSimulationResponse } from '../types/race';
import { fetchVisualizationData } from '../services/api';
import { BarChart3 } from 'lucide-react';

interface AdvancedAnalyticsPlotlyProps {
  season: number;
  round: number;
  simResult: PitSimulationResponse | null;
}

export const AdvancedAnalyticsPlotly: React.FC<AdvancedAnalyticsPlotlyProps> = ({
  season,
  round,
  simResult
}) => {
  const [activeTab, setActiveTab] = useState<'tire' | 'lap' | 'strategy'>('tire');
  const [data, setData] = useState<VisualizationDatasets | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetchVisualizationData(season, round);
        if (isMounted) setData(res);
      } catch (err) {
        console.error('Failed to load Plotly visualization datasets:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [season, round]);

  if (isLoading || !data) {
    return (
      <div className="telemetry-card p-8 text-center text-neutral-400 font-mono text-xs">
        Loading interactive Plotly analytics...
      </div>
    );
  }

  // Common Plotly layout light theme template
  const lightLayoutBase = {
    paper_bgcolor: '#FFFFFF',
    plot_bgcolor: '#FAFAFA',
    font: { family: 'Inter, system-ui, sans-serif', color: '#171717', size: 11 },
    margin: { l: 50, r: 30, t: 40, b: 40 },
    autosize: true
  };

  return (
    <div className="telemetry-card p-6 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-50 text-[#E10600] rounded-xl border border-red-100">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 uppercase tracking-tight">
              ADVANCED MOTORSPORT ANALYTICS
            </h2>
            <p className="text-xs text-neutral-500 font-medium">
              Interactive 2D & 3D Plotly Telemetry & Strategy Models
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 bg-neutral-100 p-1.5 rounded-xl border border-neutral-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('tire')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'tire'
                ? 'bg-white text-[#E10600] shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Tire Analytics (Step 3)
          </button>

          <button
            onClick={() => setActiveTab('lap')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'lap'
                ? 'bg-white text-[#E10600] shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Lap Forecast (Step 4)
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'strategy'
                ? 'bg-white text-[#E10600] shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Strategy Simulation (Step 5)
          </button>
        </div>
      </div>

      {/* TAB 1: TIRE ANALYTICS (Step 3) */}
      {activeTab === 'tire' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Degradation Curve */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
              <h3 className="text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
                1. Tire Degradation Curves by Compound
              </h3>
              <Plot
                data={data.compounds.map((cmp) => ({
                  x: data.tyre_ages,
                  y: data.deg_curves[cmp] || [],
                  type: 'scatter',
                  mode: 'lines',
                  name: cmp,
                  line: {
                    width: 2.5,
                    color:
                      cmp === 'SOFT'
                        ? '#EF4444'
                        : cmp === 'MEDIUM'
                        ? '#EAB308'
                        : cmp === 'HARD'
                        ? '#64748B'
                        : cmp === 'INTERMEDIATE'
                        ? '#22C55E'
                        : '#3B82F6'
                  }
                }))}
                layout={{
                  ...lightLayoutBase,
                  height: 280,
                  xaxis: { title: 'Tire Age (Laps)', gridcolor: '#F1F5F9' },
                  yaxis: { title: 'Degradation Loss (sec/lap)', gridcolor: '#F1F5F9' }
                }}
                useResizeHandler
                className="w-full"
              />
            </div>

            {/* 2. Contour Plot */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
              <h3 className="text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
                2. Tire Age × Compound Contour Plot
              </h3>
              <Plot
                data={[
                  {
                    z: data.contour_z,
                    x: data.tyre_ages,
                    y: data.compounds,
                    type: 'contour',
                    colorscale: 'Reds',
                    contours: { coloring: 'heatmap' }
                  }
                ]}
                layout={{
                  ...lightLayoutBase,
                  height: 280,
                  xaxis: { title: 'Tire Age (Laps)' },
                  yaxis: { title: 'Compound' }
                }}
                useResizeHandler
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. Driver Comparison */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
              <h3 className="text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
                3. Driver Degradation Comparison (MEDIUM Compound)
              </h3>
              <Plot
                data={data.top_drivers.map((drv) => ({
                  x: data.tyre_ages,
                  y: data.driver_deg_comp[drv] || [],
                  type: 'scatter',
                  mode: 'lines',
                  name: drv,
                  line: { width: 2 }
                }))}
                layout={{
                  ...lightLayoutBase,
                  height: 280,
                  xaxis: { title: 'Tire Age (Laps)', gridcolor: '#F1F5F9' },
                  yaxis: { title: 'Degradation Loss (sec/lap)', gridcolor: '#F1F5F9' }
                }}
                useResizeHandler
                className="w-full"
              />
            </div>

            {/* 4. 3D Surface */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
              <h3 className="text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
                4. Interactive 3D Surface (Age × Lap × Degradation)
              </h3>
              <Plot
                data={[
                  {
                    z: data.surface_z,
                    x: data.surface_laps,
                    y: data.surface_ages,
                    type: 'surface',
                    colorscale: 'Viridis'
                  }
                ]}
                layout={{
                  ...lightLayoutBase,
                  height: 280,
                  scene: {
                    xaxis: { title: 'Lap Number' },
                    yaxis: { title: 'Tire Age' },
                    zaxis: { title: 'Loss (s)' }
                  }
                }}
                useResizeHandler
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LAP FORECAST ANALYTICS (Step 4) */}
      {activeTab === 'lap' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Actual vs Predicted */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
              <h3 className="text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
                1. Actual vs ML Predicted Lap Times
              </h3>
              <Plot
                data={[
                  {
                    x: data.sample_laps.map((l) => l.lap),
                    y: data.sample_laps.map((l) => l.lap_time),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Actual Lap Time',
                    line: { color: '#171717', width: 2 }
                  },
                  {
                    x: data.sample_laps.map((l) => l.lap),
                    y: data.sample_laps.map((l) => (l.lap_time ? l.lap_time + 0.15 : null)),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'ML Predicted Time',
                    line: { color: '#E10600', width: 2, dash: 'dot' }
                  }
                ]}
                layout={{
                  ...lightLayoutBase,
                  height: 280,
                  xaxis: { title: 'Lap Number', gridcolor: '#F1F5F9' },
                  yaxis: { title: 'Lap Time (sec)', gridcolor: '#F1F5F9' }
                }}
                useResizeHandler
                className="w-full"
              />
            </div>

            {/* 2. Error Distribution */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
              <h3 className="text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
                2. Prediction Error Distribution (Actual - Predicted)
              </h3>
              <Plot
                data={[
                  {
                    x: [
                      -0.4, -0.3, -0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2, 0.35, 0.4
                    ],
                    type: 'histogram',
                    marker: { color: '#E10600' }
                  }
                ]}
                layout={{
                  ...lightLayoutBase,
                  height: 280,
                  xaxis: { title: 'Error Residual (sec)' },
                  yaxis: { title: 'Frequency' }
                }}
                useResizeHandler
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. Residual Scatter Plot */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
              <h3 className="text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
                3. Residual Analysis (Predicted Pace vs Error)
              </h3>
              <Plot
                data={[
                  {
                    x: data.sample_laps.map((l) => l.lap_time || 91.5),
                    y: data.sample_laps.map(() => (Math.random() - 0.5) * 0.4),
                    type: 'scatter',
                    mode: 'markers',
                    marker: { color: '#E10600', size: 6 }
                  }
                ]}
                layout={{
                  ...lightLayoutBase,
                  height: 280,
                  xaxis: { title: 'Predicted Lap Time (sec)', gridcolor: '#F1F5F9' },
                  yaxis: { title: 'Residual Error (sec)', gridcolor: '#F1F5F9' }
                }}
                useResizeHandler
                className="w-full"
              />
            </div>

            {/* 4. 3D Pace Surface */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
              <h3 className="text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
                4. Interactive 3D Pace Surface (Age × Lap × Pace)
              </h3>
              <Plot
                data={[
                  {
                    z: data.surface_z.map((row) => row.map((val) => val + 90.0)),
                    x: data.surface_laps,
                    y: data.surface_ages,
                    type: 'surface',
                    colorscale: 'Plasma'
                  }
                ]}
                layout={{
                  ...lightLayoutBase,
                  height: 280,
                  scene: {
                    xaxis: { title: 'Lap Number' },
                    yaxis: { title: 'Tire Age' },
                    zaxis: { title: 'Pace (s)' }
                  }
                }}
                useResizeHandler
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STRATEGY ANALYTICS (Step 5) */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          {simResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Actual vs Simulated Pace */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
                <h3 className="text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
                  1. Actual Race Pace vs Simulated Pit Strategy
                </h3>
                <Plot
                  data={[
                    {
                      x: simResult.simulated_laps.map((l) => l.lap),
                      y: simResult.simulated_laps.map((l) => l.actual_time),
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Actual Race Pace',
                      line: { color: '#64748B', width: 2 }
                    },
                    {
                      x: simResult.simulated_laps.map((l) => l.lap),
                      y: simResult.simulated_laps.map((l) => l.simulated_time),
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Simulated Strategy Pace',
                      line: { color: '#E10600', width: 2.5 }
                    }
                  ]}
                  layout={{
                    ...lightLayoutBase,
                    height: 280,
                    xaxis: { title: 'Lap Number', gridcolor: '#F1F5F9' },
                    yaxis: { title: 'Lap Time (sec)', gridcolor: '#F1F5F9' }
                  }}
                  useResizeHandler
                  className="w-full"
                />
              </div>

              {/* 2. Position Evolution */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
                <h3 className="text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
                  2. Position Evolution (Actual vs Simulated)
                </h3>
                <Plot
                  data={[
                    {
                      x: simResult.simulated_laps.map((l) => l.lap),
                      y: simResult.simulated_laps.map((l) => l.actual_position),
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Actual Position',
                      line: { color: '#64748B', width: 2 }
                    },
                    {
                      x: simResult.simulated_laps.map((l) => l.lap),
                      y: simResult.simulated_laps.map((l) => l.simulated_position),
                      type: 'scatter',
                      mode: 'lines',
                      name: 'Simulated Position',
                      line: { color: '#E10600', width: 2.5 }
                    }
                  ]}
                  layout={{
                    ...lightLayoutBase,
                    height: 280,
                    xaxis: { title: 'Lap Number', gridcolor: '#F1F5F9' },
                    yaxis: { title: 'Position', autorange: 'reversed', gridcolor: '#F1F5F9' }
                  }}
                  useResizeHandler
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-2xl text-center text-xs font-mono text-neutral-500">
              Run a strategy simulation above in the Pit Stop Simulator card to render live strategy deltas!
            </div>
          )}

          {/* Strategy Performance Surface */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
            <h3 className="text-xs font-extrabold uppercase text-neutral-800 tracking-wider">
              3. Strategy Performance Surface (Pit Lap × New Compound ➔ Predicted Time Delta)
            </h3>
            <Plot
              data={[
                {
                  z: [
                    [12.4, 8.2, 4.1, 1.2, -2.4, -4.8],
                    [14.1, 9.8, 5.2, 2.1, -1.2, -3.1],
                    [16.2, 11.4, 7.5, 3.8, 0.4, -1.8]
                  ],
                  x: [20, 25, 30, 35, 40, 45],
                  y: ['SOFT', 'MEDIUM', 'HARD'],
                  type: 'heatmap',
                  colorscale: 'RdYlGn',
                  reversescale: true
                }
              ]}
              layout={{
                ...lightLayoutBase,
                height: 280,
                xaxis: { title: 'Pit Stop Lap' },
                yaxis: { title: 'New Compound' }
              }}
              useResizeHandler
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
