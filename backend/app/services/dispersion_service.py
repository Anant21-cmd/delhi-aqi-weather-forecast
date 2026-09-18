import datetime
from typing import Dict, Any, List, Optional
from app.services.weather_service import (
    calculate_ventilation_index,
    get_dispersion_category,
    determine_stability_class,
    degrees_to_cardinal
)

STABILITY_DESCRIPTIONS = {
    "A": "Extremely Unstable — Strong solar heating and vigorous thermal updrafts promote rapid vertical dilution.",
    "B": "Moderately Unstable — Active thermal convection enhances vertical dispersion throughout the boundary layer.",
    "C": "Slightly Unstable — Moderate convective mixing with steady surface winds facilitating advective transport.",
    "D": "Neutral — Overcast skies or strong mechanical turbulence; dispersion governed primarily by wind advection.",
    "E": "Slightly Stable — Evening ground cooling begins suppressing convective mixing; partial trapping occurs.",
    "F": "Moderately Stable — Severe surface inversion and calm winds; virtual halt to vertical and horizontal dispersion."
}

def generate_diurnal_dispersion_trend(
    base_pbl: float,
    base_wind: float,
    base_pm25: float
) -> List[Dict[str, Any]]:
    """
    Generates a scientifically grounded 24-hour diurnal boundary layer and ventilation cycle.
    Reflects the characteristic Delhi winter/post-monsoon diurnal pattern:
    - 00:00 - 07:00: Shallow nocturnal inversion (PBL 220-350m), calm winds (<1.5 m/s), severe trapping (VI < 600 m²/s).
    - 08:00 - 11:00: Solar surface heating initiates convective boundary layer growth.
    - 12:00 - 16:00: Peak thermal mixing (PBL 1000-1400m), moderate winds (2.8-3.6 m/s), maximum ventilation.
    - 17:00 - 23:00: Surface radiative cooling, boundary layer collapse, inversion reformation, and secondary PM2.5 spike.
    """
    now = datetime.datetime.now(datetime.timezone.utc)
    # Estimate current IST hour
    current_ist_hour = (now.hour + 5) % 24
    trend = []

    # Diurnal scaling factors for [00:00, 01:00, ..., 23:00]
    # (pbl_factor, wind_factor, pm25_factor)
    diurnal_profile = [
        (0.70, 0.75, 1.25),  # 00:00 - Midnight trapping
        (0.65, 0.70, 1.30),  # 01:00
        (0.60, 0.65, 1.35),  # 02:00 - Pre-dawn deep stagnation
        (0.55, 0.60, 1.40),  # 03:00
        (0.52, 0.60, 1.45),  # 04:00 - Minimum PBL height
        (0.55, 0.65, 1.45),  # 05:00
        (0.60, 0.70, 1.40),  # 06:00 - Morning calm
        (0.75, 0.85, 1.30),  # 07:00 - Sunrise
        (1.10, 1.05, 1.15),  # 08:00 - Convective initiation
        (1.50, 1.25, 1.00),  # 09:00
        (2.00, 1.45, 0.88),  # 10:00
        (2.50, 1.65, 0.78),  # 11:00
        (3.00, 1.80, 0.70),  # 12:00 - Midday peak dilution
        (3.20, 1.90, 0.65),  # 13:00 - Maximum PBL ceiling
        (3.10, 1.85, 0.68),  # 14:00
        (2.70, 1.70, 0.75),  # 15:00
        (2.10, 1.50, 0.85),  # 16:00 - Sunset descent begins
        (1.50, 1.25, 1.00),  # 17:00
        (1.05, 1.00, 1.15),  # 18:00 - Inversion formation
        (0.85, 0.90, 1.22),  # 19:00 - Nocturnal boundary layer
        (0.80, 0.85, 1.26),  # 20:00
        (0.78, 0.80, 1.28),  # 21:00
        (0.75, 0.78, 1.30),  # 22:00
        (0.72, 0.75, 1.28),  # 23:00
    ]

    for h in range(24):
        pbl_mult, wind_mult, pm_mult = diurnal_profile[h]
        pbl = round(max(180.0, base_pbl * pbl_mult), 1)
        wind = round(max(0.8, base_wind * wind_mult), 1)
        vi = calculate_ventilation_index(pbl, wind)
        pm = round(max(25.0, base_pm25 * pm_mult), 1)
        cat = get_dispersion_category(vi)

        hour_str = f"{h:02d}:00"
        time_label = f"{h % 12 or 12}:00 {'AM' if h < 12 else 'PM'}"

        trend.append({
            "hour": hour_str,
            "time_label": time_label,
            "pbl_height": pbl,
            "wind_speed": wind,
            "ventilation_index": vi,
            "pm25": pm,
            "dispersion_category": cat["level"],
            "is_current": (h == current_ist_hour)
        })

    return trend

def analyze_dispersion(
    location_name: str = "Delhi (Anand Vihar)",
    wind_speed: float = 1.8,
    pbl_height: float = 380.0,
    inversion_status: str = "Strong",
    stability_class: str = "F",
    weather_data: Optional[Dict[str, Any]] = None,
    pollution_data: Optional[Dict[str, Any]] = None,
    station_code: Optional[str] = "DL-ANV-01",
    all_stations: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Performs comprehensive atmospheric dispersion and stagnation risk evaluation
    coupling boundary layer dynamics with air-pollution concentration.
    """
    vi = calculate_ventilation_index(pbl_height, wind_speed)
    cat = get_dispersion_category(vi)
    
    # Check for compound stagnation
    is_compound = (wind_speed < 2.0) and (pbl_height < 450.0) and (inversion_status in ("Strong", "Moderate"))
    
    if is_compound:
        dispersion_level = "Low"
        accumulation_risk = "High"
    elif vi < 3000 or inversion_status == "Strong":
        dispersion_level = "Low"
        accumulation_risk = "High"
    elif vi <= 6000:
        dispersion_level = "Moderate"
        accumulation_risk = "Moderate"
    else:
        dispersion_level = "High"
        accumulation_risk = "Low"
        
    stability_desc = STABILITY_DESCRIPTIONS.get(
        stability_class,
        "Neutral mixing conditions with standard boundary layer advection."
    )

    # Base pollutant concentration for diurnal coupling
    base_pm25 = 220.0
    if pollution_data and "pollutants" in pollution_data:
        base_pm25 = pollution_data["pollutants"].get("pm25", 220.0)
    elif pollution_data and "pm25" in pollution_data:
        base_pm25 = pollution_data.get("pm25", 220.0)

    # Diurnal ventilation trend
    hourly_trend = generate_diurnal_dispersion_trend(pbl_height, wind_speed, base_pm25)

    # Multi-station comparison if stations provided
    station_comparisons = []
    if all_stations:
        for s in all_stations:
            station_comparisons.append({
                "station_id": s["id"],
                "name": s["name"],
                "city": s["city"],
                "ventilation_index": s["ventilation_index"],
                "dispersion_level": s["dispersion_level"],
                "wind_speed": s["wind_speed"],
                "pbl_height": s["pbl_height"],
                "aqi": s["aqi"],
                "aqi_category": s["aqi_category"]
            })
        # Sort by ventilation index ascending (most stagnant first)
        station_comparisons.sort(key=lambda x: x["ventilation_index"])

    chain = [
        f"1. Surface wind speed ({wind_speed} m/s) restricts horizontal advective transport across the NCR airshed.",
        f"2. Suppressed boundary layer ceiling ({int(pbl_height)} m AGL) constricts vertical dilution volume.",
        f"3. {inversion_status} atmospheric thermal inversion lid impedes buoyant chimney venting.",
        f"4. Result: Ventilation Index of {int(vi)} m²/s induces {dispersion_level.upper()} DISPERSION and {accumulation_risk.upper()} ACCUMULATION RISK."
    ]
    
    explanation = (
        f"The atmospheric carrying capacity over {location_name} is currently operating in a "
        f"{dispersion_level.lower()} dispersion regime. The ventilation index of {int(vi)} m²/s "
        f"is {('below the critical stagnation limit of 2000 m²/s' if vi < 2000 else 'below the optimal cleansing threshold of 6000 m²/s' if vi < 6000 else 'above the favorable cleansing threshold of 6000 m²/s')}. "
        f"Under Pasquill Stability Class {stability_class} with a {inversion_status.lower()} thermal inversion cap, "
        f"ground-level emissions face physical confinement, resulting in {accumulation_risk.lower()} aerosol buildup."
    )

    # Pack weather parameters
    weather_params = None
    if weather_data:
        weather_params = {
            "temperature": weather_data.get("temperature", 24.2),
            "humidity": weather_data.get("humidity", 68.0),
            "pressure": weather_data.get("pressure", 1012.4),
            "wind_speed": weather_data.get("wind_speed", wind_speed),
            "wind_direction": weather_data.get("wind_direction", 310.0),
            "wind_cardinal": weather_data.get("wind_cardinal", degrees_to_cardinal(weather_data.get("wind_direction", 310.0))),
            "pbl_height": weather_data.get("pbl_height", pbl_height),
            "stability_class": stability_class,
            "stability_description": stability_desc
        }
    else:
        weather_params = {
            "temperature": 24.2,
            "humidity": 68.0,
            "pressure": 1012.4,
            "wind_speed": wind_speed,
            "wind_direction": 310.0,
            "wind_cardinal": "NW",
            "pbl_height": pbl_height,
            "stability_class": stability_class,
            "stability_description": stability_desc
        }

    # Pack pollution parameters
    pollution_params = None
    if pollution_data:
        pollutants = pollution_data.get("pollutants", {})
        pollution_params = {
            "aqi": pollution_data.get("aqi", 380),
            "aqi_category": pollution_data.get("aqi_category", "Very Poor"),
            "dominant_pollutant": pollution_data.get("dominant_pollutant", "PM2.5"),
            "pm25": pollutants.get("pm25", pollution_data.get("pm25", 220.0)),
            "pm10": pollutants.get("pm10", pollution_data.get("pm10", 380.0)),
            "no2": pollutants.get("no2", 72.0),
            "o3": pollutants.get("o3", 32.0)
        }
    else:
        pollution_params = {
            "aqi": 380,
            "aqi_category": "Very Poor",
            "dominant_pollutant": "PM2.5",
            "pm25": base_pm25,
            "pm10": 380.0,
            "no2": 72.0,
            "o3": 32.0
        }
    
    return {
        "location_name": location_name,
        "station_code": station_code,
        "ventilation_index": vi,
        "dispersion_level": dispersion_level,
        "accumulation_risk": accumulation_risk,
        "pbl_height": pbl_height,
        "wind_speed": wind_speed,
        "stability_class": stability_class,
        "stability_description": stability_desc,
        "formula_explanation": "Ventilation Index (m²/s) = Boundary Layer Height (m) × Wind Speed (m/s). Threshold: >6000 Cleansing, 2000-6000 Moderate, <2000 Stagnant.",
        "chain_of_causation": chain,
        "detailed_narrative": explanation,
        "weather_parameters": weather_params,
        "pollution_parameters": pollution_params,
        "hourly_dispersion_trend": hourly_trend,
        "station_comparisons": station_comparisons,
        "status_code": cat["status_code"],
        "timestamp": datetime.datetime.now(datetime.timezone.utc)
    }

