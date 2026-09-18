from fastapi import APIRouter, Query
from typing import Optional, Dict, Any, List
import datetime
from app.services.demo_data_service import get_location_by_id_or_name, get_current_weather_for_location
from app.services.weather_service import degrees_to_cardinal, calculate_ventilation_index, get_dispersion_category

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/current")
def get_current_weather(location: Optional[str] = Query(None)):
    loc = get_location_by_id_or_name(location)
    return get_current_weather_for_location(loc)

@router.get("/forecast")
def get_weather_forecast(location: Optional[str] = Query(None)):
    loc = get_location_by_id_or_name(location)
    now = datetime.datetime.utcnow()
    
    # 72-hour 6-hourly meteorological forecast series
    points = []
    base_t = loc["base_temp"]
    base_w = loc["base_wind"]
    base_pbl = loc["base_pbl"]
    
    for h in range(0, 73, 6):
        # Temperature diurnal swing
        t_swing = base_t + 4.0 * (1.0 if (h % 24) in (6, 12) else -1.0)
        # Wind trend (projected pickup after 48h)
        w_factor = 1.0 if h < 48 else 1.6
        w_speed = round(base_w * w_factor, 1)
        pbl_h = round(base_pbl * (0.85 if h < 48 else 1.4), 1)
        vi = calculate_ventilation_index(pbl_h, w_speed)
        
        points.append({
            "hour": f"+{h}h",
            "timestamp": now + datetime.timedelta(hours=h),
            "temperature": round(t_swing, 1),
            "humidity": 65.0,
            "wind_speed": w_speed,
            "wind_direction": loc["base_wind_deg"],
            "wind_cardinal": degrees_to_cardinal(loc["base_wind_deg"]),
            "pbl_height": pbl_h,
            "ventilation_index": vi,
            "dispersion_level": get_dispersion_category(vi)["level"]
        })
        
    return {
        "location_name": loc["name"],
        "forecast_series": points,
        "synoptic_summary": (
            "Weak North-Westerly wind regime dominates the Indo-Gangetic Plains for the next 48 hours. "
            "Boundary layer heights will contract below 400m during nocturnal hours. "
            "A gradual increase in boundary layer wind shear is anticipated by day 3, improving ventilation."
        )
    }
