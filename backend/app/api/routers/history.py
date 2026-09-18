from fastapi import APIRouter, Query
from app.services.history_service import get_historical_comparison

router = APIRouter(prefix="/history", tags=["Historical Comparison"])

@router.get("")
def get_history(period: str = Query("today_vs_yesterday", description="today_vs_yesterday | week_vs_last_week | episodic_post_diwali")):
    return get_historical_comparison(period)
