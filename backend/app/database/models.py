import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    preferred_location = Column(String(100), default="Delhi (Anand Vihar)")
    notification_enabled = Column(Boolean, default=True)
    aqi_threshold = Column(Integer, default=250)
    health_advisory_pref = Column(String(50), default="All Groups")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    station_code = Column(String(50), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)

class AirQuality(Base):
    __tablename__ = "air_quality"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    pm25 = Column(Float, nullable=False)
    pm10 = Column(Float, nullable=False)
    o3 = Column(Float, nullable=False)
    no2 = Column(Float, nullable=False)
    so2 = Column(Float, default=15.0)
    co = Column(Float, default=1.2)
    aqi = Column(Integer, nullable=False)
    aqi_category = Column(String(50), nullable=False)
    dominant_pollutant = Column(String(20), default="PM2.5")
    is_demo = Column(Boolean, default=True)

class WeatherData(Base):
    __tablename__ = "weather_data"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    wind_direction = Column(Float, nullable=False)  # degrees
    pbl_height = Column(Float, nullable=False)     # meters
    ventilation_index = Column(Float, nullable=False) # m2/s
    stability_class = Column(String(10), default="D")
    is_demo = Column(Boolean, default=True)

class FireHotspot(Base):
    __tablename__ = "fire_hotspots"
    
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    acq_time = Column(DateTime, default=datetime.datetime.utcnow)
    satellite = Column(String(50), default="VIIRS-SNPP")
    frp = Column(Float, nullable=False) # Fire Radiative Power (MW)
    confidence = Column(Integer, default=85)
    region = Column(String(100), default="Punjab")
    agri_burning_likelihood = Column(Float, default=80.0) # percentage
    is_demo = Column(Boolean, default=True)

class ForecastRecord(Base):
    __tablename__ = "forecast"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    forecast_for_hours = Column(Integer, nullable=False) # 0, 24, 48, 72
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    pm25 = Column(Float, nullable=False)
    pm10 = Column(Float, nullable=False)
    o3 = Column(Float, nullable=False)
    no2 = Column(Float, nullable=False)
    aqi = Column(Integer, nullable=False)
    aqi_category = Column(String(50), nullable=False)
    confidence_lower = Column(Integer, nullable=False)
    confidence_upper = Column(Integer, nullable=False)
    dominant_pollutant = Column(String(20), default="PM2.5")
    is_demo = Column(Boolean, default=True)

class InversionAnalysis(Base):
    __tablename__ = "inversion_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), nullable=False) # Weak, Moderate, Strong, None
    base_height = Column(Float, nullable=False)
    top_height = Column(Float, nullable=False)
    trapping_risk = Column(String(50), nullable=False) # Low, Moderate, High, Severe
    dispersion_condition = Column(String(50), nullable=False)
    delta_temp = Column(Float, nullable=False) # degree C increase across layer
    is_demo = Column(Boolean, default=True)

class PlumePrediction(Base):
    __tablename__ = "plume_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    origin_region = Column(String(100), nullable=False)
    plume_direction = Column(String(50), nullable=False) # e.g. South-East
    estimated_reach_km = Column(Float, nullable=False)
    ncr_impact_likelihood = Column(Float, nullable=False) # percentage
    wind_bearing = Column(Float, nullable=False)
    is_demo = Column(Boolean, default=True)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    alert_type = Column(String(50), nullable=False) # high_aqi, inversion, plume, dispersion, health
    severity = Column(String(20), nullable=False) # info, warning, critical
    location_name = Column(String(100), default="Delhi NCR")
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)
    role = Column(String(20), nullable=False) # user, assistant
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class DataSource(Base):
    __tablename__ = "data_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), unique=True, nullable=False)
    status = Column(String(50), default="Connected") # Connected, Available, Degraded, Offline
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)
    coverage = Column(String(100), default="Delhi NCR + NW India")
    latency_ms = Column(Integer, default=145)
    variables_used = Column(Text, default="")
    quality_score = Column(Float, default=98.5)
