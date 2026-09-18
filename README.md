# Air Pollution–Weather Coupled Forecasting System (Delhi NCR Focus)

**SIH26082 &bull; Ministry of Earth Sciences (MoES) &bull; National Centre for Medium Range Weather Forecasting (NCMRWF)**

---

## 1. Overview

The **Air Pollution–Weather Coupled Forecasting System** is a production-grade environmental intelligence and decision-support web application for Delhi NCR. Unlike simple AQI monitoring dashboards, this system models the dynamic interactions between meteorology and particulate pollution:
1. **WHAT** is the current pollution condition across 11 key NCR stations (Anand Vihar, ITO, RK Puram, Punjabi Bagh, Noida Sec 62, Gurugram Sec 51, Faridabad Sec 16A, Ghaziabad Vasundhara, Panipat, Ambala, Hisar)?
2. **WHY** is pollution increasing or decreasing (boundary layer ventilation, thermal inversion locks, two-way radiative feedback loops, and regional agricultural biomass transport)?
3. **WHAT** is projected to happen over the next 72 hours via pollutant-first coupled forecasting (CPCB NAQI standard)?

---

## 2. Key Capabilities & Scientific Models

- **CPCB NAQI Calculation Engine**: Computes sub-indices for PM2.5, PM10, NO2, O3, SO2, and CO using official Indian Central Pollution Control Board piecewise linear breakpoints. Overall AQI = $\max(I_{p_i})$ with dominant pollutant identification.
- **Two-Way Radiative Feedback Simulation Lab**: Models both:
  - *Weather $\rightarrow$ Pollution*: Calm winds ($<2$ m/s) + shallow boundary layer ($<400$m) + thermal inversion $\rightarrow$ Stagnant accumulation.
  - *Pollution $\rightarrow$ Weather*: Dense aerosol loading ($PM_{2.5} > 200$ µg/m³) $\rightarrow$ Solar dimming (15–50 W/m² loss) $\rightarrow$ Ground cooling $\rightarrow$ Convective suppression $\rightarrow$ Further boundary layer compression.
- **Atmospheric Inversion & Sounding Monitor**: Vertical atmospheric sounding ($T(z)$ up to 3000m AGL) identifying subsidence and radiation inversion lids, inversion base/top, and lapse rates.
- **NASA FIRMS Agricultural Burning Inference**: Ingests MODIS (Terra/Aqua) and VIIRS (S-NPP/NOAA-20) 375m fire hotspots and calculates an **"Application-Inferred Agricultural Burning Likelihood"** using spatial crop masks, seasonal harvesting windows (Kharif/Rabi), and Fire Radiative Power (FRP).
- **Smoke Plume Trajectory Estimation**: Lagrangian forward trajectory and Pasquill-Gifford dispersion cone model computing downwind reach, travel time, and NCR impact probabilities (`MODEL ESTIMATE`).
- **72-Hour Pollutant-First Forecast**: Predicts pollutant concentrations first ($PM_{2.5}, PM_{10}, NO_2, O_3$) at +0h, +24h, +48h, +72h, then calculates CPCB AQI with 95% confidence intervals.
- **Grounded AI Environmental Assistant**: Interactive conversational chatbot backed by real-time station metrics, meteorological physics, and CPCB health advisory standards.
- **Interactive Leaflet NCR Map**: Features monitoring stations with color-coded pins, active FIRMS fire hotspots, smoke plume dispersion cones, and pollution trapping zones.
- **Historical Episode Comparison**: Compares today vs yesterday, week vs week, and post-Diwali severe smog episodes vs clean baselines.

---

## 3. System Architecture Diagram

The system architecture diagram is available in SVG format at `architecture_diagram.svg` (both in this directory and in the scratch directory). It illustrates the end-to-end operational pipeline:

1. **Multi-Source Data Ingestion**: CPCB CAAQMS, IMD WRF/AWS, ECMWF ERA5/IFS, NASA FIRMS 375m, Copernicus CAMS, Sentinel-2 / LULC Crop Mask.
2. **Data Ingestion & Processing Pipeline**: Validation, spatial PostGIS indexing, quality control, outlier cleaning, and unit normalization.
3. **Database & Storage Layer**: PostgreSQL / PostGIS geospatial storage with SQLite local dev database (`delhi_aqi.db`).
4. **Meteorological Dispersion & Ventilation Analyzer**: Ventilation Index ($VI = WS \times BLH$), stagnation index, and critical threshold monitoring.
5. **Atmospheric Inversion & Vertical Sounding**: High-resolution $T(z)$ profiles, lapse rate $\Gamma$, radiation/subsidence lid detection.
6. **Regional Biomass Fire & Stubble Inference**: Crop mask overlap, harvesting calendar correlation, and FRP analysis.
7. **Smoke Plume Trajectory & Forward Dispersion**: Kinematic forward trajectory, Pasquill-Gifford dispersion cone (`MODEL ESTIMATE`).
8. **Two-Way Weather-Pollution Coupled Simulator**: Radiative dimming, convective suppression, feedback loop quantification.
9. **Central AI/ML Coupled Forecasting Engine**: Hybrid BiLSTM, Random Forest, and physics-coupled ensemble generating 72h predictions with 95% confidence intervals.
10. **CPCB NAQI Sub-Index & AQI Engine**: Official Indian piecewise linear breakpoints computing sub-indices for PM2.5, PM10, NO2, O3, SO2, CO.
11. **FastAPI High-Performance Backend**: REST APIs, JWT authentication, and interactive OpenAPI documentation.
12. **React Single Page Application (SPA)**: 15 interactive operational views with Leaflet geospatial maps, sounding charts, and AI assistant.
13. **End Users**: Environmental officers, MoES/NCMRWF scientific teams, CAQM administrators, and citizens.

---

## 4. Project Structure

```
delhi-aqi-weather-forecast/
├── backend/
│   ├── app/
│   │   ├── api/routers/      # REST API endpoints (aqi, weather, coupling, inversion, fire, plume, etc.)
│   │   ├── auth/             # JWT authentication & bcrypt security
│   │   ├── database/         # SQLAlchemy models and SQLite/PostgreSQL connection
│   │   ├── schemas/          # Pydantic v2 validation models
│   │   ├── services/
│   │   │   ├── aqi_service.py          # CPCB NAQI algorithm
│   │   │   ├── weather_service.py      # Meteorology & ventilation index
│   │   │   ├── coupling_service.py     # Coupled radiative feedback simulation
│   │   │   ├── inversion_service.py    # Vertical soundings & lapse rates
│   │   │   ├── fire_service.py         # NASA FIRMS & agri-fire inference
│   │   │   ├── plume_service.py        # Forward trajectory & dispersion cone
│   │   │   ├── dispersion_service.py   # Atmospheric stagnation risk
│   │   │   ├── analysis_service.py     # Source apportionment & cause insights
│   │   │   ├── chat_service.py         # Grounded AI chatbot assistant
│   │   │   ├── alert_service.py        # Operational hazard alerts
│   │   │   ├── history_service.py      # Longitudinal episode comparison
│   │   │   ├── data_source_service.py  # Upstream pipeline transparency
│   │   │   └── demo_data_service.py    # Centralized calibrated NCR demo data
│   │   ├── config.py         # Application configuration & env variables
│   │   └── main.py           # FastAPI application entry point
│   ├── tests/                # Automated pytest suite
│   ├── requirements.txt      # Python dependencies
│   └── venv/                 # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── components/common/# AQIBadge, MetricCard, Skeleton, ErrorState, etc.
│   │   ├── context/          # AppContext (auth, selected location, demo state)
│   │   ├── layouts/          # MainLayout (collapsible sidebar, responsive drawer)
│   │   ├── pages/            # 15 Complete functional views
│   │   ├── services/         # Axios API client
│   │   ├── App.jsx           # React Router v6 routes
│   │   ├── index.css         # Tailwind styles & Leaflet styling
│   │   └── main.jsx          # React DOM entry
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── start_backend.bat
├── start_frontend.bat
└── README.md
```

---

## 4. Running the Application

### 4.1 Running the Backend
From `backend/`:
```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- Redoc: `http://127.0.0.1:8000/redoc`

### 4.2 Running the Frontend
From `frontend/`:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4.3 Running Automated Tests
From `backend/`:
```bash
.\venv\Scripts\python.exe -m pytest -v
```

---

## 5. User Credentials (Demo Evaluator)
- **Email**: `demo@moes.gov.in`
- **Password**: `Demo@12345`
*(Or click "Fast Demo Sign-In" on the Login screen).*
