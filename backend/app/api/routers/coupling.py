from fastapi import APIRouter, Query
from typing import Optional
from app.services.demo_data_service import get_location_by_id_or_name
from app.services.coupling_service import calculate_radiative_feedback
from app.schemas.all_schemas import CouplingSimulateRequest

router = APIRouter(prefix="/coupling", tags=["Weather-Pollution Coupling"])

@router.get("")
def get_current_coupling(location: Optional[str] = Query(None)):
    loc = get_location_by_id_or_name(location)
    inversion_active = loc["base_pbl"] < 450
    return calculate_radiative_feedback(
        wind_speed=loc["base_wind"],
        pbl_height=loc["base_pbl"],
        aerosol_pm25=loc["base_pm25"],
        inversion_layer=inversion_active
    )

@router.post("/simulate")
def simulate_coupling_feedback(payload: CouplingSimulateRequest):
    """Simulates radiative feedback loop and coupled PM2.5 entrapment under user-adjusted parameters."""
    return calculate_radiative_feedback(
        wind_speed=payload.wind_speed,
        pbl_height=payload.pbl_height,
        aerosol_pm25=payload.aerosol_pm25,
        inversion_layer=payload.inversion_layer
    )
