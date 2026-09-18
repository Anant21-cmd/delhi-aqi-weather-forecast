from fastapi import APIRouter, Query
from typing import Optional, Dict, Any
from app.services.demo_data_service import get_location_by_id_or_name, get_current_aqi_for_location
from app.services.forecasting.forecast_engine import generate_72h_forecast
from app.services.aqi_service import calculate_cpcb_aqi

router = APIRouter(prefix="/aqi", tags=["Air Quality"])

@router.get("/current")
def get_current_aqi(location: Optional[str] = Query(None, description="Location ID or Name")):
    loc = get_location_by_id_or_name(location)
    return get_current_aqi_for_location(loc)

@router.get("/forecast")
def get_aqi_forecast(location: Optional[str] = Query(None, description="Location ID or Name")):
    loc = get_location_by_id_or_name(location)
    return generate_72h_forecast(
        location_id=loc["id"],
        location_name=loc["name"],
        current_pm25=loc["base_pm25"],
        current_pm10=loc["base_pm10"],
        current_no2=loc["base_no2"],
        current_o3=loc["base_o3"],
        wind_speed=loc["base_wind"],
        pbl_height=loc["base_pbl"],
        fire_impact_likelihood=72.0
    )

@router.post("/calculate")
def calculate_custom_aqi(pollutants: Dict[str, float]):
    """Calculates official CPCB sub-indices and overall AQI for custom input values."""
    return calculate_cpcb_aqi(pollutants)
