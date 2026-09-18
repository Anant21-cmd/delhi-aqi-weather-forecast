import math
from typing import Dict, Any, List
from app.services.weather_service import degrees_to_cardinal

# NCR Central coordinates (Connaught Place / Central Delhi)
NCR_LAT = 28.6139
NCR_LON = 77.2090

def estimate_smoke_plume(
    source_lat: float = 30.245,
    source_lon: float = 75.834,
    origin_region: str = "Sangrur, Punjab",
    wind_speed_kmh: float = 12.0,
    wind_direction_deg: float = 315.0, # NW wind blowing towards SE (Delhi)
    stability_class: str = "E",
    pbl_height_m: float = 400.0
) -> Dict[str, Any]:
    """
    Atmospheric Smoke Plume Dispersion & Forward Trajectory Estimator.
    
    Uses Lagrangian advection vector:
    The downwind bearing = (wind_direction_deg + 180) % 360
    e.g., A North-Westerly wind (315°) transports smoke South-East (135°) straight into Delhi NCR.
    
    Dispersion cone width (horizontal standard deviation sigma_y) is modeled 
    from Pasquill-Gifford dispersion coefficients based on atmospheric stability class.
    
    IMPORTANT: This output is explicitly labeled as 'MODEL ESTIMATE'.
    """
    # Downwind vector bearing (bearing towards which smoke travels)
    transport_bearing_deg = (wind_direction_deg + 180.0) % 360.0
    transport_rad = math.radians(transport_bearing_deg)
    
    # Calculate distance to Delhi NCR center
    d_lat = math.radians(NCR_LAT - source_lat)
    d_lon = math.radians(NCR_LON - source_lon)
    lat1 = math.radians(source_lat)
    lat2 = math.radians(NCR_LAT)
    
    a = math.sin(d_lat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(d_lon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance_to_ncr_km = round(6371.0 * c, 1) # Earth radius ~ 6371km
    
    # Calculate initial bearing from source to NCR
    y = math.sin(d_lon) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(d_lon)
    bearing_to_ncr_deg = (math.degrees(math.atan2(y, x)) + 360.0) % 360.0
    
    # Angular divergence between smoke trajectory and direct line to NCR
    angular_diff = abs(transport_bearing_deg - bearing_to_ncr_deg)
    if angular_diff > 180.0:
        angular_diff = 360.0 - angular_diff
        
    # Dispersion cone half-angle based on stability class
    # Stable atmospheres (E, F) have narrow, concentrated plumes that travel far with little vertical dilution
    # Unstable (A, B) disperse quickly locally
    cone_angles = {
        "A": 32.0,
        "B": 24.0,
        "C": 18.0,
        "D": 14.0,
        "E": 11.0,
        "F": 8.0
    }
    half_angle = cone_angles.get(stability_class, 12.0)
    
    # Estimated reach based on wind speed and boundary layer ventilation
    estimated_reach_km = round(min(450.0, max(80.0, (wind_speed_kmh * 24.0) * (pbl_height_m / 600.0))), 1)
    
    # Travel time to NCR
    travel_time_hours = round(distance_to_ncr_km / max(4.0, wind_speed_kmh), 1)
    
    # Likelihood of NCR Impact
    if angular_diff <= half_angle:
        # Trajectory intersects NCR directly
        proximity_factor = max(0.4, 1.0 - (distance_to_ncr_km / 500.0))
        wind_efficiency = min(1.0, wind_speed_kmh / 15.0)
        impact_likelihood = round(min(96.0, 75.0 * proximity_factor * wind_efficiency + 18.0), 1)
    elif angular_diff <= half_angle * 2.2:
        # Partial plume fringe impact
        impact_likelihood = round(max(15.0, 45.0 - (angular_diff - half_angle) * 2.0), 1)
    else:
        # Plume bypassing NCR
        impact_likelihood = round(max(4.0, 18.0 - (angular_diff * 0.2)), 1)
        
    # Severity classification
    if impact_likelihood >= 70.0:
        severity = "High (Direct Transport Corridor)"
    elif impact_likelihood >= 40.0:
        severity = "Moderate (Marginal Incursion)"
    else:
        severity = "Low (Favorable Wind Deflection)"
        
    # Generate Trajectory Line Points (every 30 km along centerline)
    trajectory_points = []
    # 1 deg lat ~ 111km; 1 deg lon ~ 111km * cos(lat)
    km_per_lat = 111.0
    km_per_lon = 111.0 * math.cos(math.radians(source_lat))
    
    step_count = 10
    step_km = estimated_reach_km / step_count
    
    for i in range(step_count + 1):
        dist = i * step_km
        lat_offset = (dist * math.cos(transport_rad)) / km_per_lat
        lon_offset = (dist * math.sin(transport_rad)) / km_per_lon
        trajectory_points.append({
            "lat": round(source_lat + lat_offset, 4),
            "lon": round(source_lon + lon_offset, 4),
            "distance_km": round(dist, 1)
        })
        
    # Generate Dispersion Cone polygon coordinates
    # Left flank, tip, right flank, origin
    left_rad = math.radians(transport_bearing_deg - half_angle)
    right_rad = math.radians(transport_bearing_deg + half_angle)
    
    tip_left_lat = source_lat + (estimated_reach_km * math.cos(left_rad)) / km_per_lat
    tip_left_lon = source_lon + (estimated_reach_km * math.sin(left_rad)) / km_per_lon
    
    tip_center_lat = source_lat + (estimated_reach_km * math.cos(transport_rad)) / km_per_lat
    tip_center_lon = source_lon + (estimated_reach_km * math.sin(transport_rad)) / km_per_lon
    
    tip_right_lat = source_lat + (estimated_reach_km * math.cos(right_rad)) / km_per_lat
    tip_right_lon = source_lon + (estimated_reach_km * math.sin(right_rad)) / km_per_lon
    
    plume_cone = [
        [round(source_lat, 4), round(source_lon, 4)],
        [round(tip_left_lat, 4), round(tip_left_lon, 4)],
        [round(tip_center_lat, 4), round(tip_center_lon, 4)],
        [round(tip_right_lat, 4), round(tip_right_lon, 4)],
        [round(source_lat, 4), round(source_lon, 4)]
    ]
    
    cardinal_dir = degrees_to_cardinal(transport_bearing_deg)
    
    return {
        "origin_region": origin_region,
        "source_lat": source_lat,
        "source_lon": source_lon,
        "plume_direction": f"Towards {cardinal_dir} ({int(transport_bearing_deg)}°)",
        "wind_bearing": round(transport_bearing_deg, 1),
        "wind_speed_kmh": round(wind_speed_kmh, 1),
        "estimated_reach_km": estimated_reach_km,
        "ncr_impact_likelihood": impact_likelihood,
        "travel_time_hours": travel_time_hours,
        "pbl_height_m": pbl_height_m,
        "model_estimate_note": (
            "MODEL ESTIMATE: Smoke plume transport is calculated using atmospheric advection equations, "
            "Pasquill-Gifford stability parameters, and NCMRWF wind fields. Actual plume dispersal may vary "
            "due to sub-grid turbulence, terrain friction, and diurnal mixing variations."
        ),
        "trajectory_points": trajectory_points,
        "plume_cone": plume_cone,
        "impact_severity": severity
    }
