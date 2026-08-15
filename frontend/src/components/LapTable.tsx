import React, { useState, useMemo } from 'react';
import type { LapData, DriverInfo } from '../types/race';
import { formatLapTime } from '../services/api';
import { Search, Database, Filter } from 'lucide-react';

interface LapTableProps {
  laps: LapData[];
  drivers: DriverInfo[];
  selectedDriver: string | null;
  currentLap: number;
}

export const LapTable: React.FC<LapTableProps> = ({
  laps,
  drivers,
  selectedDriver,
  currentLap
}) => {
  const [driverFilter, setDriverFilter] = useState<string>(selectedDriver || 'ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  React.useEffect(() => {
    if (selectedDriver) {
      setDriverFilter(selectedDriver);
    }
  }, [selectedDriver]);

  const filteredLaps = useMemo(() => {
    return laps.filter((l) => {
      if (driverFilter !== 'ALL' && l.driver !== driverFilter) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesDriver = l.driver.toLowerCase().includes(query);
        const matchesName = l.driver_name.toLowerCase().includes(query);
        const matchesLap = l.lap.toString().includes(query);
        const matchesCompound = (l.compound || '').toLowerCase().includes(query);
        return matchesDriver || matchesName || matchesLap || matchesCompound;
      }
      return true;
    });
  }, [laps, driverFilter, searchTerm]);

  const getCompoundBadgeClass = (compound: string | null) => {
    if (!compound) return 'compound-unknown';
    switch (compound.toUpperCase()) {
      case 'SOFT':
        return 'compound-soft';
      case 'MEDIUM':
        return 'compound-medium';
      case 'HARD':
        return 'compound-hard';
      case 'INTERMEDIATE':
        return 'compound-intermediate';
      case 'WET':
        return 'compound-wet';
      default:
        return 'compound-unknown';
    }
  };

  return (
    <div className="telemetry-card p-6 space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-50 text-[#E10600] rounded-xl border border-red-100">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 uppercase tracking-tight">
              LAP DATA GRID
            </h2>
            <p className="text-xs text-neutral-500 font-medium">
              Detailed timing & telemetry records ({filteredLaps.length} rows)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Driver Selector */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs rounded-xl pl-8 pr-7 py-2 focus:outline-none focus:border-[#E10600] font-mono cursor-pointer font-semibold"
            >
              <option value="ALL">All Drivers</option>
              {drivers.map((d) => (
                <option key={d.driver} value={d.driver}>
                  {d.driver} — {d.driver_name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search driver, lap, tyre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-[#E10600] font-mono placeholder:text-neutral-400 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <div className="overflow-x-auto max-h-[400px] custom-scrollbar border border-neutral-200 rounded-2xl bg-white shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-50/90 sticky top-0 z-10 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
            <tr>
              <th className="py-3 px-4">Lap</th>
              <th className="py-3 px-4">Driver</th>
              <th className="py-3 px-4">Position</th>
              <th className="py-3 px-4">Lap Time</th>
              <th className="py-3 px-4">Compound</th>
              <th className="py-3 px-4">Tyre Age</th>
              <th className="py-3 px-4">Pit Stop</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-mono text-xs text-neutral-800">
            {filteredLaps.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-400">
                  No lap data matches filter criteria
                </td>
              </tr>
            ) : (
              filteredLaps.map((row, idx) => {
                const isActiveLap = row.lap === currentLap;
                return (
                  <tr
                    key={`${row.driver}-${row.lap}-${idx}`}
                    className={`transition-colors ${
                      isActiveLap
                        ? 'bg-red-50/80 font-bold text-neutral-900 border-l-4 border-l-[#E10600]'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-neutral-50/80'
                        : 'bg-neutral-50/30 hover:bg-neutral-50/80'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-extrabold text-neutral-500">
                      {row.lap}
                    </td>
                    <td className="py-2.5 px-4 font-black text-neutral-900">
                      {row.driver}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-neutral-700">
                      {row.position ? `P${row.position}` : '—'}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-neutral-900">
                      {formatLapTime(row.lap_time)}
                    </td>
                    <td className="py-2.5 px-4">
                      {row.compound ? (
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${getCompoundBadgeClass(
                            row.compound
                          )}`}
                        >
                          {row.compound}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-neutral-600">
                      {row.tyre_age !== null ? `${row.tyre_age}` : '—'}
                    </td>
                    <td className="py-2.5 px-4">
                      {row.pit_stop ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          PIT
                        </span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
