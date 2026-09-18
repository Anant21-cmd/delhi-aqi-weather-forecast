from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Auth Schemas
class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    preferred_location: str
    notification_enabled: bool
    aqi_threshold: int
    health_advisory_pref: str

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    preferred_location: Optional[str] = None
    notification_enabled: Optional[bool] = None
    aqi_threshold: Optional[int] = None
    health_advisory_pref: Optional[str] = None

# Location Schema
class LocationItem(BaseModel):
    id: int
    name: str
    city: str
    state: str
    latitude: float
    longitude: float
    station_code: str
    is_active: bool

# AQI & Pollutant Schemas
class PollutantBreakdown(BaseModel):
    pm25: float
    pm10: float
    o3: float
    no2: float
    so2: float
    co: float

class SubIndices(BaseModel):
    pm25: int
    pm10: int
    o3: int
    no2: int
    so2: int
    co: int

class CurrentAQIResponse(BaseModel):
    location_id: int
    location_name: str
    station_code: str
    latitude: float
    longitude: float
    timestamp: datetime
    aqi: int
    aqi_category: str
    dominant_pollutant: str
    health_statement: str
    advisory: str
    pollutants: PollutantBreakdown
    sub_indices: SubIndices
    is_demo: bool = True

# Weather Schemas
class CurrentWeatherResponse(BaseModel):
    location_id: int
    location_name: str
    timestamp: datetime
    temperature: float
    humidity: float
    pressure: float
    wind_speed: float
    wind_direction: float
    wind_cardinal: str
    pbl_height: float
    ventilation_index: float
    dispersion_category: str
    stability_class: str
    is_demo: bool = True

# Coupling & Feedback Schemas
class CouplingMetrics(BaseModel):
    wind_speed: float
    pbl_height: float
    inversion_strength: str
    aerosol_loading_pm25: float
    solar_attenuation_watts: float
    boundary_layer_compression_pct: float
    ventilation_index: float
    trapping_severity: str
    feedback_state: str
    scientific_summary: str

class CouplingSimulateRequest(BaseModel):
    wind_speed: float
    pbl_height: float
    aerosol_pm25: float
    inversion_layer: bool

# Inversion Schemas
class SoundingPoint(BaseModel):
    altitude: int # meters
    temperature: float # Celsius
    dew_point: float # Celsius
    potential_temp: float # Kelvin

class InversionResponse(BaseModel):
    location_name: str
    timestamp: datetime
    status: str # Weak, Moderate, Strong, None
    base_height_m: float
    top_height_m: float
    depth_m: float
    trapping_risk: str
    dispersion_condition: str
    delta_temp: float
    lapse_rate: float
    scientific_explanation: str
    sounding_profile: List[SoundingPoint]
    is_demo: bool = True

# Fire Hotspot Schemas
class FireHotspotItem(BaseModel):
    id: int
    latitude: float
    longitude: float
    acq_time: datetime
    satellite: str
    frp: float
    confidence: int
    region: str
    agri_burning_likelihood: float
    district: str
    is_demo: bool = True

class FireHotspotSummary(BaseModel):
    total_count: int
    punjab_count: int
    haryana_count: int
    ncr_count: int
    avg_frp: float
    high_likelihood_agri_count: int
    inference_disclaimer: str
    hotspots: List[FireHotspotItem]

# Plume Schemas
class PlumePredictionResponse(BaseModel):
    origin_region: str
    source_lat: float
    source_lon: float
    plume_direction: str
    wind_bearing: float
    wind_speed_kmh: float
    estimated_reach_km: float
    ncr_impact_likelihood: float
    travel_time_hours: float
    pbl_height_m: float
    model_estimate_note: str
    trajectory_points: List[Dict[str, float]]
    plume_cone: List[List[float]]
    impact_severity: str

# 72H Forecast Schemas
class ForecastInterval(BaseModel):
    period: str # "Current", "+24h", "+48h", "+72h"
    hours_ahead: int
    timestamp: datetime
    pm25: float
    pm10: float
    o3: float
    no2: float
    aqi: int
    aqi_category: str
    dominant_pollutant: str
    confidence_interval: List[int] # [min, max]
    meteorological_influence: str

class ForecastResponse(BaseModel):
    location_id: int
    location_name: str
    generated_at: datetime
    methodology: str
    intervals: List[ForecastInterval]
    hourly_trends: List[Dict[str, Any]]
    explanation: str

# Dispersion Schemas
class HourlyDispersionItem(BaseModel):
    hour: str
    time_label: str
    pbl_height: float
    wind_speed: float
    ventilation_index: float
    pm25: float
    dispersion_category: str
    is_current: bool = False

class StationDispersionComparison(BaseModel):
    station_id: int
    name: str
    city: str
    ventilation_index: float
    dispersion_level: str
    wind_speed: float
    pbl_height: float
    aqi: int
    aqi_category: str

class DispersionWeatherParameters(BaseModel):
    temperature: float
    humidity: float
    pressure: float
    wind_speed: float
    wind_direction: float
    wind_cardinal: str
    pbl_height: float
    stability_class: str
    stability_description: str

class DispersionPollutionParameters(BaseModel):
    aqi: int
    aqi_category: str
    dominant_pollutant: str
    pm25: float
    pm10: float
    no2: float
    o3: float

class DispersionResponse(BaseModel):
    location_name: str
    station_code: Optional[str] = None
    ventilation_index: float
    dispersion_level: str # High, Moderate, Low
    accumulation_risk: str # Low, Moderate, High
    pbl_height: float
    wind_speed: float
    stability_class: str
    stability_description: Optional[str] = None
    formula_explanation: str
    chain_of_causation: List[str]
    detailed_narrative: Optional[str] = None
    weather_parameters: Optional[DispersionWeatherParameters] = None
    pollution_parameters: Optional[DispersionPollutionParameters] = None
    hourly_dispersion_trend: Optional[List[HourlyDispersionItem]] = None
    station_comparisons: Optional[List[StationDispersionComparison]] = None
    status_code: Optional[str] = "stagnant"
    timestamp: Optional[datetime] = None

# Analysis & Insights
class SourceApportionment(BaseModel):
    source: str
    percentage: float
    color: str

class AnalysisResponse(BaseModel):
    location_name: str
    headline: str
    primary_cause_summary: str
    weather_contribution_pct: float
    emission_contribution_pct: float
    regional_fire_contribution_pct: float
    pm25_trend_assessment: str
    expected_aqi_trend_72h: str
    model_confidence_score: float
    source_apportionment: List[SourceApportionment]
    actionable_advisory: str

# Chat Schemas
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    location_name: Optional[str] = "Delhi (Anand Vihar)"

class ChatResponse(BaseModel):
    reply: str
    timestamp: datetime
    sources_consulted: List[str]
    suggested_followups: List[str]

# Alert Schemas
class AlertItem(BaseModel):
    id: int
    title: str
    message: str
    alert_type: str
    severity: str
    location_name: str
    is_read: bool
    timestamp: datetime
    health_recommendations: List[str]

# History Schemas
class HistoryComparisonResponse(BaseModel):
    period_type: str
    current_label: str
    previous_label: str
    metrics: Dict[str, Dict[str, Any]]
    delta_summary: str
    trend_series: List[Dict[str, Any]]

# Data Sources Schemas
class DataSourceStatus(BaseModel):
    id: int
    source_name: str
    status: str
    last_updated: datetime
    coverage: str
    latency_ms: int
    variables_used: List[str]
    quality_score: float
    api_connected: bool
