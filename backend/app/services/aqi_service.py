from typing import Dict, Tuple, Any

# CPCB Breakpoints: (B_low, B_high, I_low, I_high)
BREAKPOINTS = {
    "pm25": [
        (0.0, 30.0, 0, 50),
        (30.1, 60.0, 51, 100),
        (60.1, 90.0, 101, 200),
        (90.1, 120.0, 201, 300),
        (120.1, 250.0, 301, 400),
        (250.1, 500.0, 401, 500)
    ],
    "pm10": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 250.0, 101, 200),
        (250.1, 350.0, 201, 300),
        (350.1, 430.0, 301, 400),
        (430.1, 600.0, 401, 500)
    ],
    "no2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 180.0, 101, 200),
        (180.1, 280.0, 201, 300),
        (280.1, 400.0, 301, 400),
        (400.1, 800.0, 401, 500)
    ],
    "o3": [
        (0.0, 50.0, 0, 50),
        (50.1, 100.0, 51, 100),
        (100.1, 168.0, 101, 200),
        (168.1, 208.0, 201, 300),
        (208.1, 748.0, 301, 400),
        (748.1, 1000.0, 401, 500)
    ],
    "so2": [
        (0.0, 40.0, 0, 50),
        (40.1, 80.0, 51, 100),
        (80.1, 380.0, 101, 200),
        (380.1, 800.0, 201, 300),
        (800.1, 1600.0, 301, 400),
        (1600.1, 2000.0, 401, 500)
    ],
    "co": [
        (0.0, 1.0, 0, 50),
        (1.01, 2.0, 51, 100),
        (2.01, 10.0, 101, 200),
        (10.01, 17.0, 201, 300),
        (17.01, 34.0, 301, 400),
        (34.01, 50.0, 401, 500)
    ]
}

def calculate_sub_index(pollutant: str, concentration: float) -> int:
    """Calculates linear sub-index for a single pollutant using official CPCB formula."""
    if concentration <= 0:
        return 0
    
    pollutant_lower = pollutant.lower()
    if pollutant_lower not in BREAKPOINTS:
        return 0
    
    table = BREAKPOINTS[pollutant_lower]
    
    # If beyond max breakpoint
    max_b_high = table[-1][1]
    if concentration >= max_b_high:
        return 500
        
    for b_low, b_high, i_low, i_high in table:
        if b_low <= concentration <= b_high:
            sub = i_low + ((i_high - i_low) / (b_high - b_low)) * (concentration - b_low)
            return round(sub)
            
    # Fallback to closest
    if concentration < table[0][0]:
        return 0
    return 500

def get_aqi_category(aqi: int) -> Tuple[str, str, str]:
    """Returns (Category, Health Impact Statement, Official Advisory) based on CPCB standard."""
    if aqi <= 50:
        return (
            "Good",
            "Minimal health impact. Air quality is considered satisfactory.",
            "Enjoy outdoor activities; ideal atmospheric conditions."
        )
    elif aqi <= 100:
        return (
            "Satisfactory",
            "Minor breathing discomfort to sensitive individuals.",
            "Sensitive groups (asthma, heart conditions) should limit prolonged outdoor exertion."
        )
    elif aqi <= 200:
        return (
            "Moderate",
            "Breathing discomfort to people with lung disease such as asthma, and discomfort to humans with heart disease, children and older adults.",
            "Wear masks during peak morning/evening hours if sensitive; reduce vigorous outdoor exercise."
        )
    elif aqi <= 300:
        return (
            "Poor",
            "Breathing discomfort to most people on prolonged exposure.",
            "Avoid strenuous outdoor activities. Use N95 masks when stepping out. Keep windows closed during stagnant morning hours."
        )
    elif aqi <= 400:
        return (
            "Very Poor",
            "Respiratory illness to people on prolonged exposure. Pronounced effect on people with heart and lung diseases.",
            "Avoid all prolonged physical exertion outdoors. Children, elderly and pregnant women should remain indoors. Air purifiers recommended."
        )
    else:
        return (
            "Severe",
            "Affects healthy people and seriously impacts those with existing diseases.",
            "Health emergency advisory: Remain indoors with air filtration. Cease construction and non-essential vehicle movement. High trapping risk."
        )

def calculate_cpcb_aqi(pollutants: Dict[str, float]) -> Dict[str, Any]:
    """
    Computes overall CPCB AQI from pollutant dictionary.
    Requirement: At least PM2.5 or PM10 must be available.
    """
    sub_indices = {}
    for key, val in pollutants.items():
        sub_indices[key.lower()] = calculate_sub_index(key.lower(), float(val))
    
    # Must have pm25 or pm10
    has_particulate = "pm25" in sub_indices or "pm10" in sub_indices
    if not has_particulate or not sub_indices:
        return {
            "aqi": 0,
            "category": "Data Unavailable",
            "dominant_pollutant": "None",
            "health_statement": "Insufficient monitoring data",
            "advisory": "Monitoring data incomplete",
            "sub_indices": sub_indices
        }
    
    # Maximum sub-index is the AQI
    dominant_pollutant = max(sub_indices, key=sub_indices.get)
    overall_aqi = sub_indices[dominant_pollutant]
    
    # Cap at 500 for display standard
    overall_aqi = min(overall_aqi, 500)
    category, health_statement, advisory = get_aqi_category(overall_aqi)
    
    pollutant_labels = {
        "pm25": "PM2.5",
        "pm10": "PM10",
        "no2": "NO2",
        "o3": "Ozone",
        "so2": "SO2",
        "co": "CO"
    }
    
    return {
        "aqi": overall_aqi,
        "category": category,
        "dominant_pollutant": pollutant_labels.get(dominant_pollutant, dominant_pollutant.upper()),
        "health_statement": health_statement,
        "advisory": advisory,
        "sub_indices": sub_indices
    }
