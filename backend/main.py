from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from services.fastf1_service import fastf1_service
from services.ml_service import ml_service

app = FastAPI(title="F1 RACE LAB API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for ML Requests
class DegradationRequest(BaseModel):
    driver: str = Field(..., example="VER")
    compound: str = Field(..., example="MEDIUM")
    tyre_age: int = Field(..., example=15, ge=0, le=70)
    lap: int = Field(..., example=20, ge=1, le=100)
    circuit: Optional[str] = Field("Silverstone", example="Silverstone")

class LapTimeRequest(BaseModel):
    driver: str = Field(..., example="VER")
    circuit: Optional[str] = Field("Silverstone", example="Silverstone")
    compound: str = Field(..., example="MEDIUM")
    tyre_age: int = Field(..., example=20, ge=0, le=70)
    lap: int = Field(..., example=20, ge=1, le=100)
    previous_lap_time: float = Field(..., example=91.5, gt=0)

class PitSimulationRequest(BaseModel):
    season: int = Field(2024, example=2024)
    round_num: int = Field(12, example=12)
    driver: str = Field(..., example="VER")
    pit_lap: int = Field(..., example=38, ge=1, le=100)
    new_compound: str = Field(..., example="HARD")

class WhatIfComparisonRequest(BaseModel):
    season: int = Field(2024, example=2024)
    round_num: int = Field(12, example=12)
    driver: str = Field(..., example="VER")
    actual_pit_lap: int = Field(42, example=42)
    actual_compound: str = Field("HARD", example="HARD")
    whatif_pit_lap: int = Field(38, example=38)
    whatif_compound: str = Field("HARD", example="HARD")

class MonteCarloRequest(BaseModel):
    season: int = Field(2024, example=2024)
    round_num: int = Field(12, example=12)
    driver: str = Field(..., example="VER")
    pit_lap: int = Field(38, example=38)
    compound: str = Field("HARD", example="HARD")
    num_simulations: int = Field(5000, example=5000, ge=100, le=10000)

class StrategyDefinition(BaseModel):
    name: str = Field(..., example="Strategy A")
    starting_compound: str = Field("MEDIUM", example="MEDIUM")
    pit_lap: int = Field(38, example=38)
    compound: str = Field("HARD", example="HARD")

class StrategyComparisonRequest(BaseModel):
    season: int = Field(2024, example=2024)
    round_num: int = Field(12, example=12)
    driver: str = Field(..., example="VER")
    strategies: list[StrategyDefinition]

@app.get("/")
def read_root():
    return {"name": "F1 RACE LAB API", "status": "online", "ml_engine": "active"}

@app.get("/api/races/{year}")
def get_races(
    year: int = Path(..., description="Season year", ge=1950, le=2026)
):
    try:
        races = fastf1_service.get_races(year)
        if not races:
            raise HTTPException(status_code=404, detail=f"No races found for season {year}")
        return races
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to load races for {year}: {str(e)}")

@app.get("/api/race/{year}/{round_num}")
def get_race_details(
    year: int = Path(..., ge=1950, le=2026),
    round_num: int = Path(..., alias="round_num", ge=1, le=30)
):
    try:
        return fastf1_service.get_race_details(year, round_num)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to load race details: {str(e)}")

@app.get("/api/race/{year}/{round_num}/drivers")
def get_race_drivers(
    year: int = Path(..., ge=1950, le=2026),
    round_num: int = Path(..., alias="round_num", ge=1, le=30)
):
    try:
        return fastf1_service.get_drivers(year, round_num)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to load drivers: {str(e)}")

@app.get("/api/race/{year}/{round_num}/laps")
def get_race_laps(
    year: int = Path(..., ge=1950, le=2026),
    round_num: int = Path(..., alias="round_num", ge=1, le=30)
):
    try:
        return fastf1_service.get_laps(year, round_num)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to load lap data: {str(e)}")

# ML Endpoints (Steps 3, 4, 5)
@app.post("/api/ml/degradation")
def predict_tire_degradation(req: DegradationRequest):
    try:
        return ml_service.predict_degradation(
            driver=req.driver,
            compound=req.compound,
            tyre_age=req.tyre_age,
            lap=req.lap,
            circuit=req.circuit or "Silverstone"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tire degradation prediction failed: {str(e)}")

@app.post("/api/ml/lap-time")
def predict_next_lap_time(req: LapTimeRequest):
    try:
        return ml_service.predict_next_lap_time(
            driver=req.driver,
            circuit=req.circuit or "Silverstone",
            compound=req.compound,
            tyre_age=req.tyre_age,
            lap=req.lap,
            previous_lap_time=req.previous_lap_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Next lap time prediction failed: {str(e)}")

@app.post("/api/ml/simulate-pit")
def simulate_pit_stop(req: PitSimulationRequest):
    try:
        return ml_service.simulate_pit_stop(
            year=req.season,
            round_num=req.round_num,
            driver=req.driver,
            pit_lap=req.pit_lap,
            new_compound=req.new_compound
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pit stop simulation failed: {str(e)}")

# Advanced Analytics Endpoints (Steps 6, 7, 8, 9)
@app.post("/api/ml/whatif-comparison")
def compare_actual_vs_whatif(req: WhatIfComparisonRequest):
    try:
        return ml_service.compare_actual_vs_whatif(
            year=req.season,
            round_num=req.round_num,
            driver=req.driver,
            actual_pit_lap=req.actual_pit_lap,
            actual_compound=req.actual_compound,
            whatif_pit_lap=req.whatif_pit_lap,
            whatif_compound=req.whatif_compound
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"What-If comparison failed: {str(e)}")

class AdvancedMonteCarloRequest(BaseModel):
    season: int = Field(2024, example=2024)
    round_num: int = Field(12, example=12)
    driver: str = Field(..., example="VER")
    pit_1_lap: Optional[int] = Field(None, example=18)
    pit_1_compound: Optional[str] = Field(None, example="HARD")
    pit_2_lap: Optional[int] = Field(None, example=42)
    pit_2_compound: Optional[str] = Field(None, example="SOFT")
    num_simulations: int = Field(5000, example=5000, ge=100, le=10000)

@app.get("/api/race/{year}/{round_num}/weather")
def get_session_weather(
    year: int = Path(..., ge=1950, le=2026),
    round_num: int = Path(..., alias="round_num", ge=1, le=30)
):
    try:
        return fastf1_service.get_weather_data(year, round_num)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to load weather data: {str(e)}")

@app.get("/api/race/{year}/{round_num}/strategy/{driver}")
def get_actual_driver_strategy(
    year: int = Path(..., ge=1950, le=2026),
    round_num: int = Path(..., alias="round_num", ge=1, le=30),
    driver: str = Path(..., description="Driver code e.g. VER")
):
    try:
        return fastf1_service.get_actual_driver_strategy(year, round_num, driver)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to load driver strategy: {str(e)}")

@app.post("/api/ml/monte-carlo-advanced")
def run_advanced_monte_carlo_simulation(req: AdvancedMonteCarloRequest):
    try:
        return ml_service.run_advanced_monte_carlo(
            year=req.season,
            round_num=req.round_num,
            driver=req.driver,
            pit_1_lap=req.pit_1_lap,
            pit_1_compound=req.pit_1_compound,
            pit_2_lap=req.pit_2_lap,
            pit_2_compound=req.pit_2_compound,
            num_simulations=req.num_simulations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced Monte Carlo simulation failed: {str(e)}")


@app.post("/api/ml/strategy-comparison")
def compare_multiple_strategies(req: StrategyComparisonRequest):
    try:
        return ml_service.compare_strategies(
            year=req.season,
            round_num=req.round_num,
            driver=req.driver,
            strategies=[s.dict() for s in req.strategies]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Strategy comparison failed: {str(e)}")

@app.get("/api/ml/butterfly-effect/{year}/{round_num}/{driver}")
def run_butterfly_effect_analysis(
    year: int = Path(..., ge=1950, le=2026),
    round_num: int = Path(..., alias="round_num", ge=1, le=30),
    driver: str = Path(..., description="Driver code e.g. VER"),
    compound: Optional[str] = "HARD"
):
    try:
        return ml_service.run_butterfly_analysis(
            year=year,
            round_num=round_num,
            driver=driver,
            start_lap=30,
            end_lap=50,
            selected_compound=compound or "HARD"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Butterfly effect analysis failed: {str(e)}")

class TimeMachineRequest(BaseModel):
    season: int = Field(2024, example=2024)
    round_num: int = Field(12, example=12)
    driver: str = Field(..., example="VER")
    rewind_lap: int = Field(53, example=53, ge=1, le=100)
    decision: str = Field("PIT_NOW", example="PIT_NOW")
    new_compound: Optional[str] = Field("SOFT", example="SOFT")
    num_simulations: int = Field(5000, example=5000, ge=100, le=10000)

@app.get("/api/race/{year}/{round_num}/snapshot/{lap_num}")
def get_lap_snapshot(
    year: int = Path(..., ge=1950, le=2026),
    round_num: int = Path(..., alias="round_num", ge=1, le=30),
    lap_num: int = Path(..., ge=1, le=100)
):
    try:
        return fastf1_service.get_lap_snapshot(year, round_num, lap_num)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to load lap snapshot: {str(e)}")

@app.post("/api/ml/race-time-machine")
def run_race_time_machine(req: TimeMachineRequest):
    try:
        return ml_service.run_time_machine_simulation(
            year=req.season,
            round_num=req.round_num,
            driver=req.driver,
            rewind_lap=req.rewind_lap,
            decision=req.decision,
            new_compound=req.new_compound,
            num_simulations=req.num_simulations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Race Time Machine simulation failed: {str(e)}")

class GhostRaceRequest(BaseModel):
    season: int = Field(2024, example=2024)
    round_num: int = Field(12, example=12)
    driver: str = Field(..., example="VER")
    pit_lap: int = Field(38, example=38)
    compound: str = Field("HARD", example="HARD")

@app.get("/api/race/{year}/{round_num}/circuit")
def get_circuit_geometry(
    year: int = Path(..., ge=1950, le=2026),
    round_num: int = Path(..., alias="round_num", ge=1, le=30)
):
    try:
        return fastf1_service.get_circuit_geometry(year, round_num)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to load circuit geometry: {str(e)}")

@app.get("/api/drivers/headshots")
def get_driver_headshots():
    try:
        return fastf1_service.get_driver_headshots()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to load driver headshots: {str(e)}")

@app.post("/api/ml/ghost-race")
def run_ghost_race_simulation(req: GhostRaceRequest):
    try:
        return ml_service.run_ghost_race_simulation(
            year=req.season,
            round_num=req.round_num,
            driver=req.driver,
            pit_lap=req.pit_lap,
            compound=req.compound
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ghost Race simulation failed: {str(e)}")

@app.get("/api/ml/metrics")
def get_model_metrics():
    try:
        return ml_service.get_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch model metrics: {str(e)}")

@app.get("/api/ml/visualizations/{year}/{round_num}")
def get_visualization_datasets(
    year: int = Path(..., ge=1950, le=2026),
    round_num: int = Path(..., alias="round_num", ge=1, le=30)
):
    try:
        return ml_service.get_visualization_data(year, round_num)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load visualization datasets: {str(e)}")



