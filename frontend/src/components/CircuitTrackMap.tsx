import React, { useEffect, useState } from 'react';
import type { CircuitGeometryResponse, CircuitPoint, DriverStanding } from '../types/race';
import { fetchCircuitGeometry, formatLapTime } from '../services/api';
import { Compass, CheckCircle, Loader2 } from 'lucide-react';

interface CircuitTrackMapProps {
  season: number;
  round: number;
  standings: DriverStanding[];
  selectedDriver: string | null;
  onSelectDriver: (driver: string) => void;
  ghostDriver?: {
    driver: string;
    position: number;
    team_color: string;
    label?: string;
  } | null;
}

export const CircuitTrackMap: React.FC<CircuitTrackMapProps> = ({
  season,
  round,
  standings,
  selectedDriver,
  onSelectDriver,
  ghostDriver
}) => {
  const [circuitData, setCircuitData] = useState<CircuitGeometryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAllDrivers, setShowAllDrivers] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showPositions, setShowPositions] = useState<boolean>(true);
  const [showTires, setShowTires] = useState<boolean>(true);
  const [showRacingLine, setShowRacingLine] = useState<boolean>(true);
  const [showCorners, setShowCorners] = useState<boolean>(true);
  const [showDebug, setShowDebug] = useState<boolean>(true);
  const [hoveredDriver, setHoveredDriver] = useState<DriverStanding | null>(null);

  useEffect(() => {
    const loadCircuit = async () => {
      setLoading(true);
      try {
        const data = await fetchCircuitGeometry(season, round);
        setCircuitData(data);
      } catch (err) {
        console.error('Failed to fetch circuit geometry:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCircuit();
  }, [season, round]);

  const points: CircuitPoint[] = circuitData?.points || [];
  const corners = circuitData?.corners || [];

  // Construct SVG path ONLY from actual FastF1 telemetry points
  const pathString = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
    : '';

  // Standardized compound colors
  const getCompoundColor = (cmp: string | null) => {
    if (!cmp) return '#6B7280';
    switch (cmp.toUpperCase()) {
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

  // Helper to interpolate driver position along exact FastF1 geometry points
  const getPositionOnTrack = (positionRank: number, totalDrivers: number) => {
    if (points.length === 0) return { x: 500, y: 300 };
    const maxIdx = points.length - 1;
    const frac = ((positionRank - 1) / Math.max(1, totalDrivers)) % 1.0;
    const ptIdx = Math.min(maxIdx, Math.floor(frac * maxIdx));
    return points[ptIdx] || { x: 500, y: 300 };
  };

  const displayedStandings = showAllDrivers ? standings : standings.slice(0, 5);

  return (
    <div className="telemetry-card p-6 bg-white border border-neutral-200 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-[#E10600]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#E10600]">
              REAL FASTF1 TELEMETRY CIRCUIT GEOMETRY
            </span>
          </div>
          <h3 className="text-xl font-black text-neutral-900 tracking-tight">
            {circuitData?.circuit_name || 'Official FastF1 Circuit Map'}
          </h3>
        </div>

        {/* Interactive Track View Toggles */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200 text-xs font-bold font-mono">
          <button
            onClick={() => setShowAllDrivers(!showAllDrivers)}
            className={`px-2.5 py-1 rounded-xl transition-all ${showAllDrivers ? 'bg-[#E10600] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            {showAllDrivers ? 'FULL FIELD' : 'TOP 5'}
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2.5 py-1 rounded-xl transition-all ${showLabels ? 'bg-[#E10600] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            LABELS
          </button>
          <button
            onClick={() => setShowPositions(!showPositions)}
            className={`px-2.5 py-1 rounded-xl transition-all ${showPositions ? 'bg-[#E10600] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            POSITIONS
          </button>
          <button
            onClick={() => setShowTires(!showTires)}
            className={`px-2.5 py-1 rounded-xl transition-all ${showTires ? 'bg-[#E10600] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            TIRES
          </button>
          <button
            onClick={() => setShowCorners(!showCorners)}
            className={`px-2.5 py-1 rounded-xl transition-all ${showCorners ? 'bg-[#E10600] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            CORNERS
          </button>
          <button
            onClick={() => setShowRacingLine(!showRacingLine)}
            className={`px-2.5 py-1 rounded-xl transition-all ${showRacingLine ? 'bg-[#E10600] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            RACING LINE
          </button>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`px-2.5 py-1 rounded-xl transition-all ${showDebug ? 'bg-neutral-800 text-white' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            DEBUG STATS
          </button>
        </div>
      </div>

      {/* Circuit Geometry Validation & Debug Readout Panel */}
      {showDebug && circuitData && (
        <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-neutral-300">Selected Circuit:</span>
            <span className="font-black text-amber-400 uppercase">{circuitData.circuit_name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div><span className="text-neutral-400">Geometry Source:</span> <span className="font-black text-emerald-400">{circuitData.geometry_source || 'FastF1 Telemetry'}</span></div>
            <div><span className="text-neutral-400">Rotation:</span> <span className="font-black text-emerald-400">{circuitData.rotation_deg ?? 0}°</span></div>
            <div><span className="text-neutral-400">Telemetry Points:</span> <span className="font-black text-emerald-400">{points.length}</span></div>
            <div><span className="text-neutral-400">Corners Identified:</span> <span className="font-black text-emerald-400">{corners.length}</span></div>
          </div>
        </div>
      )}

      {/* Modern Light Motorsport Canvas */}
      <div className="w-full h-[440px] bg-slate-950 rounded-2xl relative p-4 flex items-center justify-center border border-slate-800 shadow-inner">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-3 text-slate-400 font-mono">
            <Loader2 className="w-8 h-8 animate-spin text-[#E10600]" />
            <span>Loading Real FastF1 Circuit Geometry...</span>
          </div>
        ) : points.length === 0 ? (
          <div className="text-slate-400 font-mono text-xs">No circuit telemetry available for this session.</div>
        ) : (
          <svg viewBox="0 0 1000 600" className="w-full h-full object-contain">
            <defs>
              <linearGradient id="ghostGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#E10600" stopOpacity="0.9" />
              </linearGradient>
              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Track Outer Curbs */}
            <path
              d={pathString}
              fill="none"
              stroke="#334155"
              strokeWidth="28"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Main Asphalt Surface */}
            <path
              d={pathString}
              fill="none"
              stroke="#1E293B"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Center Racing Line (If enabled) */}
            {showRacingLine && (
              <path
                d={pathString}
                fill="none"
                stroke="#64748B"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
            )}

            {/* Start / Finish Line Indicator */}
            {points.length > 0 && (
              <g>
                <line
                  x1={points[0].x - 14}
                  y1={points[0].y}
                  x2={points[0].x + 14}
                  y2={points[0].y}
                  stroke="#E10600"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <text
                  x={points[0].x}
                  y={points[0].y - 12}
                  fill="#EF4444"
                  fontSize="9"
                  fontWeight="900"
                  textAnchor="middle"
                  className="font-mono uppercase tracking-widest"
                >
                  START / FINISH
                </text>
              </g>
            )}

            {/* Corner Apex Badges (T1, T2, T3...) */}
            {showCorners && corners.map((c) => (
              <g key={`corner-${c.number}`}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="7"
                  fill="#0F172A"
                  stroke="#E2E8F0"
                  strokeWidth="1.2"
                />
                <text
                  x={c.x}
                  y={c.y + 2.5}
                  fill="#F8FAFC"
                  fontSize="7"
                  fontWeight="900"
                  textAnchor="middle"
                  className="font-mono pointer-events-none"
                >
                  {c.number}
                </text>
              </g>
            ))}

            {/* Drivers Telemetry Markers & Prominent Driver Labels */}
            {displayedStandings.map((d, idx) => {
              const pt = getPositionOnTrack(d.position, standings.length);
              const isSelected = selectedDriver === d.driver;
              const cmpColor = getCompoundColor(d.compound);

              // Offset alternating labels to avoid overlapping close drivers
              const labelOffsetY = idx % 2 === 0 ? -24 : 30;

              return (
                <g
                  key={d.driver}
                  onClick={() => onSelectDriver(d.driver)}
                  onMouseEnter={() => setHoveredDriver(d)}
                  onMouseLeave={() => setHoveredDriver(null)}
                  className="cursor-pointer transition-all duration-300 hover:scale-125"
                  style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                >
                  {/* Selected Pulsating Ring */}
                  {isSelected && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="22"
                      fill="none"
                      stroke="#E10600"
                      strokeWidth="3"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Team Color Outer Ring */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="14"
                    fill={d.team_color || '#6B7280'}
                    stroke={isSelected ? '#FFFFFF' : '#0F172A'}
                    strokeWidth="2.5"
                  />

                  {/* Inner Marker Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="9"
                    fill="#0F172A"
                  />

                  {/* Standardized Compound Dot (If enabled) */}
                  {showTires && (
                    <circle
                      cx={pt.x - 11}
                      cy={pt.y - 11}
                      r="4.5"
                      fill={cmpColor}
                      stroke="#FFFFFF"
                      strokeWidth="1"
                    />
                  )}

                  {/* PROMINENT BOLD DRIVER LABEL (e.g. NOR, VER, LEC, HAM) */}
                  {showLabels && (
                    <g>
                      <rect
                        x={pt.x - 24}
                        y={pt.y + labelOffsetY - 12}
                        width="48"
                        height="22"
                        rx="6"
                        fill={isSelected ? '#E10600' : '#0F172A'}
                        stroke={d.team_color || '#FFFFFF'}
                        strokeWidth="1.8"
                        filter="url(#glowEffect)"
                      />
                      <text
                        x={pt.x}
                        y={pt.y + labelOffsetY + 4}
                        fill="#FFFFFF"
                        fontSize="13"
                        fontWeight="900"
                        textAnchor="middle"
                        className="font-mono uppercase tracking-wider pointer-events-none"
                      >
                        {d.driver}
                      </text>
                    </g>
                  )}

                  {/* Small Position Pill (If enabled) */}
                  {showPositions && (
                    <g>
                      <rect
                        x={pt.x + 12}
                        y={pt.y - 14}
                        width="20"
                        height="12"
                        rx="3"
                        fill="#1E293B"
                        stroke="#FFFFFF"
                        strokeWidth="0.8"
                      />
                      <text
                        x={pt.x + 22}
                        y={pt.y - 5}
                        fill="#FFFFFF"
                        fontSize="8"
                        fontWeight="900"
                        textAnchor="middle"
                        className="font-mono"
                      >
                        P{d.position}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* ⭐ GHOST CAR MARKER */}
            {ghostDriver && (
              <g className="transition-all duration-500 animate-pulse">
                {(() => {
                  const ghostPt = getPositionOnTrack(ghostDriver.position, standings.length);
                  return (
                    <g style={{ transformOrigin: `${ghostPt.x}px ${ghostPt.y}px` }}>
                      <circle
                        cx={ghostPt.x}
                        cy={ghostPt.y}
                        r="20"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                      />
                      <circle
                        cx={ghostPt.x}
                        cy={ghostPt.y}
                        r="14"
                        fill="url(#ghostGrad)"
                      />
                      <text
                        x={ghostPt.x}
                        y={ghostPt.y + 3.5}
                        fill="#FFFFFF"
                        fontSize="8"
                        fontWeight="900"
                        textAnchor="middle"
                        className="font-mono"
                      >
                        GHOST
                      </text>
                    </g>
                  );
                })()}
              </g>
            )}
          </svg>
        )}

        {/* Hover Telemetry Tooltip */}
        {hoveredDriver && (
          <div className="absolute top-4 right-4 bg-slate-950/90 text-white p-3.5 rounded-2xl border border-slate-700 shadow-xl space-y-1.5 text-xs font-mono pointer-events-none animate-fadeIn">
            <div className="font-black text-sm text-[#E10600] flex items-center justify-between border-b border-slate-800 pb-1">
              <span>{hoveredDriver.driver} — P{hoveredDriver.position}</span>
              <span className="text-[10px] text-neutral-400 font-medium">{hoveredDriver.team_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div><span className="text-neutral-400">Lap Time:</span> <span className="font-bold">{formatLapTime(hoveredDriver.lap_time)}</span></div>
              <div><span className="text-neutral-400">Tyre:</span> <span className="font-bold">{hoveredDriver.compound || 'MEDIUM'} ({hoveredDriver.tyre_age || 10}L)</span></div>
              <div><span className="text-neutral-400">Pit Stops:</span> <span className="font-bold">{hoveredDriver.pit_count}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
