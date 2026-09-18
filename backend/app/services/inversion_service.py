from typing import Dict, Any, List
import datetime

def generate_vertical_sounding(base_temp: float = 24.0, has_inversion: bool = True, inversion_strength: str = "Strong") -> List[Dict[str, Any]]:
    """
    Generates atmospheric vertical sounding data (altitude vs temperature and dew point)
    simulating radiosonde / NCMRWF numerical weather prediction sounding.
    """
    profile = []
    altitudes = [0, 100, 200, 300, 400, 600, 800, 1000, 1200, 1500, 2000, 2500, 3000]
    
    # Standard environmental lapse rate ~ -6.5 C per 1000m (-0.0065 C/m)
    current_temp = base_temp
    dew_point = base_temp - 6.0
    
    inversion_base = 200
    inversion_top = 600
    
    if inversion_strength == "Strong":
        delta_inversion = 4.8
    elif inversion_strength == "Moderate":
        delta_inversion = 2.4
    elif inversion_strength == "Weak":
        delta_inversion = 1.1
    else:
        delta_inversion = 0.0
        
    for alt in altitudes:
        if has_inversion and inversion_base <= alt <= inversion_top:
            # Temperature increases with altitude (thermal inversion lid)
            fraction = (alt - inversion_base) / (inversion_top - inversion_base)
            t = base_temp - (inversion_base * 0.0065) + (fraction * delta_inversion)
            dp = dew_point - (alt * 0.004)
        elif has_inversion and alt > inversion_top:
            # Above inversion, standard lapse rate resumes
            t_top = base_temp - (inversion_base * 0.0065) + delta_inversion
            t = t_top - ((alt - inversion_top) * 0.007)
            dp = dew_point - (alt * 0.005)
        else:
            # Below inversion or normal lapse rate
            t = base_temp - (alt * 0.0065)
            dp = dew_point - (alt * 0.0045)
            
        pot_temp = t + 273.15 + (alt * 0.0098)
        
        profile.append({
            "altitude": alt,
            "temperature": round(t, 2),
            "dew_point": round(dp, 2),
            "potential_temp": round(pot_temp, 2)
        })
        
    return profile

def analyze_inversion_conditions(
    location_name: str = "Delhi (Anand Vihar)",
    surface_temp: float = 24.5,
    pbl_height: float = 380.0,
    wind_speed: float = 1.8
) -> Dict[str, Any]:
    """
    Performs diagnostic analysis of atmospheric temperature inversion.
    """
    # Stagnant conditions with low wind and low PBL correlate with strong nocturnal/morning surface inversion
    if pbl_height < 450 and wind_speed < 2.2:
        status = "Strong"
        trapping_risk = "Severe"
        dispersion_condition = "Low / Stagnant"
        delta_temp = 4.2
        base_h = 180.0
        top_h = 550.0
        explanation = (
            "A strong low-level subsidence / radiative inversion is active between 180m and 550m above ground level. "
            "Because temperature increases with altitude (+4.2°C across the layer), warmer air sits directly atop colder surface air. "
            "This creates extreme static stability, completely shutting down vertical buoyant thermals and locking all vehicular and industrial "
            "particulate matter within a rigid boundary layer cap of just 380m."
        )
    elif pbl_height < 800 and wind_speed < 3.5:
        status = "Moderate"
        trapping_risk = "Moderate"
        dispersion_condition = "Moderate"
        delta_temp = 2.1
        base_h = 250.0
        top_h = 500.0
        explanation = (
            "A moderate temperature inversion is present between 250m and 500m. "
            "Vertical mixing is partially restricted, allowing gradual aerosol build-up during nocturnal hours. "
            "Anticipated daytime solar insolation should erode this inversion layer by early afternoon."
        )
    else:
        status = "Weak"
        trapping_risk = "Low"
        dispersion_condition = "Good"
        delta_temp = 0.8
        base_h = 400.0
        top_h = 550.0
        explanation = (
            "Weak or negligible inversion conditions. Atmospheric lapse rate remains near neutral to unstable. "
            "Convective mixing and moderate wind speeds provide adequate vertical and horizontal dilution."
        )
        
    sounding = generate_vertical_sounding(
        base_temp=surface_temp,
        has_inversion=(status != "None"),
        inversion_strength=status
    )
    
    depth = top_h - base_h
    lapse_rate = round((delta_temp / (depth / 1000.0)), 2) if depth > 0 else -6.5
    
    return {
        "location_name": location_name,
        "timestamp": datetime.datetime.utcnow(),
        "status": status,
        "base_height_m": base_h,
        "top_height_m": top_h,
        "depth_m": depth,
        "trapping_risk": trapping_risk,
        "dispersion_condition": dispersion_condition,
        "delta_temp": delta_temp,
        "lapse_rate": lapse_rate,
        "scientific_explanation": explanation,
        "sounding_profile": sounding,
        "is_demo": True
    }
