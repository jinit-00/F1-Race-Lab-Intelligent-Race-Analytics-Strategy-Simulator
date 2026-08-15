import os
import fastf1
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional

class FastF1Service:
    def __init__(self, cache_dir: Optional[str] = None):
        if cache_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            cache_dir = os.path.join(base_dir, "cache")
        os.makedirs(cache_dir, exist_ok=True)
        fastf1.Cache.enable_cache(cache_dir)
        self._session_cache: Dict[str, Any] = {}

    def get_races(self, year: int) -> List[Dict[str, Any]]:
        # Hardcoded 2024 F1 Calendar fallback to ensure 0ms instant response without Ergast API network delay
        FALLBACK_2024_RACES = [
            {"round": 1, "name": "Bahrain Grand Prix"},
            {"round": 2, "name": "Saudi Arabian Grand Prix"},
            {"round": 3, "name": "Australian Grand Prix"},
            {"round": 4, "name": "Japanese Grand Prix"},
            {"round": 5, "name": "Chinese Grand Prix"},
            {"round": 6, "name": "Miami Grand Prix"},
            {"round": 7, "name": "Emilia Romagna Grand Prix"},
            {"round": 8, "name": "Monaco Grand Prix"},
            {"round": 9, "name": "Canadian Grand Prix"},
            {"round": 10, "name": "Spanish Grand Prix"},
            {"round": 11, "name": "Austrian Grand Prix"},
            {"round": 12, "name": "British Grand Prix"},
            {"round": 13, "name": "Hungarian Grand Prix"},
            {"round": 14, "name": "Belgian Grand Prix"},
            {"round": 15, "name": "Dutch Grand Prix"},
            {"round": 16, "name": "Italian Grand Prix"},
            {"round": 17, "name": "Azerbaijan Grand Prix"},
            {"round": 18, "name": "Singapore Grand Prix"},
            {"round": 19, "name": "United States Grand Prix"},
            {"round": 20, "name": "Mexico City Grand Prix"},
            {"round": 21, "name": "São Paulo Grand Prix"},
            {"round": 22, "name": "Las Vegas Grand Prix"},
            {"round": 23, "name": "Qatar Grand Prix"},
            {"round": 24, "name": "Abu Dhabi Grand Prix"}
        ]

        try:
            schedule = fastf1.get_event_schedule(year)
            races = []
            for _, row in schedule.iterrows():
                round_num = row.get('RoundNumber')
                event_name = row.get('EventName')
                if round_num is not None and pd.notna(round_num) and int(round_num) > 0:
                    races.append({
                        "round": int(round_num),
                        "name": str(event_name)
                    })
            if races:
                return races
            return FALLBACK_2024_RACES if year == 2024 else []
        except Exception:
            return FALLBACK_2024_RACES if year == 2024 else []

    def _load_session(self, year: int, round_num: int):
        cache_key = f"{year}_{round_num}"
        if cache_key in self._session_cache:
            return self._session_cache[cache_key]

        try:
            session = fastf1.get_session(year, round_num, 'R')
            try:
                # First try full load with telemetry
                session.load(laps=True, telemetry=True, weather=True)
            except Exception:
                # Fast fallback: load laps only if telemetry download times out or fails
                session.load(laps=True, telemetry=False, weather=False)
            self._session_cache[cache_key] = session
            return session
        except Exception as e:
            raise RuntimeError(f"Failed to load session {year} round {round_num}: {str(e)}")

    def get_race_details(self, year: int, round_num: int) -> Dict[str, Any]:
        session = self._load_session(year, round_num)
        event = session.event

        # Extract date string YYYY-MM-DD
        event_date = event.get('EventDate')
        if hasattr(event_date, 'strftime'):
            date_str = event_date.strftime('%Y-%m-%d')
        elif event_date is not None:
            date_str = str(event_date)[:10]
        else:
            date_str = ""

        # Total laps
        total_laps = 0
        if session.laps is not None and not session.laps.empty:
            max_lap = session.laps['LapNumber'].max()
            if pd.notna(max_lap):
                total_laps = int(max_lap)

        location = event.get('Location') or event.get('OfficialEventName') or "Circuit"
        country = event.get('Country') or ""

        return {
            "season": int(year),
            "race_name": str(event.get('EventName', f"Round {round_num}")),
            "circuit": str(location),
            "country": str(country),
            "date": date_str,
            "total_laps": total_laps
        }

    def get_drivers(self, year: int, round_num: int) -> List[Dict[str, Any]]:
        session = self._load_session(year, round_num)
        drivers_list = []

        if hasattr(session, 'results') and session.results is not None and not session.results.empty:
            for _, row in session.results.iterrows():
                abbr = row.get('Abbreviation') or row.get('DriverId')
                if not abbr or pd.isna(abbr):
                    continue
                team_color = row.get('TeamColor')
                color_hex = f"#{team_color}" if team_color and str(team_color).strip() != "" else "#6B7280"
                if color_hex.startswith("##"):
                    color_hex = color_hex[1:]

                drivers_list.append({
                    "driver": str(abbr),
                    "driver_number": str(int(row.get('DriverNumber'))) if pd.notna(row.get('DriverNumber')) else "",
                    "driver_name": str(row.get('FullName', abbr)),
                    "team_name": str(row.get('TeamName', 'Unknown Team')),
                    "team_color": color_hex,
                    "position": int(row.get('Position')) if pd.notna(row.get('Position')) else None,
                    "grid": int(row.get('GridPosition')) if pd.notna(row.get('GridPosition')) else None
                })
        else:
            # Fallback to session.drivers
            for drv_code in session.drivers:
                drv_info = session.get_driver(drv_code)
                abbr = drv_info.get('Abbreviation', drv_code)
                team_color = drv_info.get('TeamColor', '6B7280')
                color_hex = f"#{team_color}" if team_color else "#6B7280"
                drivers_list.append({
                    "driver": str(abbr),
                    "driver_number": str(drv_info.get('DriverNumber', '')),
                    "driver_name": str(drv_info.get('FullName', abbr)),
                    "team_name": str(drv_info.get('TeamName', 'Unknown Team')),
                    "team_color": color_hex,
                    "position": None,
                    "grid": None
                })

        return drivers_list

    def get_laps(self, year: int, round_num: int) -> List[Dict[str, Any]]:
        session = self._load_session(year, round_num)
        laps_df = session.laps

        if laps_df is None or laps_df.empty:
            return []

        # Map driver abbreviation to full name
        drivers = self.get_drivers(year, round_num)
        driver_name_map = {d["driver"]: d["driver_name"] for d in drivers}

        normalized_laps = []
        for _, row in laps_df.iterrows():
            lap_num = row.get('LapNumber')
            driver_code = row.get('Driver')
            if pd.isna(lap_num) or pd.isna(driver_code):
                continue

            # Position
            pos_val = row.get('Position')
            position = int(pos_val) if pd.notna(pos_val) else None

            # Lap time in seconds
            lap_time_obj = row.get('LapTime')
            if pd.notna(lap_time_obj) and hasattr(lap_time_obj, 'total_seconds'):
                lap_time = round(float(lap_time_obj.total_seconds()), 3)
            else:
                lap_time = None

            # Compound
            cmp_val = row.get('Compound')
            compound = str(cmp_val).strip().upper() if pd.notna(cmp_val) and str(cmp_val).strip() != "" else None

            # Tyre age / life
            age_val = row.get('TyreLife')
            tyre_age = int(age_val) if pd.notna(age_val) else None

            # Pit stop detection
            pit_in = row.get('PitInTime')
            pit_out = row.get('PitOutTime')
            pit_stop = bool(pd.notna(pit_in) or pd.notna(pit_out))

            normalized_laps.append({
                "lap": int(lap_num),
                "driver": str(driver_code),
                "driver_name": driver_name_map.get(str(driver_code), str(driver_code)),
                "position": position,
                "lap_time": lap_time,
                "compound": compound,
                "tyre_age": tyre_age,
                "pit_stop": pit_stop
            })

        # Sort by lap number, then position
        normalized_laps.sort(key=lambda x: (x["lap"], x["position"] if x["position"] is not None else 999))
        return normalized_laps

    def get_weather_data(self, year: int, round_num: int) -> Dict[str, Any]:
        session = self._load_session(year, round_num)
        weather_df = getattr(session, 'weather_data', None)

        if weather_df is not None and not weather_df.empty:
            track_temp = round(float(weather_df['TrackTemp'].dropna().median()), 1) if 'TrackTemp' in weather_df else 34.0
            air_temp = round(float(weather_df['AirTemp'].dropna().median()), 1) if 'AirTemp' in weather_df else 22.5
            humidity = round(float(weather_df['Humidity'].dropna().median()), 1) if 'Humidity' in weather_df else 55.0
            pressure = round(float(weather_df['Pressure'].dropna().median()), 1) if 'Pressure' in weather_df else 1012.0
            wind_speed = round(float(weather_df['WindSpeed'].dropna().median()), 1) if 'WindSpeed' in weather_df else 12.0
            rainfall = bool((weather_df['Rainfall'].dropna() > 0).any()) if 'Rainfall' in weather_df else False
        else:
            track_temp, air_temp, humidity, pressure, wind_speed, rainfall = 34.0, 22.5, 55.0, 1012.0, 12.0, False

        return {
            "track_temp": track_temp,
            "air_temp": air_temp,
            "humidity": humidity,
            "pressure": pressure,
            "wind_speed": wind_speed,
            "rainfall": rainfall,
            "track_status": "DRY" if not rainfall else "WET"
        }

    def get_actual_driver_strategy(self, year: int, round_num: int, driver: str) -> Dict[str, Any]:
        laps = self.get_laps(year, round_num)
        driver_laps = [l for l in laps if l["driver"] == driver]

        if not driver_laps:
            return {
                "driver": driver,
                "starting_compound": "MEDIUM",
                "actual_finish": "P5",
                "pit_stops": [],
                "stints": []
            }

        driver_laps.sort(key=lambda x: x["lap"])
        starting_compound = driver_laps[0].get("compound") or "MEDIUM"
        actual_finish = f"P{driver_laps[-1].get('position') or 5}"

        pit_stops = []
        stints = []
        curr_stint_num = 1
        stint_start_lap = 1
        curr_compound = starting_compound

        for i, lap_item in enumerate(driver_laps):
            lap_num = lap_item["lap"]
            is_pit = lap_item["pit_stop"]
            lap_cmp = lap_item.get("compound") or curr_compound

            if is_pit or (lap_cmp != curr_compound and i > 0):
                next_cmp = lap_cmp if lap_cmp != curr_compound else ("HARD" if curr_compound == "MEDIUM" else "MEDIUM")
                stint_len = lap_num - stint_start_lap + 1

                stints.append({
                    "stint": curr_stint_num,
                    "compound": curr_compound,
                    "start_lap": stint_start_lap,
                    "end_lap": lap_num,
                    "length": stint_len
                })

                pit_stops.append({
                    "pit_num": curr_stint_num,
                    "pit_lap": lap_num,
                    "compound_before": curr_compound,
                    "compound_after": next_cmp,
                    "tyre_age_before": lap_item.get("tyre_age") or stint_len,
                    "stint_length": stint_len,
                    "pit_loss_sec": 22.4
                })

                curr_stint_num += 1
                stint_start_lap = lap_num + 1
                curr_compound = next_cmp

        # Final stint
        final_len = driver_laps[-1]["lap"] - stint_start_lap + 1
        stints.append({
            "stint": curr_stint_num,
            "compound": curr_compound,
            "start_lap": stint_start_lap,
            "end_lap": driver_laps[-1]["lap"],
            "length": max(1, final_len)
        })

        if not pit_stops:
            # Fallback 1-stop default if FastF1 telemetry missing explicit pit flag
            def_pit_lap = 18 if len(driver_laps) <= 52 else 22
            pit_stops.append({
                "pit_num": 1,
                "pit_lap": def_pit_lap,
                "compound_before": starting_compound,
                "compound_after": "HARD" if starting_compound == "MEDIUM" else "MEDIUM",
                "tyre_age_before": def_pit_lap,
                "stint_length": def_pit_lap,
                "pit_loss_sec": 22.4
            })

        return {
            "driver": driver,
            "starting_compound": starting_compound,
            "actual_finish": actual_finish,
            "pit_stops": pit_stops,
            "stints": stints
        }

    def get_lap_snapshot(self, year: int, round_num: int, lap_num: int) -> Dict[str, Any]:
        race_info = self.get_race_details(year, round_num)
        weather_info = self.get_weather_data(year, round_num)
        drivers = self.get_drivers(year, round_num)
        laps = self.get_laps(year, round_num)

        total_laps = race_info.get("total_laps") or 52
        target_lap = max(1, min(lap_num, total_laps))

        # Filter laps up to target_lap
        laps_at_target = [l for l in laps if l["lap"] == target_lap]
        laps_at_target.sort(key=lambda x: x["position"] if x["position"] is not None else 99)

        # Estimate fuel load (110 kg down to ~5 kg)
        burn_rate = (110.0 - 5.0) / total_laps
        est_fuel_kg = round(max(5.0, 110.0 - ((target_lap - 1) * burn_rate)), 1)

        leader_time = None
        driver_snapshots = []

        for item in laps_at_target:
            d_code = item["driver"]
            d_pos = item["position"] or 99
            d_compound = item["compound"] or "MEDIUM"
            d_tyre_age = item["tyre_age"] or 10
            d_lap_time = item["lap_time"] or 90.0

            # Calculate gap to leader
            if leader_time is None:
                leader_time = d_lap_time
                gap_sec = 0.0
            else:
                gap_sec = round(abs(d_lap_time - leader_time) * (d_pos - 1) * 1.2, 1)

            # Cumulative pit stops up to target lap
            driver_laps_so_far = [l for l in laps if l["driver"] == d_code and l["lap"] <= target_lap]
            pits_so_far = sum(1 for l in driver_laps_so_far if l["pit_stop"])

            d_info = next((d for d in drivers if d["driver"] == d_code), {})

            driver_snapshots.append({
                "driver": d_code,
                "driver_name": d_info.get("driver_name", d_code),
                "team_name": d_info.get("team_name", "F1 Team"),
                "team_color": d_info.get("team_color", "#E10600"),
                "position": d_pos,
                "gap_to_leader_sec": gap_sec,
                "gap_text": "LEADER" if d_pos == 1 else f"+{gap_sec}s",
                "compound": d_compound,
                "tyre_age": d_tyre_age,
                "pits_made": pits_so_far,
                "last_lap_time": d_lap_time
            })

        # Fallback if specific lap telemetry missing
        if not driver_snapshots:
            for idx, d in enumerate(drivers[:10]):
                driver_snapshots.append({
                    "driver": d["driver"],
                    "driver_name": d["driver_name"],
                    "team_name": d["team_name"],
                    "team_color": d["team_color"],
                    "position": idx + 1,
                    "gap_to_leader_sec": round(idx * 2.5, 1),
                    "gap_text": "LEADER" if idx == 0 else f"+{round(idx * 2.5, 1)}s",
                    "compound": "MEDIUM" if idx % 2 == 0 else "HARD",
                    "tyre_age": target_lap % 15,
                    "pits_made": 1 if target_lap > 20 else 0,
                    "last_lap_time": 91.5
                })

        return {
            "season": year,
            "round_num": round_num,
            "race_name": race_info["race_name"],
            "circuit": race_info["circuit"],
            "current_lap": target_lap,
            "total_laps": total_laps,
            "estimated_fuel_kg": est_fuel_kg,
            "weather": weather_info,
            "drivers": driver_snapshots
        }

    def get_circuit_geometry(self, year: int, round_num: int) -> Dict[str, Any]:
        try:
            # Always ensure telemetry is loaded for exact circuit coordinates
            session = fastf1.get_session(year, round_num, 'R')
            session.load(laps=True, telemetry=True, weather=False)

            lap = session.laps.pick_fastest()
            telemetry = lap.get_telemetry()
            x_raw = telemetry['X'].values
            y_raw = telemetry['Y'].values
            dist_raw = telemetry['Distance'].values if 'Distance' in telemetry else np.linspace(0, 100, len(x_raw))

            # Retrieve official circuit rotation angle & corner markers
            try:
                circuit_info = session.get_circuit_info()
                rotation = float(circuit_info.rotation)
                corners_df = circuit_info.corners
            except Exception:
                rotation = 0.0
                corners_df = None

            # Rotation matrix transformation
            rot_rad = np.radians(rotation)
            cos_rot = np.cos(rot_rad)
            sin_rot = np.sin(rot_rad)

            x_rot = x_raw * cos_rot - y_raw * sin_rot
            y_rot = x_raw * sin_rot + y_raw * cos_rot

            # Downsample telemetry to ~400 smooth points for clean vector SVG rendering
            step = max(1, len(x_rot) // 400)
            x_sub = x_rot[::step]
            y_sub = y_rot[::step]
            dist_sub = dist_raw[::step]

            # Aspect-ratio preserving normalization to SVG 1000x600 canvas
            min_x, max_x = np.min(x_sub), np.max(x_sub)
            min_y, max_y = np.min(y_sub), np.max(y_sub)
            range_x = max(1.0, max_x - min_x)
            range_y = max(1.0, max_y - min_y)

            scale = min(860.0 / range_x, 480.0 / range_y)
            offset_x = (1000.0 - range_x * scale) / 2.0
            offset_y = (600.0 - range_y * scale) / 2.0

            points = []
            for i in range(len(x_sub)):
                norm_x = round(float(offset_x + (x_sub[i] - min_x) * scale), 2)
                norm_y = round(float(600.0 - (offset_y + (y_sub[i] - min_y) * scale)), 2)
                norm_dist = round(float((dist_sub[i] - dist_sub[0]) / max(1.0, dist_sub[-1] - dist_sub[0])), 4)
                points.append({
                    "x": norm_x,
                    "y": norm_y,
                    "progress": norm_dist
                })

            # Process corner apex markers in the exact same coordinate system
            corners = []
            if corners_df is not None:
                for _, row in corners_df.iterrows():
                    cx_raw, cy_raw = row['X'], row['Y']
                    cx_rot = cx_raw * cos_rot - cy_raw * sin_rot
                    cy_rot = cx_raw * sin_rot + cy_raw * cos_rot
                    norm_cx = round(float(offset_x + (cx_rot - min_x) * scale), 2)
                    norm_cy = round(float(600.0 - (offset_y + (cy_rot - min_y) * scale)), 2)
                    c_num = str(row['Number']) + str(row['Letter']).strip()
                    corners.append({
                        "number": c_num,
                        "x": norm_cx,
                        "y": norm_cy
                    })

            return {
                "season": year,
                "round_num": round_num,
                "circuit_name": session.event.get('Location', f"Round {round_num} Circuit"),
                "geometry_source": "FastF1 Real Telemetry & Circuit Info",
                "rotation_deg": rotation,
                "points_count": len(points),
                "corners_count": len(corners),
                "corners": corners,
                "points": points
            }
        except Exception as e:
            return {
                "season": year,
                "round_num": round_num,
                "circuit_name": f"Round {round_num} Circuit",
                "geometry_source": "Telemetry Error",
                "rotation_deg": 0,
                "points_count": 0,
                "corners_count": 0,
                "corners": [],
                "points": []
            }

    def get_driver_headshots(self) -> Dict[str, str]:
        return {
            "VER": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png",
            "PER": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png",
            "HAM": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png",
            "RUS": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png",
            "LEC": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png",
            "SAI": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png",
            "NOR": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png",
            "PIA": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png",
            "ALO": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png",
            "STR": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png",
            "GAS": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png",
            "OCO": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png",
            "ALB": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png",
            "SAR": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LOGSAR01_Logan_Sargeant/logsar01.png",
            "TSU": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png",
            "RIC": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/D/DANRIC01_Daniel_Ricciardo/danric01.png",
            "BOT": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png",
            "ZHO": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GUAZHO01_Guanyu_Zhou/guazho01.png",
            "HUL": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png",
            "MAG": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/K/KEVMAG01_Kevin_Magnussen/kevmag01.png"
        }

fastf1_service = FastF1Service()



