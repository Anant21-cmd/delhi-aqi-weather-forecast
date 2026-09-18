import datetime
from typing import Dict, Any, List

# Agricultural districts of Punjab and Haryana known for seasonal crop residue burning
AGRI_DISTRICTS = {
    "Punjab": [
        "Sangrur", "Bathinda", "Firozpur", "Mansa", "Tarn Taran", "Patiala", 
        "Ludhiana", "Moga", "Amritsar", "Barnala", "Muktsar", "Kapurthala"
    ],
    "Haryana": [
        "Karnal", "Kurukshetra", "Kaithal", "Fatehabad", "Sirsa", "Ambala", "Jind"
    ],
    "NCR & Surroundings": [
        "Panipat", "Sonipat", "Rohtak", "Meerut", "Bulandshahr"
    ]
}

def calculate_agri_burning_likelihood(
    lat: float,
    lon: float,
    frp: float,
    month: int = 10,
    confidence: int = 80,
    nearby_cluster_count: int = 4
) -> float:
    """
    Computes application-inferred agricultural burning likelihood score (0 - 100%).
    
    IMPORTANT: NASA FIRMS satellites only detect thermal anomalies and do NOT classify 
    land-use type or fire source. This score is an independent statistical inference 
    derived from:
    1. Spatial crop masking (Punjab/Haryana agricultural grid: 29.5N - 32.5N, 74.0E - 77.0E)
    2. Seasonal harvesting window:
       - Post-monsoon Kharif paddy stubble: Oct 15 - Nov 30 (Peak weight)
       - Pre-monsoon Rabi wheat residue: Apr 15 - May 25 (Secondary peak)
    3. Fire Radiative Power (FRP): Typical crop residue fires range from 10 to 120 MW.
    4. Spatial clustering: Farmers often burn simultaneously across contiguous field blocks.
    """
    score = 0.0
    
    # 1. Geographic bounds check for Punjab / Haryana agricultural belt
    in_punjab_box = (29.8 <= lat <= 32.5) and (74.2 <= lon <= 76.8)
    in_haryana_box = (28.8 <= lat <= 30.8) and (75.5 <= lon <= 77.4)
    
    if in_punjab_box:
        score += 35.0
    elif in_haryana_box:
        score += 30.0
    else:
        score += 10.0
        
    # 2. Seasonality factor
    # Month 10 (Oct) and 11 (Nov) are peak Kharif burning
    # Month 4 (Apr) and 5 (May) are peak Rabi burning
    if month in (10, 11):
        score += 35.0
    elif month in (4, 5):
        score += 25.0
    elif month in (12, 1, 9):
        score += 12.0
    else:
        score += 5.0
        
    # 3. Fire Radiative Power (FRP) profile
    # Biomass fires typically emit between 15 - 90 MW; very high FRP (> 300 MW) is usually industrial/gas flare
    if 15.0 <= frp <= 120.0:
        score += 15.0
    elif frp > 120.0:
        score += 8.0
    else:
        score += 5.0
        
    # 4. Spatial clustering density
    cluster_bonus = min(15.0, nearby_cluster_count * 3.5)
    score += cluster_bonus
    
    # Scale with satellite detection confidence
    confidence_scale = confidence / 100.0
    final_score = round(min(98.0, max(5.0, score * confidence_scale)), 1)
    
    return final_score

def get_demo_fire_hotspots() -> Dict[str, Any]:
    """Generates realistic NASA FIRMS fire hotspots across NW India agricultural belt."""
    now = datetime.datetime.utcnow()
    
    hotspots = [
        # Punjab (High intensity cluster)
        {"id": 1, "latitude": 30.245, "longitude": 75.834, "satellite": "VIIRS-SNPP", "frp": 48.6, "confidence": 92, "region": "Punjab", "district": "Sangrur", "cluster": 5},
        {"id": 2, "latitude": 30.198, "longitude": 75.912, "satellite": "VIIRS-NOAA20", "frp": 62.4, "confidence": 95, "region": "Punjab", "district": "Sangrur", "cluster": 5},
        {"id": 3, "latitude": 30.211, "longitude": 75.875, "satellite": "MODIS-Aqua", "frp": 39.1, "confidence": 88, "region": "Punjab", "district": "Sangrur", "cluster": 5},
        {"id": 4, "latitude": 30.342, "longitude": 75.452, "satellite": "VIIRS-SNPP", "frp": 55.0, "confidence": 90, "region": "Punjab", "district": "Bathinda", "cluster": 4},
        {"id": 5, "latitude": 30.289, "longitude": 75.388, "satellite": "VIIRS-NOAA20", "frp": 44.2, "confidence": 86, "region": "Punjab", "district": "Bathinda", "cluster": 4},
        {"id": 6, "latitude": 31.124, "longitude": 75.210, "satellite": "VIIRS-SNPP", "frp": 33.7, "confidence": 84, "region": "Punjab", "district": "Firozpur", "cluster": 3},
        {"id": 7, "latitude": 30.589, "longitude": 76.120, "satellite": "MODIS-Terra", "frp": 51.3, "confidence": 91, "region": "Punjab", "district": "Patiala", "cluster": 4},
        {"id": 8, "latitude": 30.892, "longitude": 75.765, "satellite": "VIIRS-SNPP", "frp": 29.8, "confidence": 78, "region": "Punjab", "district": "Ludhiana", "cluster": 2},
        {"id": 9, "latitude": 31.420, "longitude": 74.980, "satellite": "VIIRS-NOAA20", "frp": 41.5, "confidence": 89, "region": "Punjab", "district": "Tarn Taran", "cluster": 3},
        {"id": 10, "latitude": 29.980, "longitude": 75.390, "satellite": "VIIRS-SNPP", "frp": 67.2, "confidence": 94, "region": "Punjab", "district": "Mansa", "cluster": 4},
        
        # Haryana
        {"id": 11, "latitude": 29.685, "longitude": 76.985, "satellite": "VIIRS-SNPP", "frp": 42.1, "confidence": 91, "region": "Haryana", "district": "Karnal", "cluster": 4},
        {"id": 12, "latitude": 29.712, "longitude": 76.940, "satellite": "VIIRS-NOAA20", "frp": 38.4, "confidence": 87, "region": "Haryana", "district": "Karnal", "cluster": 4},
        {"id": 13, "latitude": 29.965, "longitude": 76.880, "satellite": "MODIS-Aqua", "frp": 46.8, "confidence": 89, "region": "Haryana", "district": "Kurukshetra", "cluster": 3},
        {"id": 14, "latitude": 29.805, "longitude": 76.402, "satellite": "VIIRS-SNPP", "frp": 35.6, "confidence": 83, "region": "Haryana", "district": "Kaithal", "cluster": 3},
        {"id": 15, "latitude": 29.512, "longitude": 75.450, "satellite": "VIIRS-NOAA20", "frp": 50.2, "confidence": 90, "region": "Haryana", "district": "Fatehabad", "cluster": 3},
        {"id": 16, "latitude": 29.530, "longitude": 75.025, "satellite": "VIIRS-SNPP", "frp": 27.5, "confidence": 76, "region": "Haryana", "district": "Sirsa", "cluster": 2},
        
        # NCR / Western UP Border
        {"id": 17, "latitude": 29.390, "longitude": 76.965, "satellite": "VIIRS-SNPP", "frp": 31.0, "confidence": 82, "region": "Haryana", "district": "Panipat", "cluster": 2},
        {"id": 18, "latitude": 28.980, "longitude": 77.010, "satellite": "MODIS-Terra", "frp": 22.4, "confidence": 75, "region": "Haryana", "district": "Sonipat", "cluster": 1},
        {"id": 19, "latitude": 28.995, "longitude": 77.710, "satellite": "VIIRS-SNPP", "frp": 28.9, "confidence": 79, "region": "Uttar Pradesh", "district": "Meerut", "cluster": 1},
        {"id": 20, "latitude": 28.410, "longitude": 77.820, "satellite": "VIIRS-NOAA20", "frp": 25.1, "confidence": 77, "region": "Uttar Pradesh", "district": "Bulandshahr", "cluster": 1}
    ]
    
    processed = []
    punjab_count = 0
    haryana_count = 0
    ncr_count = 0
    total_frp = 0.0
    high_agri_count = 0
    
    current_month = now.month
    
    for h in hotspots:
        likelihood = calculate_agri_burning_likelihood(
            lat=h["latitude"],
            lon=h["longitude"],
            frp=h["frp"],
            month=current_month,
            confidence=h["confidence"],
            nearby_cluster_count=h["cluster"]
        )
        if h["region"] == "Punjab":
            punjab_count += 1
        elif h["region"] == "Haryana":
            haryana_count += 1
        else:
            ncr_count += 1
            
        total_frp += h["frp"]
        if likelihood >= 70.0:
            high_agri_count += 1
            
        processed.append({
            "id": h["id"],
            "latitude": h["latitude"],
            "longitude": h["longitude"],
            "acq_time": now - datetime.timedelta(hours=(h["id"] * 0.4)),
            "satellite": h["satellite"],
            "frp": h["frp"],
            "confidence": h["confidence"],
            "region": h["region"],
            "district": h["district"],
            "agri_burning_likelihood": likelihood,
            "is_demo": True
        })
        
    avg_frp = round(total_frp / len(hotspots), 1) if hotspots else 0.0
    
    return {
        "total_count": len(hotspots),
        "punjab_count": punjab_count,
        "haryana_count": haryana_count,
        "ncr_count": ncr_count,
        "avg_frp": avg_frp,
        "high_likelihood_agri_count": high_agri_count,
        "inference_disclaimer": (
            "NOTICE: NASA FIRMS provides thermal anomaly detection via MODIS and VIIRS satellite sensors. "
            "The 'Agricultural Burning Likelihood' is an application-inferred statistical likelihood calculated "
            "by this system using geographic crop masking, harvesting calendar windows, FRP intensity, and spatial "
            "clustering. It is not an official or certified NASA FIRMS classification."
        ),
        "hotspots": processed
    }
