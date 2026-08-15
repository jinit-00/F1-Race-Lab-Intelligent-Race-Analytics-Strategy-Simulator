import React, { useState, useEffect } from 'react';
import type { DriverInfo, DegradationPredictionResponse } from '../types/race';
import { predictTireDegradation } from '../services/api';
import Plot from 'react-plotly.js';
import { Flame, ChevronDown } from 'lucide-react';

interface TireDegradationCardProps {
  drivers: DriverInfo[];
  selectedDriver: string | null;
  currentLap: number;
  circuit: string;
}

export const TireDegradationCard: React.FC<TireDegradationCardProps> = ({
  drivers,
  selectedDriver,
  currentLap,
  circuit
}) => {
  const [driver, setDriver] = useState<string>(selectedDriver || (drivers[0]?.driver || 'VER'));
  const [compound, setCompound] = useState<string>('MEDIUM');
  const [tyreAge, setTyreAge] = useState<number>(15);
  const [prediction, setPrediction] = useState<DegradationPredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (selectedDriver) {
      setDriver(selectedDriver);
    }
  }, [selectedDriver]);

  useEffect(() => {
    let isMounted = true;
    async function getPrediction() {
      setIsLoading(true);
      try {
        const res = await predictTireDegradation({
          driver,
          compound,
          tyre_age: tyreAge,
          lap: currentLap,
          circuit
        });
        if (isMounted) setPrediction(res);
      } catch (err) {
        console.error('Degradation prediction error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    getPrediction();
    return () => {
      isMounted = false;
    };
  }, [driver, compound, tyreAge, currentLap, circuit]);

  const compounds = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];

  const getCompoundColor = (cmp: string) => {
    switch (cmp) {
      case 'SOFT':
        return '#EF4444'; // Red
      case 'MEDIUM':
        return '#EAB308'; // Yellow
      case 'HARD':
        return '#9CA3AF'; // Gray
      case 'INTERMEDIATE':
        return '#22C55E'; // Green
      case 'WET':
        return '#3B82F6'; // Blue
      default:
        return '#6B7280';
    }
  };

  // Generate synthetic tire degradation curves for Plotly visualization
  const ages = Array.from({ length: 40 }, (_, i) => i + 1);
  const softDeg = ages.map((a) => round2(0.04 * a + 0.002 * Math.pow(a, 1.8)));
  const medDeg = ages.map((a) => round2(0.025 * a + 0.001 * Math.pow(a, 1.7)));
  const hardDeg = ages.map((a) => round2(0.015 * a + 0.0006 * Math.pow(a, 1.6)));

  function round2(val: number) {
    return Math.round(val * 100) / 100;
  }

  return (
    <div className="telemetry-card p-6 bg-white border border-neutral-200 rounded-3xl space-y-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-50 text-[#E10600] rounded-xl border border-red-100">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E10600] block">
              ML TIRE DEGRADATION MODEL
            </span>
            <h2 className="text-base font-black text-neutral-900">
              Tire Degradation & Pace Loss Estimator
            </h2>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-neutral-100 text-neutral-700 px-3 py-1 rounded-xl border border-neutral-200">
          {circuit}
        </span>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Driver Selector */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Driver
          </label>
          <div className="relative">
            <select
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs font-mono font-bold rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-[#E10600] cursor-pointer"
            >
              {drivers.map((d) => (
                <option key={d.driver} value={d.driver}>
                  {d.driver} — {d.driver_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Compound Selector */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Tire Compound
          </label>
          <div className="relative">
            <select
              value={compound}
              onChange={(e) => setCompound(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs font-mono font-bold rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-[#E10600] cursor-pointer"
            >
              {compounds.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Tyre Age Slider */}
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
            <span>Tyre Age</span>
            <span className="text-neutral-900 font-mono font-bold">{tyreAge} Laps</span>
          </div>
          <input
            type="range"
            min={1}
            max={45}
            value={tyreAge}
            onChange={(e) => setTyreAge(Number(e.target.value))}
            className="w-full h-2.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#E10600]"
          />
        </div>
      </div>

      {/* Degradation Readout Display */}
      <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span
              className="text-xs font-mono font-black px-3 py-1 rounded-full uppercase text-white shadow-xs"
              style={{ backgroundColor: getCompoundColor(compound) }}
            >
              {compound}
            </span>
            <span className="text-xs font-mono font-bold text-neutral-600">
              {tyreAge} Laps Old
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-medium">
            Predicted lap-time penalty due to thermal rubber wear
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
            EXPECTED DEGRADATION
          </span>
          <div className="text-2xl font-black font-mono text-[#E10600]">
            {isLoading ? '...' : `+${prediction?.predicted_loss ?? 0.18} sec/lap`}
          </div>
        </div>
      </div>

      {/* Plotly Degradation Curves Chart */}
      <div className="w-full h-[240px] pt-2">
        <Plot
          data={[
            {
              x: ages,
              y: softDeg,
              type: 'scatter',
              mode: 'lines',
              name: 'SOFT Compound',
              line: { color: '#EF4444', width: 2.5 }
            },
            {
              x: ages,
              y: medDeg,
              type: 'scatter',
              mode: 'lines',
              name: 'MEDIUM Compound',
              line: { color: '#EAB308', width: 2.5 }
            },
            {
              x: ages,
              y: hardDeg,
              type: 'scatter',
              mode: 'lines',
              name: 'HARD Compound',
              line: { color: '#9CA3AF', width: 2.5 }
            }
          ]}
          layout={{
            autosize: true,
            title: { text: 'Pace Penalty vs Tyre Age (Laps)', font: { size: 13, color: '#171717' } },
            xaxis: { title: { text: 'Tire Age (Laps)' }, gridcolor: '#F3F4F6' },
            yaxis: { title: { text: 'Expected Lap-Time Loss (sec/lap)' }, gridcolor: '#F3F4F6' },
            margin: { l: 50, r: 20, t: 35, b: 45 },
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
  );
};
