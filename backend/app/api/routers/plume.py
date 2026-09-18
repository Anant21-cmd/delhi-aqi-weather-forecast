from fastapi import APIRouter, Query
from typing import Optional
from app.services.plume_service import estimate_smoke_plume

router = APIRouter(prefix="/plume", tags=["Smoke Plume Prediction"])

@router.get("")
def get_plume_estimate(
    source_lat: Optional[float] = Query(30.245, description="Fire hotspot latitude"),
    source_lon: Optional[float] = Query(75.834, description="Fire hotspot longitude"),
    wind_speed: Optional[float] = Query(12.0, description="Wind speed in km/h"),
    wind_dir: Optional[float] = Query(315.0, description="Wind direction degrees (meteorological)")
):
    """Calculates forward smoke plume dispersion cone and Delhi NCR impact likelihood (MODEL ESTIMATE)."""
    return estimate_smoke_plume(
        source_lat=source_lat,
        source_lon=source_lon,
        wind_speed_kmh=wind_speed,
        wind_direction_deg=wind_dir
    )
