import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import type { LapData } from '../types/race';
import { formatLapTime } from '../services/api';
import { TrendingUp } from 'lucide-react';

interface LapChartProps {
  driverCode: string;
  driverName: string;
  teamColor: string;
  laps: LapData[];
  currentLap: number;
}

export const LapChart: React.FC<LapChartProps> = ({
  driverCode,
  driverName,
  teamColor,
  laps,
  currentLap
}) => {
  const chartData = laps
    .filter((l) => l.driver === driverCode && l.lap_time !== null && l.lap_time > 0)
    .map((l) => ({
      lap: l.lap,
      lapTimeSec: l.lap_time,
      formattedTime: formatLapTime(l.lap_time),
      compound: l.compound || 'UNKNOWN',
      tyreAge: l.tyre_age !== null ? l.tyre_age : '—',
      position: l.position ? `P${l.position}` : '—',
      pitStop: l.pit_stop
    }));

  if (chartData.length === 0) {
    return (
      <div className="telemetry-card p-6 text-center text-neutral-400 font-mono text-xs">
        No lap time telemetry available for driver {driverCode}
      </div>
    );
  }

  const times = chartData.map((d) => d.lapTimeSec as number);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const padding = (maxTime - minTime) * 0.1 || 2;

  // Custom light floating card tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-neutral-200 p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 font-mono text-neutral-900 min-w-[170px]">
          <div className="font-extrabold text-[#E10600] flex items-center justify-between border-b border-neutral-100 pb-1">
            <span>LAP {data.lap}</span>
            <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded-md text-[10px]">{data.position}</span>
          </div>
          <div className="text-neutral-600">
            Lap Time: <span className="font-extrabold text-neutral-900">{data.formattedTime} ({data.lapTimeSec}s)</span>
          </div>
          <div className="text-neutral-500">
            Tyre: <span className="text-neutral-800 font-bold">{data.compound} ({data.tyreAge}L)</span>
          </div>
          {data.pitStop && (
            <div className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] text-center mt-1">
              PIT STOP LAP
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="telemetry-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-50 text-[#E10600] rounded-xl border border-red-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 uppercase tracking-tight">
              LAP PACE — {driverCode} ({driverName})
            </h2>
            <p className="text-xs text-neutral-500 font-medium">
              Lap time progression across the race
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamColor || '#E10600' }}></span>
          <span>PACE CURVE</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[290px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="lap"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              unit=" L"
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              domain={[Math.floor(minTime - padding), Math.ceil(maxTime + padding)]}
              tickFormatter={(val) => formatLapTime(val)}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Current lap vertical marker */}
            <ReferenceLine
              x={currentLap}
              stroke="#E10600"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: `Active L${currentLap}`,
                fill: '#E10600',
                fontSize: 10,
                fontWeight: 'bold',
                position: 'top'
              }}
            />

            <Line
              type="monotone"
              dataKey="lapTimeSec"
              stroke={teamColor || '#E10600'}
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: teamColor || '#E10600' }}
              activeDot={{ r: 6, fill: '#E10600', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
