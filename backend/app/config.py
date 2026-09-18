import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "Air Pollution–Weather Coupled Forecasting System"
    DEPARTMENT: str = "National Centre for Medium Range Weather Forecasting (NCMRWF) / MoES"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./delhi_aqi.db")
    
    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "moes-ncmrwf-coupled-aqi-secret-key-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Operational Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    
    # External API Keys (environment variables)
    CPCB_API_KEY: str = os.getenv("CPCB_API_KEY", "")
    ERA5_API_KEY: str = os.getenv("ERA5_API_KEY", "")
    NASA_FIRMS_MAP_KEY: str = os.getenv("NASA_FIRMS_MAP_KEY", "")

settings = Settings()
