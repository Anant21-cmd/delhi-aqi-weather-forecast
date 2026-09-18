from fastapi import APIRouter
from app.services.fire_service import get_demo_fire_hotspots

router = APIRouter(prefix="/fire-hotspots", tags=["Regional Fire Detection"])

@router.get("")
def get_fire_hotspots():
    """Returns NASA FIRMS thermal anomaly hotspots with application-inferred agricultural burning likelihood."""
    return get_demo_fire_hotspots()
