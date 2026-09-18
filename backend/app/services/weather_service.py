import math
from typing import Dict, Any

CARDINAL_DIRECTIONS = [
    ("N", 348.75, 360.0),
    ("N", 0.0, 11.25),
    ("NNE", 11.25, 33.75),
    ("NE", 33.75, 56.25),
    ("ENE", 56.25, 78.75),
    ("E", 78.75, 101.25),
    ("ESE", 101.25, 123.75),
    ("SE", 123.75, 146.25),
    ("SSE", 146.25, 168.75),
    ("S", 168.75, 191.25),
    ("SSW", 191.25, 213.75),
    ("SW", 213.75, 236.25),
    ("WSW", 236.25, 258.75),
    ("W", 258.75, 281.25),
    ("WNW", 281.25, 303.75),
    ("NW", 303.75, 326.25),
    ("NNW", 326.25, 348.75),
]

def degrees_to_cardinal(degrees: float) -> str:
    """Converts wind direction degrees (0-360) to 16-point cardinal compass string."""
    norm = degrees % 360
    for cardinal, low, high in CARDINAL_DIRECTIONS:
        if low <= norm < high or (high == 360.0 and norm == 360.0):
            return cardinal
    return "NW"

def calculate_ventilation_index(pbl_height: float, wind_speed: float) -> float:
    """
    Ventilation Index (m^2/s) = Planetary Boundary Layer Height (m) * Surface Wind Speed (m/s)
    Standard CPCB/NCMRWF index for atmospheric carrying capacity and dispersion potential.
    """
    return round(float(pbl_height) * float(wind_speed), 1)

def get_dispersion_category(ventilation_index: float) -> Dict[str, str]:
    """
    Categorizes ventilation index according to MoES / NCMRWF air quality forecasting criteria:
    - < 2000 m^2/s: Low / Stagnant (Severe Pollutant Trapping)
    - 2000 - 6000 m^2/s: Moderate (Moderate Mixing)
    - > 6000 m^2/s: High (Efficient Dispersion / Cleansing)
    """
    if ventilation_index < 2000:
        return {
            "level": "Low",
            "accumulation_risk": "High",
            "status_code": "stagnant",
            "description": "Critical atmospheric stagnation. Emissions accumulate rapidly near ground level with minimal dilution."
        }
    elif ventilation_index <= 6000:
        return {
            "level": "Moderate",
            "accumulation_risk": "Moderate",
            "status_code": "intermediate",
            "description": "Moderate atmospheric mixing. Partial pollutant ventilation, gradual accumulation during evening calm."
        }
    else:
        return {
            "level": "High",
            "accumulation_risk": "Low",
            "status_code": "ventilated",
            "description": "Favorable dispersion conditions. Boundary layer dynamics and winds effectively dilute aerosol loading."
        }

def determine_stability_class(wind_speed: float, is_night: bool = False, solar_insolation: str = "moderate") -> str:
    """
    Pasquill-Gifford Atmospheric Stability Classification (A to F):
    A: Extremely Unstable (Intense daytime convection)
    B: Moderately Unstable
    C: Slightly Unstable
    D: Neutral (Overcast or high wind speed)
    E: Slightly Stable (Clear night, moderate wind)
    F: Moderately Stable (Calm clear night, strong surface inversion)
    """
    if is_night:
        if wind_speed < 2.0:
            return "F"
        elif wind_speed < 3.0:
            return "E"
        else:
            return "D"
    else:
        if wind_speed < 2.0:
            return "A" if solar_insolation == "strong" else "B"
        elif wind_speed < 3.0:
            return "B" if solar_insolation == "strong" else "C"
        elif wind_speed < 5.0:
            return "C"
        else:
            return "D"
