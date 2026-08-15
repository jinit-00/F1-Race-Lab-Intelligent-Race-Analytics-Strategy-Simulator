import React from 'react';
import { Activity } from 'lucide-react';

interface LoadingScreenProps {
  statusMessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  statusMessage = 'Fetching official FastF1 race telemetry...'
}) => {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="telemetry-card max-w-md w-full p-8 space-y-6 bg-white border border-neutral-200 shadow-xl rounded-2xl relative overflow-hidden">
        {/* Subtle decorative glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-100/60 blur-3xl rounded-full pointer-events-none"></div>

        {/* F1 Logo & Header */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E10600] text-white font-black text-xl shadow-[0_4px_12px_rgba(225,6,0,0.3)]">
            🏎
          </div>
          <h2 className="text-2xl font-black font-sans tracking-tight text-neutral-900 uppercase mt-2">
            F1 RACE LAB
          </h2>
          <p className="text-xs text-neutral-500 font-medium">
            Preparing race telemetry & analytics
          </p>
        </div>

        {/* Spinner & Progress status */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center">
              <Activity className="w-8 h-8 text-[#E10600] animate-pulse" />
              <div className="absolute w-14 h-14 border-2 border-red-200 border-t-[#E10600] rounded-full animate-spin"></div>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-extrabold text-neutral-900 uppercase tracking-wide">
              Loading race data...
            </p>
            <p className="text-xs text-neutral-500 font-mono">
              {statusMessage}
            </p>
          </div>

          {/* Progress checklist */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left text-xs font-mono space-y-2 text-neutral-600">
            <div className="flex items-center space-x-2 text-neutral-900 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping"></span>
              <span>Loading session telemetry...</span>
            </div>
            <div className="flex items-center space-x-2 text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-neutral-300"></span>
              <span>Processing timing & tyre compounds...</span>
            </div>
            <div className="flex items-center space-x-2 text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-neutral-300"></span>
              <span>Preparing race timeline replay...</span>
            </div>
          </div>

          {/* Animated progress bar */}
          <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden border border-neutral-200">
            <div className="bg-[#E10600] h-full rounded-full animate-pulse w-3/4 shadow-[0_0_8px_rgba(225,6,0,0.4)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
