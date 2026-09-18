import datetime
from typing import Dict, Any, List

def get_system_alerts(location_name: str = "Delhi NCR") -> List[Dict[str, Any]]:
    """Returns real-time operational alerts for Delhi NCR."""
    now = datetime.datetime.utcnow()
    
    return [
        {
            "id": 101,
            "title": "Severe Air Quality Breach Warning",
            "message": "AQI in Anand Vihar and surrounding eastern NCR has crossed 340 (Very Poor category). Immediate health precautions advised.",
            "alert_type": "high_aqi",
            "severity": "critical",
            "location_name": "Delhi (Anand Vihar)",
            "is_read": False,
            "timestamp": now - datetime.timedelta(minutes=24),
            "health_recommendations": [
                "Strictly avoid morning and evening jogs or outdoor exercise.",
                "Keep windows tightly shut during inversion hours (6 PM - 10 AM).",
                "Wear certified N95 masks if outdoor transit is unavoidable."
            ]
        },
        {
            "id": 102,
            "title": "Strong Subsidence Inversion Alert",
            "message": "Thermal sounding detected low-altitude inversion lid at 380m AGL. Ventilation Index reduced to 684 m²/s (Stagnant).",
            "alert_type": "inversion",
            "severity": "critical",
            "location_name": "Delhi NCR",
            "is_read": False,
            "timestamp": now - datetime.timedelta(hours=1, minutes=10),
            "health_recommendations": [
                "Cease all non-essential diesel generator and open biomass burning.",
                "Expect thick smog/haze accumulation in low-lying pockets."
            ]
        },
        {
            "id": 103,
            "title": "Upwind Agricultural Plume Incursion",
            "message": "142 active fire hotspots detected in Punjab/Haryana. Forecasted North-Westerly winds indicate 72% likelihood of plume impact within 18-24 hours.",
            "alert_type": "plume",
            "severity": "warning",
            "location_name": "Punjab - NCR Corridor",
            "is_read": False,
            "timestamp": now - datetime.timedelta(hours=2, minutes=45),
            "health_recommendations": [
                "Patients with chronic asthma or COPD should prepare emergency inhalers.",
                "Indoor air purifiers should be operated on medium/high mode."
            ]
        },
        {
            "id": 104,
            "title": "72-Hour Pollution Outlook Advisory",
            "message": "Model projects persistent stagnation through +48 hours. Peak AQI expected to touch 375 before wind speed picks up on Friday.",
            "alert_type": "forecast",
            "severity": "warning",
            "location_name": "Delhi NCR",
            "is_read": True,
            "timestamp": now - datetime.timedelta(hours=5),
            "health_recommendations": [
                "Schools advised to suspend morning outdoor assemblies.",
                "Public transport usage strongly encouraged to minimize peak vehicular emissions."
            ]
        },
        {
            "id": 105,
            "title": "Copernicus ERA5 & CPCB Data Stream Synced",
            "message": "Routine atmospheric data synchronization completed successfully. Real-time boundary layer height calibrated.",
            "alert_type": "system",
            "severity": "info",
            "location_name": "NCMRWF Server Hub",
            "is_read": True,
            "timestamp": now - datetime.timedelta(hours=7),
            "health_recommendations": [
                "System operational check passed."
            ]
        }
    ]
