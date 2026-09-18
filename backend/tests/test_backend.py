import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.aqi_service import calculate_cpcb_aqi, calculate_sub_index
from app.services.weather_service import calculate_ventilation_index, get_dispersion_category
from app.services.coupling_service import calculate_radiative_feedback
from app.services.inversion_service import analyze_inversion_conditions
from app.services.fire_service import calculate_agri_burning_likelihood
from app.services.plume_service import estimate_smoke_plume
from app.services.forecasting.forecast_engine import generate_72h_forecast

client = TestClient(app)

def test_cpcb_aqi_calculation():
    # Good category test: PM2.5 = 25 -> Sub-index in (0, 50)
    sub_pm25 = calculate_sub_index("pm25", 25.0)
    assert 0 <= sub_pm25 <= 50

    # Very Poor test: PM2.5 = 180 -> Sub-index in (301, 400)
    sub_vpoor = calculate_sub_index("pm25", 180.0)
    assert 301 <= sub_vpoor <= 400

    # Overall CPCB AQI max rule
    pollutants = {
        "pm25": 190.0, # Very poor
        "pm10": 210.0, # Moderate
        "no2": 50.0,   # Satisfactory
        "o3": 30.0     # Good
    }
    result = calculate_cpcb_aqi(pollutants)
    assert result["dominant_pollutant"] == "PM2.5"
    assert result["category"] in ("Very Poor", "Severe")
    assert result["aqi"] >= 301

def test_weather_ventilation():
    # Stagnant scenario: PBL = 300m, Wind = 1.5 m/s -> VI = 450 m2/s (< 2000)
    vi = calculate_ventilation_index(300.0, 1.5)
    assert vi == 450.0
    cat = get_dispersion_category(vi)
    assert cat["level"] == "Low"
    assert cat["accumulation_risk"] == "High"

def test_coupling_feedback():
    feedback = calculate_radiative_feedback(
        wind_speed=1.5,
        pbl_height=350.0,
        aerosol_pm25=220.0,
        inversion_layer=True
    )
    assert feedback["solar_attenuation_watts"] > 0
    assert feedback["boundary_layer_compression_pct"] > 0
    assert feedback["effective_pbl"] < 350.0
    assert feedback["coupled_pm25"] > 220.0

def test_inversion_sounding():
    inv = analyze_inversion_conditions("Delhi (Anand Vihar)", 24.0, 380.0, 1.8)
    assert inv["status"] in ("Strong", "Moderate")
    assert len(inv["sounding_profile"]) > 5
    assert inv["trapping_risk"] in ("Severe", "High")

def test_fire_agri_likelihood():
    # Punjab Kharif season fire
    score = calculate_agri_burning_likelihood(
        lat=30.2,
        lon=75.8,
        frp=55.0,
        month=10,
        confidence=90,
        nearby_cluster_count=5
    )
    assert score >= 70.0 # High likelihood

def test_plume_prediction():
    plume = estimate_smoke_plume(
        source_lat=30.245,
        source_lon=75.834,
        wind_speed_kmh=12.0,
        wind_direction_deg=315.0 # NW wind towards SE (Delhi)
    )
    assert plume["estimated_reach_km"] > 50.0
    assert plume["ncr_impact_likelihood"] > 50.0
    assert len(plume["trajectory_points"]) > 5
    assert len(plume["plume_cone"]) == 5

def test_forecast_engine():
    forecast = generate_72h_forecast()
    assert len(forecast["intervals"]) == 4
    # Check that intervals have pollutant first, then aqi
    for interval in forecast["intervals"]:
        assert "pm25" in interval
        assert "pm10" in interval
        assert "aqi" in interval
        assert "aqi_category" in interval
        assert len(interval["confidence_interval"]) == 2

def test_api_endpoints():
    # Health
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"

    # Locations
    r = client.get("/api/locations")
    assert r.status_code == 200
    assert len(r.json()) >= 8

    # Current AQI
    r = client.get("/api/aqi/current?location=Delhi%20(Anand%20Vihar)")
    assert r.status_code == 200
    data = r.json()
    assert "aqi" in data
    assert "pollutants" in data

    # 72H Forecast
    r = client.get("/api/aqi/forecast")
    assert r.status_code == 200
    assert len(r.json()["intervals"]) == 4

    # Current Weather
    r = client.get("/api/weather/current")
    assert r.status_code == 200
    assert "ventilation_index" in r.json()

    # Coupling
    r = client.get("/api/coupling")
    assert r.status_code == 200

    # Fire Hotspots
    r = client.get("/api/fire-hotspots")
    assert r.status_code == 200
    assert "hotspots" in r.json()

    # Chatbot
    r = client.post("/api/chat", json={"message": "Why is pollution high today?"})
    assert r.status_code == 200
    assert "reply" in r.json()

    # Dispersion Analysis
    r = client.get("/api/dispersion?location=Delhi%20(Anand%20Vihar)")
    assert r.status_code == 200
    disp_data = r.json()
    assert "ventilation_index" in disp_data
    assert "weather_parameters" in disp_data
    assert "pollution_parameters" in disp_data
    assert "hourly_dispersion_trend" in disp_data
    assert len(disp_data["hourly_dispersion_trend"]) == 24
    assert "station_comparisons" in disp_data
    assert len(disp_data["station_comparisons"]) >= 8

