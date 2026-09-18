from fastapi import APIRouter, Query
from typing import Optional
from app.services.demo_data_service import (
    get_location_by_id_or_name,
    get_current_weather_for_location,
    get_current_aqi_for_location,
    get_all_locations_with_current_data
)
from app.services.dispersion_service import analyze_dispersion
from app.schemas.all_schemas import DispersionResponse

router = APIRouter(prefix="/dispersion", tags=["Pollution Dispersion"])

@router.get("", response_model=DispersionResponse)
@router.get("/", response_model=DispersionResponse)
def get_dispersion_status(location: Optional[str] = Query(None)):
    """
    Returns atmospheric dispersion and carrying capacity analysis,
    coupling meteorological ventilation with CPCB air quality and diurnal dynamics.
    """
    loc = get_location_by_id_or_name(location)
    weather = get_current_weather_for_location(loc)
    aqi_data = get_current_aqi_for_location(loc)
    all_stations = get_all_locations_with_current_data()
    
    inv_status = "Strong" if loc.get("base_pbl", 400) < 400 else "Moderate"
    
    return analyze_dispersion(
        location_name=loc["name"],
        wind_speed=weather["wind_speed"],
        pbl_height=weather["pbl_height"],
        inversion_status=inv_status,
        stability_class=weather["stability_class"],
        weather_data=weather,
        pollution_data=aqi_data,
        station_code=loc.get("station_code", "DL-ANV-01"),
        all_stations=all_stations
    )

