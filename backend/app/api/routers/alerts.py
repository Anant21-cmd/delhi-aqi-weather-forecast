from fastapi import APIRouter, Query, HTTPException, status
from typing import List, Dict, Any, Optional
from app.services.alert_service import get_system_alerts

router = APIRouter(prefix="/alerts", tags=["Alerts & Notifications"])

# In-memory store for alert read statuses during session
alerts_db = get_system_alerts()

@router.get("", response_model=List[Dict[str, Any]])
def list_alerts(severity: Optional[str] = Query(None)):
    if severity:
        return [a for a in alerts_db if a["severity"].lower() == severity.lower()]
    return alerts_db

@router.patch("/{alert_id}/read")
def mark_alert_read(alert_id: int):
    for a in alerts_db:
        if a["id"] == alert_id:
            a["is_read"] = True
            return {"status": "success", "alert_id": alert_id, "is_read": True}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

@router.post("/mark-all-read")
def mark_all_read():
    for a in alerts_db:
        a["is_read"] = True
    return {"status": "success", "message": "All alerts marked as read."}
