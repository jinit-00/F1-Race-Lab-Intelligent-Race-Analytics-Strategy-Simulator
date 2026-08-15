import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message = 'FastF1 could not retrieve this session.',
  onRetry
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="telemetry-card max-w-md w-full p-8 space-y-5 border border-red-200 bg-red-50/60 shadow-lg rounded-2xl">
        <div className="flex justify-center">
          <div className="p-3 bg-red-100 border border-red-200 rounded-2xl text-[#E10600]">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
            Unable to load race data
          </h2>
          <p className="text-xs text-neutral-600 font-mono">
            {message}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onRetry}
            className="flex items-center justify-center space-x-2 w-full bg-[#E10600] hover:bg-[#c90500] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-[0_4px_12px_rgba(225,6,0,0.25)] transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
