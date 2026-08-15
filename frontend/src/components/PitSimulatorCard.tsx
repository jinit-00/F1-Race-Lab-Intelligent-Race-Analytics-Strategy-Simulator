import React, { useState } from 'react';
import type { DriverInfo, PitSimulationResponse } from '../types/race';
import { simulatePitStop } from '../services/api';
import { Wrench, Play, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PitSimulatorCardProps {
  season: number;
  round: number;
  drivers: DriverInfo[];
  selectedDriver: string | null;
  currentLap: number;
  totalLaps: number;
  onSimulationComplete?: (result: PitSimulationResponse) => void;
}

export const PitSimulatorCard: React.FC<PitSimulatorCardProps> = ({
  season,
  round,
  drivers,
  selectedDriver,
  currentLap,
  totalLaps,
  onSimulationComplete
}) => {
  const [driver, setDriver] = useState<string>(selectedDriver || (drivers[0]?.driver || 'VER'));
  const [pitLap, setPitLap] = useState<number>(Math.min(currentLap + 2, totalLaps - 5));
  const [newCompound, setNewCompound] = useState<string>('HARD');

  const [simResult, setSimResult] = useState<PitSimulationResponse | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedDriver) {
      setDriver(selectedDriver);
    }
  }, [selectedDriver]);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setErrorMsg(null);
    try {
      const res = await simulatePitStop({
        season,
        round_num: round,
        driver,
        pit_lap: pitLap,
        new_compound: newCompound
      });
      setSimResult(res);
      if (onSimulationComplete) {
        onSimulationComplete(res);
      }
    } catch (err: any) {
      console.error('Simulation failed:', err);
      setErrorMsg(err?.message || 'Failed to execute strategy simulation.');
    } finally {
      setIsSimulating(false);
    }
  };

  const compounds = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];

  return (
    <div className="telemetry-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-50 text-[#E10600] rounded-xl border border-red-100">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E10600] block">
              STEP 5 — PIT STOP STRATEGY SIMULATOR
            </span>
            <h2 className="text-base font-extrabold text-neutral-900">
              What-If Pit Strategy Simulator
            </h2>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-neutral-100 text-neutral-700 px-3 py-1 rounded-xl border border-neutral-200">
          Race Simulation Engine
        </span>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        {/* Driver */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Driver
          </label>
          <select
            value={driver}
            onChange={(e) => setDriver(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs font-mono font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E10600]"
          >
            {drivers.map((d) => (
              <option key={d.driver} value={d.driver}>
                {d.driver} — {d.driver_name}
              </option>
            ))}
          </select>
        </div>

        {/* Pit On Lap */}
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
            <span>Pit On Lap</span>
            <span className="text-neutral-900 font-mono font-bold">Lap {pitLap}</span>
          </div>
          <input
            type="range"
            min={1}
            max={totalLaps}
            value={pitLap}
            onChange={(e) => setPitLap(Number(e.target.value))}
            className="w-full h-2.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#E10600]"
          />
        </div>

        {/* New Compound */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            New Tyre Compound
          </label>
          <select
            value={newCompound}
            onChange={(e) => setNewCompound(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs font-mono font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E10600]"
          >
            {compounds.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Simulate Action Button */}
        <div>
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="w-full flex items-center justify-center space-x-2 bg-[#E10600] hover:bg-[#c90500] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(225,6,0,0.25)] transition disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isSimulating ? 'SIMULATING...' : 'SIMULATE'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-mono">
          {errorMsg}
        </div>
      )}

      {/* Simulation Result Output */}
      {simResult && (
        <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-neutral-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>SIMULATION OUTCOME FOR {simResult.driver}</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#E10600]">
              Pit Lap {simResult.pit_lap}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Old Tyre */}
            <div className="bg-white p-3 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">OLD TYRE</span>
              <span className="font-mono text-xs font-bold text-neutral-800">
                {simResult.old_compound} ({simResult.old_tyre_age}L)
              </span>
            </div>

            {/* New Tyre */}
            <div className="bg-white p-3 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">NEW TYRE</span>
              <span className="font-mono text-xs font-bold text-emerald-600">
                {simResult.new_compound} (0L)
              </span>
            </div>

            {/* Pit Loss */}
            <div className="bg-white p-3 rounded-xl border border-neutral-200 text-center">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">PIT LOSS</span>
              <span className="font-mono text-xs font-bold text-amber-600">
                +{simResult.pit_loss}s
              </span>
            </div>

            {/* Position Change */}
            <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center">
              <span className="text-[10px] font-extrabold text-[#E10600] uppercase tracking-wider block">PREDICTED FINISH</span>
              <div className="flex items-center justify-center space-x-1 font-mono text-sm font-black text-[#E10600]">
                <span>{simResult.old_position}</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{simResult.predicted_finish}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
