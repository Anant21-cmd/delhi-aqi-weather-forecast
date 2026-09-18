from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.demo_data_service import NCR_LOCATIONS, get_all_locations_with_current_data

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("", response_model=List[Dict[str, Any]])
def list_locations():
    """Returns all NCR monitoring locations with basic station metadata."""
    return [
        {
            "id": loc["id"],
            "name": loc["name"],
            "city": loc["city"],
            "state": loc["state"],
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "station_code": loc["station_code"],
            "is_active": loc["is_active"]
        }
        for loc in NCR_LOCATIONS
    ]

@router.get("/current-overview", response_model=List[Dict[str, Any]])
def get_locations_overview():
    """Returns all locations with real-time AQI and weather parameters for mapping and tabular display."""
    return get_all_locations_with_current_data()
