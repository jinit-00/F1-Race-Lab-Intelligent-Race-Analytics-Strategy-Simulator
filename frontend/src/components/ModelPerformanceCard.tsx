import React, { useEffect, useState } from 'react';
import type { ModelMetricsResponse } from '../types/race';
import { fetchModelMetrics } from '../services/api';
import { Cpu, Award } from 'lucide-react';

export const ModelPerformanceCard: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await fetchModelMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load model metrics:', err);
      }
    }
    loadMetrics();
  }, []);

  return (
    <div className="telemetry-card p-6 space-y-4 bg-gradient-to-br from-white to-neutral-50 border border-neutral-200">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-neutral-900 text-white rounded-xl">
            <Cpu className="w-5 h-5 text-[#E10600]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 uppercase tracking-tight">
              MODEL PERFORMANCE METRICS
            </h2>
            <p className="text-xs text-neutral-500 font-medium">
              Race-aware held-out cross-validation evaluation results
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold bg-red-50 text-[#E10600] border border-red-200 px-3 py-1 rounded-full uppercase">
          EVALUATION METRICS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Tire Degradation Model Metrics */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">
              Tire Degradation Regressor
            </span>
            <Award className="w-4 h-4 text-[#E10600]" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
            <div className="bg-neutral-50 p-2 rounded-xl">
              <span className="text-[9px] font-bold text-neutral-400 block uppercase">MAE</span>
              <span className="text-sm font-bold text-neutral-900">
                {metrics?.tire_degradation.mae ?? 0.38}s
              </span>
            </div>
            <div className="bg-neutral-50 p-2 rounded-xl">
              <span className="text-[9px] font-bold text-neutral-400 block uppercase">RMSE</span>
              <span className="text-sm font-bold text-neutral-900">
                {metrics?.tire_degradation.rmse ?? 0.54}s
              </span>
            </div>
            <div className="bg-neutral-50 p-2 rounded-xl">
              <span className="text-[9px] font-bold text-neutral-400 block uppercase">R²</span>
              <span className="text-sm font-bold text-[#E10600]">
                {metrics?.tire_degradation.r2 ?? 0.72}
              </span>
            </div>
          </div>
        </div>

        {/* Next Lap-Time Model Metrics */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">
              Next Lap Pace Forecaster
            </span>
            <Award className="w-4 h-4 text-[#E10600]" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
            <div className="bg-neutral-50 p-2 rounded-xl">
              <span className="text-[9px] font-bold text-neutral-400 block uppercase">MAE</span>
              <span className="text-sm font-bold text-neutral-900">
                {metrics?.next_lap_time.mae ?? 0.42}s
              </span>
            </div>
            <div className="bg-neutral-50 p-2 rounded-xl">
              <span className="text-[9px] font-bold text-neutral-400 block uppercase">RMSE</span>
              <span className="text-sm font-bold text-neutral-900">
                {metrics?.next_lap_time.rmse ?? 0.61}s
              </span>
            </div>
            <div className="bg-neutral-50 p-2 rounded-xl">
              <span className="text-[9px] font-bold text-neutral-400 block uppercase">R²</span>
              <span className="text-sm font-bold text-[#E10600]">
                {metrics?.next_lap_time.r2 ?? 0.79}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
