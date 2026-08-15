export interface RaceSummary {
  round: number;
  name: string;
}

export interface RaceInfo {
  season: number;
  race_name: string;
  circuit: string;
  country: string;
  date: string;
  total_laps: number;
}

export interface DriverInfo {
  driver: string;
  driver_number: string;
  driver_name: string;
  team_name: string;
  team_color: string;
  position: number | null;
  grid: number | null;
}

export interface LapData {
  lap: number;
  driver: string;
  driver_name: string;
  position: number | null;
  lap_time: number | null;
  compound: string | null;
  tyre_age: number | null;
  pit_stop: boolean;
}

export interface DriverStanding {
  position: number;
  driver: string;
  driver_name: string;
  team_name: string;
  team_color: string;
  lap_time: number | null;
  compound: string | null;
  tyre_age: number | null;
  pit_count: number;
  pit_stop: boolean;
}

export type ReplaySpeed = 1 | 2 | 5 | 10;

// Tire Degradation Types
export interface DegradationPredictionRequest {
  driver: string;
  compound: string;
  tyre_age: number;
  lap: number;
  circuit?: string;
}

export interface DegradationPredictionResponse {
  predicted_loss: number;
  unit: string;
  compound: string;
  tyre_age: number;
}

// Next Lap Time Prediction Types
export interface LapTimePredictionRequest {
  driver: string;
  circuit?: string;
  compound: string;
  tyre_age: number;
  lap: number;
  previous_lap_time: number;
}

export interface LapTimePredictionResponse {
  predicted_lap_time: number;
  unit: string;
  expected_change: number;
}

// Pit Stop Simulation Types
export interface PitSimulationRequest {
  season: number;
  round_num: number;
  driver: string;
  pit_lap: number;
  new_compound: string;
}

export interface SimulatedLap {
  lap: number;
  actual_time: number | null;
  simulated_time: number | null;
  actual_position: number;
  simulated_position: number;
}

export interface PitSimulationResponse {
  driver: string;
  pit_lap: number;
  old_compound: string;
  old_tyre_age: number;
  new_compound: string;
  pit_loss: number;
  old_position: string;
  predicted_position: string;
  predicted_finish: string;
  accumulated_time_delta: number;
  simulated_laps: SimulatedLap[];
}

// Model Performance Metrics Types
export interface ModelMetricValues {
  mae: number;
  rmse: number;
  r2: number;
}

export interface ModelMetricsResponse {
  tire_degradation: ModelMetricValues;
  next_lap_time: ModelMetricValues;
}

// Plotly Analytics Visualization Dataset Types
export interface VisualizationDatasets {
  circuit: string;
  tyre_ages: number[];
  compounds: string[];
  deg_curves: Record<string, number[]>;
  contour_z: number[][];
  top_drivers: string[];
  driver_deg_comp: Record<string, number[]>;
  surface_laps: number[];
  surface_ages: number[];
  surface_z: number[][];
  sample_laps: LapData[];
}

// What-If Comparison Types
export interface WhatIfComparisonRequest {
  season: number;
  round_num: number;
  driver: string;
  actual_pit_lap: number;
  actual_compound: string;
  whatif_pit_lap: number;
  whatif_compound: string;
}

export interface WhatIfTrajectoryPoint {
  lap: number;
  actual_position: number;
  whatif_position: number;
  actual_time: number | null;
  whatif_time: number | null;
  actual_compound: string;
  whatif_compound: string;
  actual_tyre_age: number;
  whatif_tyre_age: number;
}

export interface WhatIfStrategyDetail {
  pit_lap: number;
  compound: string;
  finish_position: string;
  race_time: string;
  total_delta_sec: number;
}

export interface WhatIfComparisonResponse {
  driver: string;
  actual_strategy: WhatIfStrategyDetail;
  whatif_strategy: WhatIfStrategyDetail;
  comparison: {
    position_gain: number;
    position_gain_text: string;
    time_gain_sec: number;
    time_gain_text: string;
  };
  trajectory: WhatIfTrajectoryPoint[];
}

// Monte Carlo Simulation Types
export interface MonteCarloRequest {
  season: number;
  round_num: number;
  driver: string;
  pit_lap: number;
  compound: string;
  num_simulations: number;
}

export interface MonteCarloResponse {
  driver: string;
  pit_lap: number;
  compound: string;
  num_simulations: number;
  probabilities: {
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    p5_plus: number;
  };
  position_distribution: Record<string, number>;
  expected_finish_position: number;
  median_finish_position: string;
  expected_race_time_sec: number;
  race_time_samples: number[];
  percentiles: {
    laps: number[];
    p10: number[];
    p50: number[];
    p90: number[];
  };
}

// Strategy Comparison Types
export interface StrategyDefinition {
  name: string;
  starting_compound?: string;
  pit_lap: number;
  compound: string;
}

export interface StrategyComparisonRequest {
  season: number;
  round_num: number;
  driver: string;
  strategies: StrategyDefinition[];
}

export interface RankedStrategy {
  id: string;
  name: string;
  starting_compound: string;
  pit_lap: number;
  new_compound: string;
  win_probability: number;
  podium_probability: number;
  expected_position: number;
  median_position: string;
  expected_race_time_sec: number;
  pit_loss_sec: number;
  stint_1_laps: number;
  stint_2_laps: number;
  rank: number;
  recommended: boolean;
}

export interface StrategyComparisonResponse {
  driver: string;
  recommended_strategy: RankedStrategy | null;
  ranked_strategies: RankedStrategy[];
  matrix: {
    strategies: string[];
    metrics: string[];
    z_values: number[][];
  };
}

// Butterfly Effect Types
export interface PitLapPoint {
  pit_lap: number;
  finish_position: string;
  finish_pos_num: number;
  win_probability: number;
  race_delta_sec: number;
  position_gain: number;
  time_gain: number;
}

export interface ButterflyEffectResponse {
  driver: string;
  selected_compound: string;
  pit_lap_range: [number, number];
  optimal_window: string;
  best_pit_lap: number;
  best_win_probability: number;
  best_finish: string;
  worst_finish: string;
  max_position_gain: string;
  max_time_gain: string;
  pit_lap_points: PitLapPoint[];
  compounds: string[];
  pit_laps: number[];
  surface_z: number[][];
}

export interface WeatherData {
  track_temp: number;
  air_temp: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  rainfall: boolean;
  track_status: string;
}

export interface ActualPitStop {
  pit_num: number;
  pit_lap: number;
  compound_before: string;
  compound_after: string;
  tyre_age_before: number;
  stint_length: number;
  pit_loss_sec: number;
}

export interface ActualStint {
  stint: number;
  compound: string;
  start_lap: number;
  end_lap: number;
  length: number;
}

export interface ActualDriverStrategy {
  driver: string;
  starting_compound: string;
  actual_finish: string;
  pit_stops: ActualPitStop[];
  stints: ActualStint[];
}

export interface AdvancedMonteCarloRequest {
  season: number;
  round_num: number;
  driver: string;
  pit_1_lap?: number;
  pit_1_compound?: string;
  pit_2_lap?: number;
  pit_2_compound?: string;
  num_simulations: number;
}

export interface PitLapSweepPoint {
  pit_lap: number;
  win_probability: number;
  podium_probability: number;
  expected_finish_position: number;
  expected_race_time_sec: number;
}

export interface FuelLapPoint {
  lap: number;
  estimated_fuel_kg: number;
  fuel_penalty_sec: number;
  predicted_pace_sec: number;
}

export interface AdvancedMonteCarloResponse {
  driver: string;
  actual_strategy: ActualDriverStrategy;
  weather: WeatherData & { temp_deg_factor: number };
  num_simulations: number;
  probabilities: {
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    p5_plus: number;
  };
  position_distribution: Record<string, number>;
  expected_finish_position: number;
  median_finish_position: string;
  expected_race_time_sec: number;
  optimal_pit: {
    pit_lap: number;
    compound: string;
    win_probability: number;
    podium_probability: number;
    expected_finish: string;
    expected_race_time_sec: number;
  };
  comparison: {
    actual_finish: string;
    optimal_finish: string;
    position_gain: string;
    position_gain_text: string;
    time_gain_sec: number;
    time_gain_text: string;
    win_gain_pct: string;
  };
  pit_lap_sweep: PitLapSweepPoint[];
  pit_lap_matrix: {
    compounds: string[];
    pit_laps: number[];
    z_values: number[][];
  };
  fuel_vs_lap_time: FuelLapPoint[];
}

export interface DriverSnapshot {
  driver: string;
  driver_name: string;
  team_name: string;
  team_color: string;
  position: number;
  gap_to_leader_sec: number;
  gap_text: string;
  compound: string;
  tyre_age: number;
  pits_made: number;
  last_lap_time: number;
}

export interface RaceSnapshot {
  season: number;
  round_num: number;
  race_name: string;
  circuit: string;
  current_lap: number;
  total_laps: number;
  estimated_fuel_kg: number;
  weather: WeatherData;
  drivers: DriverSnapshot[];
}

export interface TimeMachineRequest {
  season: number;
  round_num: number;
  driver: string;
  rewind_lap: number;
  decision: 'PIT_NOW' | 'STAY_OUT' | 'CHANGE_COMPOUND';
  new_compound?: string;
  num_simulations?: number;
}

export interface DecisionBreakdown {
  fresh_tyre_pace_gain_sec: number;
  degradation_reduction_sec: number;
  pit_loss_penalty_sec: number;
  recovered_pace_sec: number;
  net_time_gain_sec: number;
}

export interface TimeMachineTrajectoryPoint {
  lap: number;
  position: number;
  compound: string;
  tyre_age: number;
}

export interface TimeMachineResponse {
  driver: string;
  rewind_lap: number;
  total_laps: number;
  user_decision: string;
  selected_compound: string;
  snapshot_at_rewind: RaceSnapshot;
  actual_reality: {
    finish_position: string;
    win_probability: number;
    trajectory: TimeMachineTrajectoryPoint[];
  };
  alternate_reality: {
    finish_position: string;
    win_probability: number;
    trajectory: TimeMachineTrajectoryPoint[];
  };
  comparison: {
    position_gain: string;
    position_gain_text: string;
    time_gain_sec: number;
    time_gain_text: string;
    win_gain_pct: string;
  };
  decision_breakdown: DecisionBreakdown;
}

export interface CircuitPoint {
  x: number;
  y: number;
  progress: number;
}

export interface CircuitCorner {
  number: string;
  x: number;
  y: number;
}

export interface CircuitGeometryResponse {
  season: number;
  round_num: number;
  circuit_name: string;
  geometry_source?: string;
  rotation_deg?: number;
  points_count?: number;
  corners_count?: number;
  corners?: CircuitCorner[];
  points: CircuitPoint[];
}

export interface GhostRaceRequest {
  season: number;
  round_num: number;
  driver: string;
  pit_lap: number;
  compound: string;
}

export interface GhostContributorBreakdown {
  tyre_pace_gain_sec: number;
  fuel_effect_sec: number;
  pit_loss_sec: number;
  degradation_diff_sec: number;
  traffic_effect_sec: number;
  net_time_diff_sec: number;
}

export interface CascadingImpactDriver {
  driver: string;
  driver_name: string;
  team_name: string;
  team_color: string;
  actual_position: number;
  simulated_position: number;
  position_change: string;
}

export interface GhostRaceResponse {
  driver: string;
  pit_lap: number;
  compound: string;
  divergence_lap: number;
  total_laps: number;
  real_car: {
    finish_position: string;
    starting_compound: string;
  };
  ghost_car: {
    finish_position: string;
    new_compound: string;
    delta_sec: number;
    delta_text: string;
  };
  contributors: GhostContributorBreakdown;
  cascading_impact: CascadingImpactDriver[];
}




