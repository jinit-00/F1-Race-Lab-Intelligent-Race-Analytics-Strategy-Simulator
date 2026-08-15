import React, { useState, useEffect } from 'react';
import type { DriverInfo, LapData, LapTimePredictionResponse } from '../types/race';
import { predictNextLapTime, formatLapTime } from '../services/api';
import { Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface NextLapPredictionCardProps {
  drivers: DriverInfo[];
  selectedDriver: string | null;
  currentLapData: LapData | null;
  currentLap: number;
  circuit: string;
}

export const NextLapPredictionCard: React.FC<NextLapPredictionCardProps> = ({
  drivers,
  selectedDriver,
  currentLapData,
  currentLap,
  circuit
}) => {
  const [prediction, setPrediction] = useState<LapTimePredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const driver = selectedDriver || (drivers[0]?.driver || 'VER');
  const compound = currentLapData?.compound || 'MEDIUM';
  const tyreAge = currentLapData?.tyre_age || 15;
  const currentPace = currentLapData?.lap_time || 91.5;

  useEffect(() => {
    let isMounted = true;
    async function getNextLapPrediction() {
      setIsLoading(true);
      try {
        const res = await predictNextLapTime({
          driver,
          circuit,
          compound,
          tyre_age: tyreAge,
          lap: currentLap,
          previous_lap_time: currentPace
        });
        if (isMounted) setPrediction(res);
      } catch (err) {
        console.error('Next lap prediction error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    getNextLapPrediction();
    return () => {
      isMounted = false;
    };
  }, [driver, circuit, compound, tyreAge, currentLap, currentPace]);

  const changeVal = prediction?.expected_change ?? 0.22;
  const isLoss = changeVal >= 0;

  return (
    <div className="telemetry-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-50 text-[#E10600] rounded-xl border border-red-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E10600] block">
              STEP 4 — ML LAP TIME PREDICTION MODEL
            </span>
            <h2 className="text-base font-extrabold text-neutral-900">
              Next Lap Pace Forecaster
            </h2>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-neutral-100 text-neutral-700 px-3 py-1 rounded-xl border border-neutral-200">
          Driver {driver}
        </span>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Current Lap */}
        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            CURRENT LAP
          </span>
          <span className="font-mono text-lg font-black text-neutral-900">
            Lap {currentLap}
          </span>
        </div>

        {/* Current Pace */}
        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            CURRENT PACE
          </span>
          <span className="font-mono text-base font-black text-neutral-800">
            {formatLapTime(currentPace)}
          </span>
        </div>

        {/* Predicted Next Lap */}
        <div className="bg-red-50/80 p-4 rounded-2xl border border-red-100 text-center">
          <span className="text-[10px] font-extrabold text-[#E10600] uppercase tracking-wider block mb-1">
            PREDICTED NEXT LAP
          </span>
          <span className="font-mono text-base font-black text-[#E10600]">
            {isLoading ? '...' : formatLapTime(prediction?.predicted_lap_time)}
          </span>
        </div>

        {/* Expected Change */}
        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-center">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            EXPECTED CHANGE
          </span>
          <div className="flex items-center justify-center space-x-1 font-mono text-base font-extrabold">
            {isLoss ? (
              <ArrowUpRight className="w-4 h-4 text-red-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            )}
            <span className={isLoss ? 'text-red-600' : 'text-emerald-600'}>
              {isLoading ? '...' : `${isLoss ? '+' : ''}${changeVal}s`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
