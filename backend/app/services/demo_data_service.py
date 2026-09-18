import datetime
from typing import Dict, Any, List, Optional
from app.services.aqi_service import calculate_cpcb_aqi
from app.services.weather_service import degrees_to_cardinal, calculate_ventilation_index, get_dispersion_category, determine_stability_class

# Centralized NCR Monitoring Locations
NCR_LOCATIONS = [
    {
        "id": 1,
        "name": "Delhi (Anand Vihar)",
        "city": "Delhi",
        "state": "Delhi",
        "latitude": 28.6469,
        "longitude": 77.3160,
        "station_code": "DL-ANV-01",
        "is_active": True,
        "base_pm25": 245.0,
        "base_pm10": 410.0,
        "base_no2": 78.0,
        "base_o3": 34.0,
        "base_temp": 24.2,
        "base_wind": 1.7,
        "base_wind_deg": 310.0,
        "base_pbl": 360.0
    },
    {
        "id": 2,
        "name": "Delhi (ITO)",
        "city": "Delhi",
        "state": "Delhi",
        "latitude": 28.6289,
        "longitude": 77.2405,
        "station_code": "DL-ITO-02",
        "is_active": True,
        "base_pm25": 218.0,
        "base_pm10": 365.0,
        "base_no2": 84.0,
        "base_o3": 28.0,
        "base_temp": 24.6,
        "base_wind": 1.9,
        "base_wind_deg": 315.0,
        "base_pbl": 390.0
    },
    {
        "id": 3,
        "name": "Delhi (RK Puram)",
        "city": "Delhi",
        "state": "Delhi",
        "latitude": 28.5630,
        "longitude": 77.1860,
        "station_code": "DL-RKP-03",
        "is_active": True,
        "base_pm25": 195.0,
        "base_pm10": 330.0,
        "base_no2": 66.0,
        "base_o3": 40.0,
        "base_temp": 24.1,
        "base_wind": 2.1,
        "base_wind_deg": 305.0,
        "base_pbl": 410.0
    },
    {
        "id": 4,
        "name": "Delhi (Punjabi Bagh)",
        "city": "Delhi",
        "state": "Delhi",
        "latitude": 28.6740,
        "longitude": 77.1310,
        "station_code": "DL-PBG-04",
        "is_active": True,
        "base_pm25": 225.0,
        "base_pm10": 380.0,
        "base_no2": 72.0,
        "base_o3": 35.0,
        "base_temp": 24.3,
        "base_wind": 1.8,
        "base_wind_deg": 320.0,
        "base_pbl": 375.0
    },
    {
        "id": 5,
        "name": "Noida (Sector 62)",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "latitude": 28.6255,
        "longitude": 77.3688,
        "station_code": "UP-NOI-01",
        "is_active": True,
        "base_pm25": 210.0,
        "base_pm10": 350.0,
        "base_no2": 68.0,
        "base_o3": 38.0,
        "base_temp": 24.5,
        "base_wind": 2.0,
        "base_wind_deg": 315.0,
        "base_pbl": 400.0
    },
    {
        "id": 6,
        "name": "Gurugram (Sector 51)",
        "city": "Gurugram",
        "state": "Haryana",
        "latitude": 28.4312,
        "longitude": 77.0725,
        "station_code": "HR-GGN-01",
        "is_active": True,
        "base_pm25": 185.0,
        "base_pm10": 320.0,
        "base_no2": 58.0,
        "base_o3": 44.0,
        "base_temp": 24.8,
        "base_wind": 2.4,
        "base_wind_deg": 300.0,
        "base_pbl": 450.0
    },
    {
        "id": 7,
        "name": "Faridabad (Sector 16A)",
        "city": "Faridabad",
        "state": "Haryana",
        "latitude": 28.4089,
        "longitude": 77.3178,
        "station_code": "HR-FBD-01",
        "is_active": True,
        "base_pm25": 198.0,
        "base_pm10": 340.0,
        "base_no2": 62.0,
        "base_o3": 36.0,
        "base_temp": 24.9,
        "base_wind": 2.1,
        "base_wind_deg": 310.0,
        "base_pbl": 420.0
    },
    {
        "id": 8,
        "name": "Ghaziabad (Vasundhara)",
        "city": "Ghaziabad",
        "state": "Uttar Pradesh",
        "latitude": 28.6603,
        "longitude": 77.3573,
        "station_code": "UP-GZB-01",
        "is_active": True,
        "base_pm25": 235.0,
        "base_pm10": 395.0,
        "base_no2": 74.0,
        "base_o3": 32.0,
        "base_temp": 24.3,
        "base_wind": 1.7,
        "base_wind_deg": 320.0,
        "base_pbl": 365.0
    },
    {
        "id": 9,
        "name": "Panipat (GT Road)",
        "city": "Panipat",
        "state": "Haryana",
        "latitude": 29.3909,
        "longitude": 76.9635,
        "station_code": "HR-PNP-01",
        "is_active": True,
        "base_pm25": 255.0,
        "base_pm10": 420.0,
        "base_no2": 70.0,
        "base_o3": 30.0,
        "base_temp": 23.8,
        "base_wind": 1.6,
        "base_wind_deg": 325.0,
        "base_pbl": 350.0
    },
    {
        "id": 10,
        "name": "Ambala (Model Town)",
        "city": "Ambala",
        "state": "Haryana",
        "latitude": 30.3782,
        "longitude": 76.7767,
        "station_code": "HR-AMB-01",
        "is_active": True,
        "base_pm25": 165.0,
        "base_pm10": 280.0,
        "base_no2": 45.0,
        "base_o3": 42.0,
        "base_temp": 22.9,
        "base_wind": 2.5,
        "base_wind_deg": 330.0,
        "base_pbl": 460.0
    },
    {
        "id": 11,
        "name": "Hisar (CCS HAU)",
        "city": "Hisar",
        "state": "Haryana",
        "latitude": 29.1492,
        "longitude": 75.7217,
        "station_code": "HR-HSR-01",
        "is_active": True,
        "base_pm25": 175.0,
        "base_pm10": 310.0,
        "base_no2": 52.0,
        "base_o3": 46.0,
        "base_temp": 25.1,
        "base_wind": 2.2,
        "base_wind_deg": 305.0,
        "base_pbl": 440.0
    }
]

def get_location_by_id_or_name(loc_id_or_name: Optional[Any] = None) -> Dict[str, Any]:
    """Finds location object from id or name with default to Delhi Anand Vihar."""
    if not loc_id_or_name:
        return NCR_LOCATIONS[0]
        
    for loc in NCR_LOCATIONS:
        if str(loc["id"]) == str(loc_id_or_name) or loc["name"].lower() == str(loc_id_or_name).lower():
            return loc
            
    # Fuzzy match on city or partial name
    query = str(loc_id_or_name).lower()
    for loc in NCR_LOCATIONS:
        if query in loc["name"].lower() or query in loc["city"].lower():
            return loc
            
    return NCR_LOCATIONS[0]

def get_current_aqi_for_location(loc: Dict[str, Any]) -> Dict[str, Any]:
    """Generates standardized CPCB AQI reading for a location."""
    pollutants = {
        "pm25": loc["base_pm25"],
        "pm10": loc["base_pm10"],
        "no2": loc["base_no2"],
        "o3": loc["base_o3"],
        "so2": 15.5,
        "co": 1.3
    }
    cpcb = calculate_cpcb_aqi(pollutants)
    
    return {
        "location_id": loc["id"],
        "location_name": loc["name"],
        "station_code": loc["station_code"],
        "latitude": loc["latitude"],
        "longitude": loc["longitude"],
        "timestamp": datetime.datetime.utcnow(),
        "aqi": cpcb["aqi"],
        "aqi_category": cpcb["category"],
        "dominant_pollutant": cpcb["dominant_pollutant"],
        "health_statement": cpcb["health_statement"],
        "advisory": cpcb["advisory"],
        "pollutants": pollutants,
        "sub_indices": cpcb["sub_indices"],
        "is_demo": True
    }

def get_current_weather_for_location(loc: Dict[str, Any]) -> Dict[str, Any]:
    """Generates standardized meteorological data for a location."""
    vi = calculate_ventilation_index(loc["base_pbl"], loc["base_wind"])
    cat = get_dispersion_category(vi)
    stability = determine_stability_class(loc["base_wind"], is_night=False)
    
    return {
        "location_id": loc["id"],
        "location_name": loc["name"],
        "timestamp": datetime.datetime.utcnow(),
        "temperature": loc["base_temp"],
        "humidity": 68.0,
        "pressure": 1012.4,
        "wind_speed": loc["base_wind"],
        "wind_direction": loc["base_wind_deg"],
        "wind_cardinal": degrees_to_cardinal(loc["base_wind_deg"]),
        "pbl_height": loc["base_pbl"],
        "ventilation_index": vi,
        "dispersion_category": cat["level"],
        "stability_class": stability,
        "is_demo": True
    }

def get_all_locations_with_current_data() -> List[Dict[str, Any]]:
    """Returns all locations with current AQI and weather for map markers."""
    result = []
    for loc in NCR_LOCATIONS:
        aqi_data = get_current_aqi_for_location(loc)
        weather_data = get_current_weather_for_location(loc)
        result.append({
            "id": loc["id"],
            "name": loc["name"],
            "city": loc["city"],
            "state": loc["state"],
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "station_code": loc["station_code"],
            "aqi": aqi_data["aqi"],
            "aqi_category": aqi_data["aqi_category"],
            "dominant_pollutant": aqi_data["dominant_pollutant"],
            "pm25": aqi_data["pollutants"]["pm25"],
            "pm10": aqi_data["pollutants"]["pm10"],
            "temperature": weather_data["temperature"],
            "wind_speed": weather_data["wind_speed"],
            "wind_cardinal": weather_data["wind_cardinal"],
            "pbl_height": weather_data["pbl_height"],
            "ventilation_index": weather_data["ventilation_index"],
            "dispersion_level": weather_data["dispersion_category"],
            "is_demo": True
        })
    return result
