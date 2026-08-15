import React, { useEffect, useState } from 'react';
import type { DriverInfo, LapData } from '../types/race';
import { formatLapTime, fetchDriverHeadshots } from '../services/api';
import { Clock, CircleDot, Activity, Shield } from 'lucide-react';

interface DriverCardProps {
  driverInfo: DriverInfo | null;
  currentLapData: LapData | null;
  pitStopsCount: number;
}

export const DriverCard: React.FC<DriverCardProps> = ({
  driverInfo,
  currentLapData,
  pitStopsCount
}) => {
  const [headshots, setHeadshots] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState<boolean>(false);

  useEffect(() => {
    const loadHeadshots = async () => {
      try {
        const data = await fetchDriverHeadshots();
        setHeadshots(data);
      } catch (err) {
        console.error('Failed to load headshots:', err);
      }
    };
    loadHeadshots();
  }, []);

  if (!driverInfo) {
    return (
      <div className="telemetry-card p-6 text-center text-neutral-400 text-xs font-mono bg-white border border-neutral-200 rounded-3xl shadow-sm">
        Select a driver from standings or track to view telemetry profile
      </div>
    );
  }

  const headshotUrl = headshots[driverInfo.driver];

  const getCompoundBadge = (compound: string | null) => {
    if (!compound) return <span className="text-neutral-400">—</span>;
    let badgeStyle = 'bg-neutral-100 text-neutral-700';
    switch (compound.toUpperCase()) {
      case 'SOFT':
        badgeStyle = 'bg-red-100 text-red-700 border border-red-200';
        break;
      case 'MEDIUM':
        badgeStyle = 'bg-amber-100 text-amber-800 border border-amber-200';
        break;
      case 'HARD':
        badgeStyle = 'bg-neutral-200 text-neutral-800 border border-neutral-300';
        break;
      case 'INTERMEDIATE':
        badgeStyle = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
        break;
      case 'WET':
        badgeStyle = 'bg-blue-100 text-blue-800 border border-blue-200';
        break;
    }
    return (
      <span className={`text-xs font-mono font-black px-3 py-1 rounded-full uppercase ${badgeStyle}`}>
        {compound}
      </span>
    );
  };

  return (
    <div className="telemetry-card p-6 bg-white border border-neutral-200 rounded-3xl shadow-sm space-y-5">
      {/* Driver Header with Real Headshot */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div className="flex items-center space-x-4">
          {/* Driver Portrait Photo or Initials Fallback */}
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm">
            {headshotUrl && !imageError ? (
              <img
                src={headshotUrl}
                alt={driverInfo.driver_name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center font-mono font-black text-white text-lg"
                style={{ backgroundColor: driverInfo.team_color || '#171717' }}
              >
                {driverInfo.driver}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-2xl font-black text-neutral-900 tracking-tight">
                {driverInfo.driver}
              </span>
              <span className="text-xs font-mono text-neutral-600 font-bold bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                #{driverInfo.driver_number || '—'}
              </span>
            </div>
            <h3 className="text-base font-black text-neutral-800">
              {driverInfo.driver_name}
            </h3>
            <span className="text-xs text-neutral-500 font-medium flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: driverInfo.team_color }} />
              <span>{driverInfo.team_name}</span>
            </span>
          </div>
        </div>

        <div className="text-right bg-red-50 border border-red-100 px-5 py-2.5 rounded-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#E10600] block">
            CURRENT POSITION
          </span>
          <span className="font-mono text-3xl font-black text-[#E10600]">
            {currentLapData?.position ? `P${currentLapData.position}` : '—'}
          </span>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Lap Time */}
        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
          <div className="flex items-center space-x-1.5 text-neutral-500 text-[10px] font-black uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5 text-[#E10600]" />
            <span>LAP TIME</span>
          </div>
          <div className="font-mono text-base font-black text-neutral-900">
            {formatLapTime(currentLapData?.lap_time)}
          </div>
        </div>

        {/* Tyre Compound */}
        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
          <div className="flex items-center space-x-1.5 text-neutral-500 text-[10px] font-black uppercase tracking-wider mb-1">
            <CircleDot className="w-3.5 h-3.5 text-amber-600" />
            <span>TYRE</span>
          </div>
          <div className="flex items-center pt-0.5">
            {getCompoundBadge(currentLapData?.compound || null)}
          </div>
        </div>

        {/* Tyre Age */}
        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
          <div className="flex items-center space-x-1.5 text-neutral-500 text-[10px] font-black uppercase tracking-wider mb-1">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>TYRE AGE</span>
          </div>
          <div className="font-mono text-base font-black text-neutral-900">
            {currentLapData?.tyre_age !== null && currentLapData?.tyre_age !== undefined
              ? `${currentLapData.tyre_age} laps`
              : '—'}
          </div>
        </div>

        {/* Pit Stops */}
        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
          <div className="flex items-center space-x-1.5 text-neutral-500 text-[10px] font-black uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>PIT STOPS</span>
          </div>
          <div className="font-mono text-base font-black text-neutral-900">
            {pitStopsCount}
          </div>
        </div>
      </div>
    </div>
  );
};
