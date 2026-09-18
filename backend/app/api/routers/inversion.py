from fastapi import APIRouter, Query
from typing import Optional
from app.services.demo_data_service import get_location_by_id_or_name
from app.services.inversion_service import analyze_inversion_conditions

router = APIRouter(prefix="/inversion", tags=["Atmospheric Inversion"])

@router.get("")
def get_inversion_status(location: Optional[str] = Query(None)):
    loc = get_location_by_id_or_name(location)
    return analyze_inversion_conditions(
        location_name=loc["name"],
        surface_temp=loc["base_temp"],
        pbl_height=loc["base_pbl"],
        wind_speed=loc["base_wind"]
    )
