from fastapi import APIRouter, Query
from typing import Optional
from app.services.demo_data_service import get_location_by_id_or_name
from app.services.analysis_service import generate_insights_analysis

router = APIRouter(prefix="/analysis", tags=["Cause-Based Analysis & Insights"])

@router.get("")
def get_insights(location: Optional[str] = Query(None)):
    loc = get_location_by_id_or_name(location)
    inv_status = "Strong" if loc["base_pbl"] < 400 else "Moderate"
    return generate_insights_analysis(
        location_name=loc["name"],
        aqi=int(loc["base_pm25"] * 1.4),
        pm25=loc["base_pm25"],
        wind_speed=loc["base_wind"],
        pbl_height=loc["base_pbl"],
        inversion_status=inv_status,
        fire_count=142,
        impact_likelihood=72.0
    )
