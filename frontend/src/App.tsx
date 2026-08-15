import React, { useState, useEffect, useMemo } from 'react';
import type { RaceInfo, DriverInfo, LapData, DriverStanding, ReplaySpeed, PitSimulationResponse } from './types/race';
import { fetchRaceInfo, fetchDrivers, fetchLaps } from './services/api';
import { RaceHeader } from './components/RaceHeader';
import { RaceSelector } from './components/RaceSelector';
import { ReplayControls } from './components/ReplayControls';
import { DriverStandings } from './components/DriverStandings';
import { DriverCard } from './components/DriverCard';
import { CircuitTrackMap } from './components/CircuitTrackMap';
import { StintTimelineCard } from './components/StintTimelineCard';
import { GhostRaceCard } from './components/GhostRaceCard';
import { LapChart } from './components/LapChart';
import { LapTable } from './components/LapTable';
import { TireDegradationCard } from './components/TireDegradationCard';
import { NextLapPredictionCard } from './components/NextLapPredictionCard';
import { PitSimulatorCard } from './components/PitSimulatorCard';
import { ModelPerformanceCard } from './components/ModelPerformanceCard';
import { AdvancedAnalyticsPlotly } from './components/AdvancedAnalyticsPlotly';
import { WhatIfComparisonCard } from './components/WhatIfComparisonCard';
import { MonteCarloCard } from './components/MonteCarloCard';
import { RaceTimeMachineCard } from './components/RaceTimeMachineCard';
import { StrategyComparisonCard } from './components/StrategyComparisonCard';
import { ButterflyEffectCard } from './components/ButterflyEffectCard';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Compass, Sparkles, LayoutDashboard, Flag, Zap, Cpu, BarChart2, Clock } from 'lucide-react';

export const App: React.FC = () => {
  const [season, setSeason] = useState<number>(2024);
  const [round, setRound] = useState<number>(12); // Default: 2024 British GP (Round 12)
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [raceInfo, setRaceInfo] = useState<RaceInfo | null>(null);
  const [drivers, setDrivers] = useState<DriverInfo[]>([]);
  const [laps, setLaps] = useState<LapData[]>([]);

  const [currentLap, setCurrentLap] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [replaySpeed, setReplaySpeed] = useState<ReplaySpeed>(1);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<PitSimulationResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRaceData = async (targetSeason: number, targetRound: number) => {
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    try {
      const [info, driversList, lapsList] = await Promise.all([
        fetchRaceInfo(targetSeason, targetRound),
        fetchDrivers(targetSeason, targetRound),
        fetchLaps(targetSeason, targetRound)
      ]);

      setRaceInfo(info);
      setDrivers(driversList);
      setLaps(lapsList);
      setCurrentLap(1);

      const p1Driver = driversList.find((d) => d.position === 1);
      if (p1Driver) {
        setSelectedDriver(p1Driver.driver);
      } else if (driversList.length > 0) {
        setSelectedDriver(driversList[0].driver);
      }
    } catch (err: any) {
      console.error('Failed to load race session:', err);
      setError(err?.message || 'FastF1 could not retrieve this session.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRaceData(season, round);
  }, []);

  const handleSelectRace = (newSeason: number, newRound: number) => {
    setSeason(newSeason);
    setRound(newRound);
    loadRaceData(newSeason, newRound);
  };

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && raceInfo) {
      const intervalMs = Math.max(100, Math.floor(1200 / replaySpeed));
      interval = setInterval(() => {
        setCurrentLap((prevLap) => {
          if (prevLap >= raceInfo.total_laps) {
            setIsPlaying(false);
            return prevLap;
          }
          return prevLap + 1;
        });
      }, intervalMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, replaySpeed, raceInfo]);

  const standingsAtCurrentLap = useMemo(() => {
    if (!raceInfo || laps.length === 0) return [];

    const lapsUpToCurrent = laps.filter((l) => l.lap <= currentLap);
    const currentLapSnapshot = laps.filter((l) => l.lap === currentLap);

    const pitCounts: Record<string, number> = {};
    lapsUpToCurrent.forEach((l) => {
      if (l.pit_stop) {
        pitCounts[l.driver] = (pitCounts[l.driver] || 0) + 1;
      }
    });

    const driverMap = new Map<string, DriverInfo>();
    drivers.forEach((d) => driverMap.set(d.driver, d));

    const standingsList: DriverStanding[] = [];

    currentLapSnapshot.forEach((lapItem) => {
      const drvInfo = driverMap.get(lapItem.driver);
      standingsList.push({
        position: lapItem.position !== null ? lapItem.position : 99,
        driver: lapItem.driver,
        driver_name: lapItem.driver_name,
        team_name: drvInfo?.team_name || 'Unknown',
        team_color: drvInfo?.team_color || '#6B7280',
        lap_time: lapItem.lap_time,
        compound: lapItem.compound,
        tyre_age: lapItem.tyre_age,
        pit_count: pitCounts[lapItem.driver] || 0,
        pit_stop: lapItem.pit_stop
      });
    });

    standingsList.sort((a, b) => a.position - b.position);
    return standingsList;
  }, [laps, currentLap, drivers, raceInfo]);

  const selectedDriverInfo = useMemo(() => {
    if (!selectedDriver) return null;
    return drivers.find((d) => d.driver === selectedDriver) || null;
  }, [drivers, selectedDriver]);

  const selectedDriverCurrentLapData = useMemo(() => {
    if (!selectedDriver) return null;
    return (
      laps.find((l) => l.driver === selectedDriver && l.lap === currentLap) || null
    );
  }, [laps, selectedDriver, currentLap]);

  const selectedDriverPitCount = useMemo(() => {
    if (!selectedDriver) return 0;
    return laps.filter((l) => l.driver === selectedDriver && l.lap <= currentLap && l.pit_stop)
      .length;
  }, [laps, selectedDriver, currentLap]);

  const raceProgressPct = raceInfo ? Math.round((currentLap / raceInfo.total_laps) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-neutral-900 selection:bg-[#E10600] selection:text-white flex flex-col font-sans">
      {/* Top Header & App Branding */}
      <RaceHeader raceInfo={raceInfo} />

      {/* Main Tab Navigation Bar */}
      <nav className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto custom-scrollbar">
          <div className="flex space-x-1 py-2">
            {[
              { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
              { id: 'ghost_race', label: ' Ghost Race', icon: Sparkles },
              { id: 'replay_track', label: 'Circuit Telemetry', icon: Flag },
              { id: 'pit_simulator', label: 'Strategy Simulator', icon: Zap },
              { id: 'monte_carlo', label: 'Monte Carlo', icon: Cpu },
              { id: 'time_machine', label: 'Time Machine', icon: Clock },
              { id: 'analytics', label: 'Plotly Analytics', icon: BarChart2 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    isActive
                      ? 'bg-[#E10600] text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Race Selector */}
        <RaceSelector
          currentSeason={season}
          currentRound={round}
          onSelectRace={handleSelectRace}
          isLoading={isLoading}
        />

        {/* Loading State */}
        {isLoading && (
          <LoadingScreen statusMessage="Loading FastF1 telemetry & initializing ML models..." />
        )}

        {/* Error State */}
        {!isLoading && error && (
          <ErrorDisplay
            message={error}
            onRetry={() => loadRaceData(season, round)}
          />
        )}

        {/* Main Application Interface */}
        {!isLoading && !error && raceInfo && (
          <div className="space-y-6 animate-fadeIn">
            {/* Compact Race Status Overview Bar */}
            <div className="telemetry-card p-6 bg-white rounded-3xl border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#E10600]">
                  {raceInfo.season} FORMULA 1 WORLD CHAMPIONSHIP — ROUND {round}
                </span>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">
                  {raceInfo.race_name}
                </h2>
                <div className="flex items-center space-x-2 text-xs text-neutral-600 font-bold">
                  <Compass className="w-3.5 h-3.5 text-[#E10600]" />
                  <span>{raceInfo.circuit} ({raceInfo.country})</span>
                  <span>•</span>
                  <span>{raceInfo.date}</span>
                </div>
              </div>

              {/* Progress & Weather Badges */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-2xl text-center">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider block">CURRENT LAP</span>
                  <span className="text-base font-black text-neutral-900 font-mono">
                    {currentLap} / {raceInfo.total_laps} ({raceProgressPct}%)
                  </span>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-2xl text-center">
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider block">TRACK TEMP</span>
                  <span className="text-base font-black text-neutral-900 font-mono">34.0°C</span>
                </div>

                <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-2xl text-center">
                  <span className="text-[9px] font-black text-[#E10600] uppercase tracking-wider block">TRACK STATUS</span>
                  <span className="text-base font-black text-[#E10600] font-mono">DRY / GREEN</span>
                </div>
              </div>
            </div>

            {/* TAB 1: MAIN DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* TOP: SVG Circuit Map & Live Replay Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4">
                    <DriverStandings
                      standings={standingsAtCurrentLap}
                      selectedDriver={selectedDriver}
                      onSelectDriver={(code) => setSelectedDriver(code)}
                    />
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                    <CircuitTrackMap
                      season={season}
                      round={round}
                      standings={standingsAtCurrentLap}
                      selectedDriver={selectedDriver}
                      onSelectDriver={(code) => setSelectedDriver(code)}
                    />

                    <ReplayControls
                      currentLap={currentLap}
                      totalLaps={raceInfo.total_laps}
                      isPlaying={isPlaying}
                      replaySpeed={replaySpeed}
                      onLapChange={(lap) => setCurrentLap(lap)}
                      onTogglePlay={() => setIsPlaying(!isPlaying)}
                      onSpeedChange={(speed) => setReplaySpeed(speed)}
                    />

                    <DriverCard
                      driverInfo={selectedDriverInfo}
                      currentLapData={selectedDriverCurrentLapData}
                      pitStopsCount={selectedDriverPitCount}
                    />
                  </div>
                </div>

                {/* BELOW TRACK: Horizontal Tire Stint Strategy Timeline */}
                <StintTimelineCard
                  standings={standingsAtCurrentLap}
                  totalLaps={raceInfo.total_laps}
                  selectedDriver={selectedDriver}
                  onSelectDriver={(code) => setSelectedDriver(code)}
                />

                {/* BELOW TRACK: Lap Time Pace Comparison & Tire Degradation Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Lap Time Pace Comparison */}
                  {selectedDriver && (
                    <LapChart
                      driverCode={selectedDriver}
                      driverName={selectedDriverInfo?.driver_name || selectedDriver}
                      teamColor={selectedDriverInfo?.team_color || '#E10600'}
                      laps={laps}
                      currentLap={currentLap}
                    />
                  )}

                  {/* ML Tire Degradation Card */}
                  <TireDegradationCard
                    drivers={drivers}
                    selectedDriver={selectedDriver}
                    currentLap={currentLap}
                    circuit={raceInfo.circuit}
                  />
                </div>

                {/* NEXT LAP PREDICTION CARD */}
                <NextLapPredictionCard
                  drivers={drivers}
                  selectedDriver={selectedDriver}
                  currentLapData={selectedDriverCurrentLapData}
                  currentLap={currentLap}
                  circuit={raceInfo.circuit}
                />
              </div>
            )}

            {/* TAB 2:  GHOST RACE SIGNATURE FEATURE */}
            {activeTab === 'ghost_race' && selectedDriver && (
              <GhostRaceCard
                season={season}
                round={round}
                driver={selectedDriver}
                standings={standingsAtCurrentLap}
                onSelectDriver={(code) => setSelectedDriver(code)}
              />
            )}

            {/* TAB 3: CIRCUIT TELEMETRY & REPLAY */}
            {activeTab === 'replay_track' && (
              <div className="space-y-6">
                <CircuitTrackMap
                  season={season}
                  round={round}
                  standings={standingsAtCurrentLap}
                  selectedDriver={selectedDriver}
                  onSelectDriver={(code) => setSelectedDriver(code)}
                />
                <ReplayControls
                  currentLap={currentLap}
                  totalLaps={raceInfo.total_laps}
                  isPlaying={isPlaying}
                  replaySpeed={replaySpeed}
                  onLapChange={(lap) => setCurrentLap(lap)}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  onSpeedChange={(speed) => setReplaySpeed(speed)}
                />
                {selectedDriver && (
                  <LapChart
                    driverCode={selectedDriver}
                    driverName={selectedDriverInfo?.driver_name || selectedDriver}
                    teamColor={selectedDriverInfo?.team_color || '#E10600'}
                    laps={laps}
                    currentLap={currentLap}
                  />
                )}
              </div>
            )}

            {/* TAB 4: STRATEGY SIMULATOR & WHAT-IF */}
            {activeTab === 'pit_simulator' && (
              <div className="space-y-6">
                <PitSimulatorCard
                  season={season}
                  round={round}
                  drivers={drivers}
                  selectedDriver={selectedDriver}
                  currentLap={currentLap}
                  totalLaps={raceInfo.total_laps}
                  onSimulationComplete={(res) => setSimResult(res)}
                />

                <WhatIfComparisonCard
                  season={season}
                  round={round}
                  drivers={drivers}
                  selectedDriver={selectedDriver}
                  currentLap={currentLap}
                  totalLaps={raceInfo.total_laps}
                />

                <StrategyComparisonCard
                  season={season}
                  round={round}
                  drivers={drivers}
                  selectedDriver={selectedDriver}
                  totalLaps={raceInfo.total_laps}
                />
              </div>
            )}

            {/* TAB 5: MONTE CARLO ENGINE */}
            {activeTab === 'monte_carlo' && (
              <div className="space-y-6">
                <MonteCarloCard
                  season={season}
                  round={round}
                  drivers={drivers}
                  selectedDriver={selectedDriver}
                  currentLap={currentLap}
                />

                <ButterflyEffectCard
                  season={season}
                  round={round}
                  drivers={drivers}
                  selectedDriver={selectedDriver}
                  totalLaps={raceInfo.total_laps}
                />
              </div>
            )}

            {/* TAB 6: RACE TIME MACHINE */}
            {activeTab === 'time_machine' && (
              <RaceTimeMachineCard
                season={season}
                round={round}
                drivers={drivers}
                selectedDriver={selectedDriver}
                totalLaps={raceInfo.total_laps}
              />
            )}

            {/* TAB 7: ADVANCED PLOTLY ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <ModelPerformanceCard />
                <AdvancedAnalyticsPlotly
                  season={season}
                  round={round}
                  simResult={simResult}
                />
                <LapTable
                  laps={laps}
                  drivers={drivers}
                  selectedDriver={selectedDriver}
                  currentLap={currentLap}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-5 px-6 text-center text-xs font-mono text-neutral-500">
        F1 RACE LAB — Premium Modern F1 Motorsport Analytics & ML Strategy Engine
      </footer>
    </div>
  );
};

export default App;
