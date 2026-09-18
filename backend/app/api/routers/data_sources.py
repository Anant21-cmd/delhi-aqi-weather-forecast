from fastapi import APIRouter
from app.services.data_source_service import get_data_sources_status

router = APIRouter(prefix="/data-sources", tags=["Data Sources Status"])

@router.get("")
def list_data_sources():
    """Returns connectivity, coverage, latency, and quality status of all upstream data streams."""
    return get_data_sources_status()
