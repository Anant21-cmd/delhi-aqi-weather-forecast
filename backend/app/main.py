from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.connection import engine, Base, SessionLocal
from app.database.models import User
from app.auth.security import get_password_hash
from app.api.routers import (
    auth,
    locations,
    aqi,
    weather,
    coupling,
    inversion,
    dispersion,
    fire,
    plume,
    analysis,
    chat,
    alerts,
    history,
    data_sources,
    profile_settings
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Seed default demo account if none exists
def seed_demo_data():
    db = SessionLocal()
    try:
        demo_email = "demo@moes.gov.in"
        existing = db.query(User).filter(User.email == demo_email).first()
        if not existing:
            demo_user = User(
                name="Dr. S. K. Sharma (MoES Lead Analyst)",
                email=demo_email,
                hashed_password=get_password_hash("Demo@12345"),
                preferred_location="Delhi (Anand Vihar)",
                notification_enabled=True,
                aqi_threshold=250,
                health_advisory_pref="Sensitive Groups"
            )
            db.add(demo_user)
            db.commit()
    finally:
        db.close()

seed_demo_data()

app = FastAPI(
    title=settings.APP_NAME,
    description="Air Pollution–Weather Coupled Forecasting System (Delhi NCR Focus) - SIH26082. MoES & NCMRWF.",
    version="1.0.0"
)
@app.get("/")
def root():
    return {
        "message": "Delhi AQI Weather Forecast API is running"
    }

# Allow cross-origin requests from frontend dev servers and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Health & Metadata Endpoint
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "department": settings.DEPARTMENT,
        "demo_mode": settings.DEMO_MODE,
        "database": "SQLite / PostgreSQL compatible"
    }

# Mount modular routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(aqi.router, prefix="/api")
app.include_router(weather.router, prefix="/api")
app.include_router(coupling.router, prefix="/api")
app.include_router(inversion.router, prefix="/api")
app.include_router(dispersion.router, prefix="/api")
app.include_router(fire.router, prefix="/api")
app.include_router(plume.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(data_sources.router, prefix="/api")
app.include_router(profile_settings.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
