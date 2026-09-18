from typing import Dict, Any, List

def get_historical_comparison(period_type: str = "today_vs_yesterday") -> Dict[str, Any]:
    """
    Returns comparative data between time periods or episodes.
    Supported periods:
    - today_vs_yesterday
    - week_vs_last_week
    - month_vs_last_month
    - episodic_post_diwali
    """
    if period_type == "week_vs_last_week":
        current_label = "Current Week (Mean)"
        previous_label = "Previous Week (Mean)"
        metrics = {
            "aqi": {"current": 328, "previous": 264, "unit": "", "delta": "+64", "delta_type": "worse"},
            "pm25": {"current": 204.5, "previous": 142.1, "unit": "µg/m³", "delta": "+62.4", "delta_type": "worse"},
            "pm10": {"current": 348.0, "previous": 272.5, "unit": "µg/m³", "delta": "+75.5", "delta_type": "worse"},
            "no2": {"current": 64.2, "previous": 58.0, "unit": "µg/m³", "delta": "+6.2", "delta_type": "worse"},
            "o3": {"current": 38.5, "previous": 42.0, "unit": "µg/m³", "delta": "-3.5", "delta_type": "better"},
            "temperature": {"current": 23.4, "previous": 26.1, "unit": "°C", "delta": "-2.7", "delta_type": "neutral"},
            "wind_speed": {"current": 1.9, "previous": 3.4, "unit": "m/s", "delta": "-1.5", "delta_type": "worse"},
            "fire_count": {"current": 840, "previous": 310, "unit": "hotspots", "delta": "+530", "delta_type": "worse"}
        }
        delta_summary = (
            "Air quality worsened significantly this week with an average AQI increase of +64 points (deteriorating from Poor to Very Poor). "
            "The deterioration is primarily attributed to a sharp 44% drop in average surface wind speed (from 3.4 m/s to 1.9 m/s) coupled with "
            "a 171% surge in active agricultural fire hotspots across Punjab and Haryana, which transported smoke into the NCR basin."
        )
        trend_series = [
            {"day": "Mon", "current_aqi": 290, "previous_aqi": 240, "current_pm25": 170, "previous_pm25": 130},
            {"day": "Tue", "current_aqi": 310, "previous_aqi": 255, "current_pm25": 192, "previous_pm25": 138},
            {"day": "Wed", "current_aqi": 325, "previous_aqi": 260, "current_pm25": 205, "previous_pm25": 142},
            {"day": "Thu", "current_aqi": 342, "previous_aqi": 275, "current_pm25": 218, "previous_pm25": 149},
            {"day": "Fri", "current_aqi": 338, "previous_aqi": 268, "current_pm25": 212, "previous_pm25": 144},
            {"day": "Sat", "current_aqi": 345, "previous_aqi": 280, "current_pm25": 220, "previous_pm25": 152},
            {"day": "Sun", "current_aqi": 336, "previous_aqi": 270, "current_pm25": 215, "previous_pm25": 140}
        ]
    elif period_type == "episodic_post_diwali":
        current_label = "Post-Diwali Smog Episode (Nov Peak)"
        previous_label = "Pre-Winter Baseline (Mid-October)"
        metrics = {
            "aqi": {"current": 448, "previous": 165, "unit": "", "delta": "+283", "delta_type": "worse"},
            "pm25": {"current": 395.0, "previous": 78.4, "unit": "µg/m³", "delta": "+316.6", "delta_type": "worse"},
            "pm10": {"current": 540.0, "previous": 185.0, "unit": "µg/m³", "delta": "+355.0", "delta_type": "worse"},
            "no2": {"current": 92.5, "previous": 45.2, "unit": "µg/m³", "delta": "+47.3", "delta_type": "worse"},
            "o3": {"current": 28.0, "previous": 54.0, "unit": "µg/m³", "delta": "-26.0", "delta_type": "better"},
            "temperature": {"current": 18.2, "previous": 28.5, "unit": "°C", "delta": "-10.3", "delta_type": "neutral"},
            "wind_speed": {"current": 1.1, "previous": 4.2, "unit": "m/s", "delta": "-3.1", "delta_type": "worse"},
            "fire_count": {"current": 2450, "previous": 85, "unit": "hotspots", "delta": "+2365", "delta_type": "worse"}
        }
        delta_summary = (
            "Comparison between the severe November stagnation episode and the clean pre-winter baseline illustrates the "
            "multiplicative impact of coupled meteorological locking: surface temperatures plummeted by 10.3°C, generating persistent "
            "subsidence inversions at <250m. When combined with near-zero wind speeds (1.1 m/s) and massive regional biomass burning, "
            "PM2.5 concentrations escalated by 404%, pushing NCR into the emergency Severe category (AQI 448)."
        )
        trend_series = [
            {"hour": "00:00", "current_aqi": 420, "previous_aqi": 150, "current_pm25": 360, "previous_pm25": 70},
            {"hour": "04:00", "current_aqi": 465, "previous_aqi": 158, "current_pm25": 415, "previous_pm25": 74},
            {"hour": "08:00", "current_aqi": 490, "previous_aqi": 180, "current_pm25": 440, "previous_pm25": 88},
            {"hour": "12:00", "current_aqi": 425, "previous_aqi": 160, "current_pm25": 370, "previous_pm25": 75},
            {"hour": "16:00", "current_aqi": 435, "previous_aqi": 155, "current_pm25": 380, "previous_pm25": 72},
            {"hour": "20:00", "current_aqi": 475, "previous_aqi": 172, "current_pm25": 425, "previous_pm25": 82}
        ]
    else: # today_vs_yesterday
        current_label = "Today (Current 24h Mean)"
        previous_label = "Yesterday (24h Mean)"
        metrics = {
            "aqi": {"current": 334, "previous": 288, "unit": "", "delta": "+46", "delta_type": "worse"},
            "pm25": {"current": 218.4, "previous": 172.0, "unit": "µg/m³", "delta": "+46.4", "delta_type": "worse"},
            "pm10": {"current": 365.2, "previous": 308.1, "unit": "µg/m³", "delta": "+57.1", "delta_type": "worse"},
            "no2": {"current": 71.0, "previous": 64.5, "unit": "µg/m³", "delta": "+6.5", "delta_type": "worse"},
            "o3": {"current": 36.2, "previous": 39.8, "unit": "µg/m³", "delta": "-3.6", "delta_type": "better"},
            "temperature": {"current": 24.1, "previous": 25.3, "unit": "°C", "delta": "-1.2", "delta_type": "neutral"},
            "wind_speed": {"current": 1.7, "previous": 2.6, "unit": "m/s", "delta": "-0.9", "delta_type": "worse"},
            "fire_count": {"current": 142, "previous": 98, "unit": "hotspots", "delta": "+44", "delta_type": "worse"}
        }
        delta_summary = (
            "Today's air quality deteriorated by +46 AQI points compared to yesterday, crossing the threshold into the 'Very Poor' category. "
            "The drop in surface wind speed from 2.6 m/s to 1.7 m/s reduced boundary layer ventilation by 35%, trapping overnight emissions. "
            "An increase in regional fire detections (+44 hotspots) also augmented particulate inflow."
        )
        trend_series = [
            {"time": "00:00", "current_aqi": 310, "previous_aqi": 270, "current_pm25": 195, "previous_pm25": 160},
            {"time": "04:00", "current_aqi": 345, "previous_aqi": 295, "current_pm25": 230, "previous_pm25": 178},
            {"time": "08:00", "current_aqi": 365, "previous_aqi": 315, "current_pm25": 248, "previous_pm25": 195},
            {"time": "12:00", "current_aqi": 320, "previous_aqi": 280, "current_pm25": 205, "previous_pm25": 165},
            {"time": "16:00", "current_aqi": 315, "previous_aqi": 275, "current_pm25": 200, "previous_pm25": 162},
            {"time": "20:00", "current_aqi": 350, "previous_aqi": 290, "current_pm25": 232, "previous_pm25": 172}
        ]
        
    return {
        "period_type": period_type,
        "current_label": current_label,
        "previous_label": previous_label,
        "metrics": metrics,
        "delta_summary": delta_summary,
        "trend_series": trend_series
    }
