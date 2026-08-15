import type {
  RaceSummary,
  RaceInfo,
  DriverInfo,
  LapData,
  DegradationPredictionRequest,
  DegradationPredictionResponse,
  LapTimePredictionRequest,
  LapTimePredictionResponse,
  PitSimulationRequest,
  PitSimulationResponse,
  ModelMetricsResponse,
  VisualizationDatasets,
  WhatIfComparisonRequest,
  WhatIfComparisonResponse,
  MonteCarloRequest,
  MonteCarloResponse,
  StrategyComparisonRequest,
  StrategyComparisonResponse,
  ButterflyEffectResponse
} from '../types/race';

const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchRaces(year: number): Promise<RaceSummary[]> {
  const response = await fetch(`${API_BASE_URL}/races/${year}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch races for season ${year}`);
  }
  return response.json();
}

export async function fetchRaceInfo(year: number, round: number): Promise<RaceInfo> {
  const response = await fetch(`${API_BASE_URL}/race/${year}/${round}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch race details for ${year} round ${round}`);
  }
  return response.json();
}

export async function fetchDrivers(year: number, round: number): Promise<DriverInfo[]> {
  const response = await fetch(`${API_BASE_URL}/race/${year}/${round}/drivers`);
  if (!response.ok) {
    throw new Error(`Failed to fetch drivers for ${year} round ${round}`);
  }
  return response.json();
}

export async function fetchLaps(year: number, round: number): Promise<LapData[]> {
  const response = await fetch(`${API_BASE_URL}/race/${year}/${round}/laps`);
  if (!response.ok) {
    throw new Error(`Failed to fetch lap data for ${year} round ${round}`);
  }
  return response.json();
}

// Step 3 ML API
export async function predictTireDegradation(
  req: DegradationPredictionRequest
): Promise<DegradationPredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/ml/degradation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!response.ok) {
    throw new Error('Failed to get tire degradation prediction');
  }
  return response.json();
}

// Step 4 ML API
export async function predictNextLapTime(
  req: LapTimePredictionRequest
): Promise<LapTimePredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/ml/lap-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!response.ok) {
    throw new Error('Failed to get next lap time prediction');
  }
  return response.json();
}

// Step 5 Simulation API
export async function simulatePitStop(
  req: PitSimulationRequest
): Promise<PitSimulationResponse> {
  const response = await fetch(`${API_BASE_URL}/ml/simulate-pit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!response.ok) {
    throw new Error('Failed to run pit stop simulation');
  }
  return response.json();
}

// Step 6: What-If Comparison API
export async function fetchWhatIfComparison(
  req: WhatIfComparisonRequest
): Promise<WhatIfComparisonResponse> {
  const response = await fetch(`${API_BASE_URL}/ml/whatif-comparison`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!response.ok) {
    throw new Error('Failed to get What-If comparison');
  }
  return response.json();
}

// Step 7: Monte Carlo Simulation API
export async function fetchMonteCarloSimulation(
  req: MonteCarloRequest
): Promise<MonteCarloResponse> {
  const response = await fetch(`${API_BASE_URL}/ml/monte-carlo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!response.ok) {
    throw new Error('Failed to run Monte Carlo simulation');
  }
  return response.json();
}

// Step 8: Strategy Comparison API
export async function fetchStrategyComparison(
  req: StrategyComparisonRequest
): Promise<StrategyComparisonResponse> {
  const response = await fetch(`${API_BASE_URL}/ml/strategy-comparison`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!response.ok) {
    throw new Error('Failed to compare strategies');
  }
  return response.json();
}

// Step 9: Butterfly Effect API
export async function fetchButterflyAnalysis(
  year: number,
  round: number,
  driver: string,
  compound: string = 'HARD'
): Promise<ButterflyEffectResponse> {
  const response = await fetch(`${API_BASE_URL}/ml/butterfly-effect/${year}/${round}/${driver}?compound=${compound}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Butterfly Effect analysis');
  }
  return response.json();
}

// Metrics API
export async function fetchModelMetrics(): Promise<ModelMetricsResponse> {
  const response = await fetch(`${API_BASE_URL}/ml/metrics`);
  if (!response.ok) {
    throw new Error('Failed to fetch model metrics');
  }
  return response.json();
}

// Visualizations API
export async function fetchVisualizationData(
  year: number,
  round: number
): Promise<VisualizationDatasets> {
  const response = await fetch(`${API_BASE_URL}/ml/visualizations/${year}/${round}`);
  if (!response.ok) {
    throw new Error('Failed to fetch visualization datasets');
  }
  return response.json();
}

export async function fetchWeatherData(
  year: number,
  round: number
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/race/${year}/${round}/weather`);
  if (!response.ok) {
    throw new Error('Failed to fetch session weather');
  }
  return response.json();
}

export async function fetchActualDriverStrategy(
  year: number,
  round: number,
  driver: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/race/${year}/${round}/strategy/${driver}`);
  if (!response.ok) {
    throw new Error('Failed to fetch actual driver strategy');
  }
  return response.json();
}

export async function fetchAdvancedMonteCarlo(
  req: any
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ml/monte-carlo-advanced`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!response.ok) {
    throw new Error('Failed to run Advanced Monte Carlo simulation');
  }
  return response.json();
}

export async function fetchRaceSnapshot(
  year: number,
  round: number,
  lap: number
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/race/${year}/${round}/snapshot/${lap}`);
  if (!response.ok) {
    throw new Error('Failed to fetch lap snapshot');
  }
  return response.json();
}

export async function fetchTimeMachineSimulation(
  req: any
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ml/race-time-machine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!response.ok) {
    throw new Error('Failed to run Race Time Machine simulation');
  }
  return response.json();
}

export async function fetchCircuitGeometry(
  year: number,
  round: number
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/race/${year}/${round}/circuit`);
  if (!response.ok) {
    throw new Error('Failed to fetch circuit geometry');
  }
  return response.json();
}

export async function fetchDriverHeadshots(): Promise<Record<string, string>> {
  const response = await fetch(`${API_BASE_URL}/drivers/headshots`);
  if (!response.ok) {
    throw new Error('Failed to fetch driver headshots');
  }
  return response.json();
}

export async function fetchGhostRaceSimulation(
  req: any
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/ml/ghost-race`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!response.ok) {
    throw new Error('Failed to run Ghost Race simulation');
  }
  return response.json();
}

export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) {
    return '—';
  }
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  const padSecs = parseFloat(secs) < 10 ? `0${secs}` : secs;
  return `${mins}:${padSecs}`;
}



