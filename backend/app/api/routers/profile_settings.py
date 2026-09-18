from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import User
from app.auth.security import get_current_user
from app.schemas.all_schemas import UserProfile, ProfileUpdateRequest
from typing import Optional, Dict, Any

router = APIRouter(tags=["Profile & Settings"])

# Default mock profile for guest/demo browsing
GUEST_PROFILE = {
    "id": 1,
    "name": "MoES Researcher / Citizen User",
    "email": "analyst@moes.gov.in",
    "preferred_location": "Delhi (Anand Vihar)",
    "notification_enabled": True,
    "aqi_threshold": 250,
    "health_advisory_pref": "Sensitive Groups"
}

@router.get("/profile", response_model=UserProfile)
def get_profile(user: Optional[User] = Depends(get_current_user)):
    if user:
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "preferred_location": user.preferred_location,
            "notification_enabled": user.notification_enabled,
            "aqi_threshold": user.aqi_threshold,
            "health_advisory_pref": user.health_advisory_pref
        }
    return GUEST_PROFILE

@router.put("/profile", response_model=UserProfile)
def update_profile(
    payload: ProfileUpdateRequest,
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user:
        if payload.name is not None:
            user.name = payload.name
        if payload.preferred_location is not None:
            user.preferred_location = payload.preferred_location
        if payload.notification_enabled is not None:
            user.notification_enabled = payload.notification_enabled
        if payload.aqi_threshold is not None:
            user.aqi_threshold = payload.aqi_threshold
        if payload.health_advisory_pref is not None:
            user.health_advisory_pref = payload.health_advisory_pref
            
        db.commit()
        db.refresh(user)
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "preferred_location": user.preferred_location,
            "notification_enabled": user.notification_enabled,
            "aqi_threshold": user.aqi_threshold,
            "health_advisory_pref": user.health_advisory_pref
        }
    else:
        # Update guest in-memory state
        if payload.name is not None:
            GUEST_PROFILE["name"] = payload.name
        if payload.preferred_location is not None:
            GUEST_PROFILE["preferred_location"] = payload.preferred_location
        if payload.notification_enabled is not None:
            GUEST_PROFILE["notification_enabled"] = payload.notification_enabled
        if payload.aqi_threshold is not None:
            GUEST_PROFILE["aqi_threshold"] = payload.aqi_threshold
        if payload.health_advisory_pref is not None:
            GUEST_PROFILE["health_advisory_pref"] = payload.health_advisory_pref
        return GUEST_PROFILE

@router.get("/settings")
def get_settings(user: Optional[User] = Depends(get_current_user)):
    p = get_profile(user)
    return {
        "preferred_location": p.preferred_location,
        "notification_enabled": p.notification_enabled,
        "aqi_threshold": p.aqi_threshold,
        "health_advisory_pref": p.health_advisory_pref,
        "theme": "scientific_light",
        "demo_mode": True
    }

@router.put("/settings")
def update_settings(
    payload: ProfileUpdateRequest,
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = update_profile(payload, user, db)
    return {
        "status": "success",
        "message": "Settings updated successfully.",
        "settings": updated
    }
