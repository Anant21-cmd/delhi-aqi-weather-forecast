import math
from typing import Dict, Any, List

def calculate_radiative_feedback(
    wind_speed: float,
    pbl_height: float,
    aerosol_pm25: float,
    inversion_layer: bool
) -> Dict[str, Any]:
    """
    Coupled Atmospheric-Chemical Radiative Feedback Model:
    
    1. Forward Coupling (Weather -> Pollution):
       - Ventilation index = PBLH * Wind
       - Stagnation factor inversely proportional to ventilation index.
       
    2. Reverse Radiative Feedback (Pollution -> Weather):
       - Aerosol Optical Depth (AOD) correlates with PM2.5 loading.
       - Solar Dimming: High aerosol loading scatters and absorbs downwelling solar radiation,
         reducing surface solar insolation by 15-50 W/m2 in Indo-Gangetic Plains.
       - Surface sensible heat flux decreases, curtailing thermal convection.
       - Consequently, daytime PBL growth is capped (boundary layer compression by 15-45%).
       - Shallower PBL further restricts the dilution volume, trapping more PM2.5 near breathing level.
    """
    # 1. Ventilation index
    vi = round(max(50.0, float(pbl_height) * float(wind_speed)), 1)
    
    # 2. Solar Dimming estimation (Watts/m2 reduction)
    # Baseline clear sky solar radiation ~ 650 W/m2 in Delhi autumn/winter daytime
    # Dimming scales with aerosol mass concentration
    dimming_watts = min(85.0, round(float(aerosol_pm25) * 0.22, 1))
    
    # 3. Boundary Layer Compression (% suppression of normal thermal expansion)
    # Higher aerosol loading + strong inversion leads to severe compression
    inversion_penalty = 18.0 if inversion_layer else 0.0
    dimming_suppression = min(35.0, (dimming_watts / 85.0) * 32.0)
    pbl_compression_pct = round(min(55.0, dimming_suppression + inversion_penalty), 1)
    
    # 4. Effective coupled PBL height under radiative suppression
    effective_pbl = round(pbl_height * (1.0 - (pbl_compression_pct / 100.0) * 0.45), 1)
    
    # 5. Resulting trapped concentration multiplier
    trapping_multiplier = 1.0 + (pbl_compression_pct / 100.0) * 0.75
    if wind_speed < 2.0:
        trapping_multiplier += 0.35
    
    coupled_pm25 = round(aerosol_pm25 * trapping_multiplier, 1)
    
    # Categorization
    if pbl_compression_pct > 35.0 and wind_speed < 2.5:
        trapping_severity = "Severe Radiative Trapping (Self-Reinforcing)"
        feedback_state = "Strong Positive Feedback Loop"
        summary = (
            "Vicious atmospheric cycle active: Thick PM2.5 blanket reflects solar radiation, "
            "cooling the ground and crushing daytime boundary layer expansion. "
            "Pollutants remain compressed into a narrow near-surface layer with calm winds."
        )
    elif pbl_compression_pct > 20.0 or wind_speed < 3.5:
        trapping_severity = "Moderate Aerosol Dimming & Suppression"
        feedback_state = "Moderate Feedback Active"
        summary = (
            "Substantial aerosol optical depth is partially diminishing surface insolation, "
            "limiting thermal lifting. Pollutants accumulate gradually unless wind speeds increase."
        )
    else:
        trapping_severity = "Minimal Radiative Feedback"
        feedback_state = "Normal Atmospheric Dispersion"
        summary = (
            "Boundary layer is developing normally. Solar heating is sufficient to drive "
            "vertical convective mixing, and wind ventilation prevents intense aerosol buildup."
        )
        
    return {
        "wind_speed": wind_speed,
        "pbl_height": pbl_height,
        "effective_pbl": effective_pbl,
        "aerosol_loading_pm25": aerosol_pm25,
        "coupled_pm25": coupled_pm25,
        "solar_attenuation_watts": dimming_watts,
        "boundary_layer_compression_pct": pbl_compression_pct,
        "ventilation_index": vi,
        "trapping_severity": trapping_severity,
        "feedback_state": feedback_state,
        "scientific_summary": summary,
        "feedback_steps": [
            {
                "step": 1,
                "title": "Aerosol Accumulation",
                "description": f"Current PM2.5 loading of {aerosol_pm25} µg/m³ forms a dense particulate layer over NCR.",
                "type": "cause"
            },
            {
                "step": 2,
                "title": "Solar Radiation Attenuation",
                "description": f"Downwelling solar insolation is reduced by ~{dimming_watts} W/m² due to Mie scattering and black carbon absorption.",
                "type": "mechanism"
            },
            {
                "step": 3,
                "title": "Suppression of Surface Sensible Heat Flux",
                "description": "Ground cooling prevents buoyant convective plumes from breaking the morning stability lid.",
                "type": "mechanism"
            },
            {
                "step": 4,
                "title": "Boundary Layer Compression",
                "description": f"Planetary Boundary Layer ceiling is depressed by ~{pbl_compression_pct}%, compressing the dilution volume.",
                "type": "effect"
            },
            {
                "step": 5,
                "title": "Self-Amplifying Trapping Loop",
                "description": f"Near-surface PM2.5 increases to ~{coupled_pm25} µg/m³, further intensifying solar dimming in a closed positive feedback loop.",
                "type": "feedback"
            }
        ]
    }
