import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Wind,
  Layers,
  Flame,
  CloudSun,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Info,
  Compass,
  ArrowRightLeft,
  Activity,
  Droplets,
  Gauge
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { aqiService } from '../services/api';
import { AQIBadge, getAQIColorConfig } from '../components/common/AQIBadge';
import { MetricCard } from '../components/common/MetricCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const DashboardPage = () => {
  const { selectedLocation } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [aqiData, setAqiData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [inversionData, setInversionData] = useState(null);
  const [fireData, setFireData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [aqiRes, weatherRes, invRes, fireRes, fcastRes, insRes] = await Promise.all([
        aqiService.getCurrentAQI(selectedLocation),
        aqiService.getCurrentWeather(selectedLocation),
        aqiService.getInversion(selectedLocation),
        aqiService.getFireHotspots(),
        aqiService.getAQIForecast(selectedLocation),
        aqiService.getInsights(selectedLocation),
      ]);

      setAqiData(aqiRes.data);
      setWeatherData(weatherRes.data);
      setInversionData(invRes.data);
      setFireData(fireRes.data);
      setForecastData(fcastRes.data);
      setInsightsData(insRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to connect to environmental service. Please verify backend API status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedLocation]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LoadingSkeleton height="h-36" />
          <LoadingSkeleton height="h-36" />
          <LoadingSkeleton height="h-36" />
          <LoadingSkeleton height="h-36" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton height="h-80" />
          <LoadingSkeleton height="h-80" />
          <LoadingSkeleton height="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  const aqiColor = getAQIColorConfig(aqiData?.aqi || 300);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Station Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              Station ID: {aqiData?.station_code || 'DL-01'}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Lat: {aqiData?.latitude}°N, Lon: {aqiData?.longitude}°E
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {selectedLocation}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Coupled Diagnostic Model &bull; Observation Cycle: {new Date(aqiData?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
          </p>
        </div>

        {/* Primary AQI Dial Display */}
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">CPCB Air Quality</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              Dominant: <span className="text-slate-900 font-bold">{aqiData?.dominant_pollutant}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 rounded-xl ${aqiColor.solid} text-white flex flex-col items-center justify-center shadow-md`}>
              <span className="text-2xl font-black leading-none">{aqiData?.aqi}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">AQI</span>
            </div>
            <div>
              <AQIBadge aqi={aqiData?.aqi} category={aqiData?.aqi_category} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="PM2.5 Concentration"
          value={aqiData?.pollutants?.pm25}
          unit="µg/m³"
          icon={Activity}
          subtitle="CPCB Safe Limit: 60 µg/m³"
          badge={aqiData?.pollutants?.pm25 > 120 ? "Very High" : "Moderate"}
          badgeType={aqiData?.pollutants?.pm25 > 120 ? "critical" : "warning"}
        />
        <MetricCard
          title="Planetary Boundary Layer"
          value={weatherData?.pbl_height}
          unit="meters"
          icon={Layers}
          subtitle={`Ceiling Compression: ${weatherData?.pbl_height < 450 ? 'Severe' : 'Normal'}`}
          badge={weatherData?.pbl_height < 400 ? "Shallow Lid" : "Normal"}
          badgeType={weatherData?.pbl_height < 400 ? "critical" : "positive"}
        />
        <MetricCard
          title="Ventilation Index"
          value={weatherData?.ventilation_index}
          unit="m²/s"
          icon={Wind}
          subtitle={`Surface Wind: ${weatherData?.wind_speed} m/s (${weatherData?.wind_cardinal})`}
          badge={weatherData?.dispersion_category === "Low" ? "Stagnant" : "Moderate"}
          badgeType={weatherData?.dispersion_category === "Low" ? "critical" : "positive"}
        />
        <MetricCard
          title="Regional Fire Hotspots"
          value={fireData?.total_count || 0}
          unit="active"
          icon={Flame}
          subtitle={`Punjab: ${fireData?.punjab_count} | Haryana: ${fireData?.haryana_count}`}
          badge={`${fireData?.high_likelihood_agri_count || 0} Inferred Agri`}
          badgeType="warning"
        />
      </div>

      {/* Critical Scientific Warnings Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inversion Warning Card */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-xl p-5 border border-amber-300 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Thermal Inversion Alert</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 text-amber-950">
                {inversionData?.status} Inversion
              </span>
            </div>
            <p className="text-xs text-amber-950 mt-1.5 leading-relaxed">
              Low-altitude inversion cap active at <strong>{inversionData?.base_height_m}m</strong> with a <strong>+{inversionData?.delta_temp}°C</strong> thermal leap. Trapping risk is <strong>{inversionData?.trapping_risk}</strong>.
            </p>
            <NavLink
              to="/inversion"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:text-amber-950 mt-2"
            >
              <span>View Temperature Sounding</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Radiative Feedback / Coupling Card */}
        <div className="bg-gradient-to-r from-sky-500/10 via-teal-500/5 to-transparent rounded-xl p-5 border border-sky-300 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-sky-600 text-white rounded-xl shadow-sm shrink-0">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-900">Atmospheric-Chemical Coupling</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-200 text-sky-950">
                Active Feedback Loop
              </span>
            </div>
            <p className="text-xs text-sky-950 mt-1.5 leading-relaxed">
              Aerosol solar dimming (~47 W/m²) is suppressing ground sensible heat flux, compressing the daytime boundary layer and locking particulates.
            </p>
            <NavLink
              to="/coupling"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-900 hover:text-sky-950 mt-2"
            >
              <span>Explore Coupling Simulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* 72-Hour Forecast Summary Chart & Pollutant Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                72-Hour Coupled AQI Forecast Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pollutant concentrations forecasted first, converted using official CPCB piecewise equations.
              </p>
            </div>
            <NavLink
              to="/forecast"
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 inline-flex items-center gap-1 shrink-0"
            >
              <span>Full Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData?.hourly_trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis domain={[0, 500]} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-bold border-b border-slate-700 pb-1">{d.time_label} ({d.hour})</p>
                          <p className="text-rose-400 font-semibold">Predicted AQI: {d.aqi}</p>
                          <p className="text-slate-300">PM2.5: {d.pm25} µg/m³</p>
                          <p className="text-slate-300">PM10: {d.pm10} µg/m³</p>
                          <p className="text-slate-400 text-[10px]">95% CI: [{d.lower_bound} - {d.upper_bound}]</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="aqi" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#aqiGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast 4 Key Horizon Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100 mt-4">
            {forecastData?.intervals?.map((item) => (
              <div key={item.period} className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{item.period}</span>
                <div className="text-lg font-black text-slate-900 my-0.5">{item.aqi}</div>
                <span className="text-[10px] font-semibold text-rose-600 block truncate">{item.aqi_category}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Source Apportionment / Pollution Drivers */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-sky-600" />
              Primary Pollution Drivers
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Estimated apportionment based on coupled chemical transport model.
            </p>

            <div className="space-y-4">
              {insightsData?.source_apportionment?.map((source) => (
                <div key={source.source} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 truncate max-w-[200px]">{source.source}</span>
                    <span className="text-slate-900 font-bold">{source.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${source.percentage}%`, backgroundColor: source.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-sky-600" /> Diagnostic Summary
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {insightsData?.primary_cause_summary}
              </p>
            </div>
          </div>

          <NavLink
            to="/insights"
            className="mt-4 w-full py-2.5 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Detailed Cause Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>

      {/* Pollutant Matrix & Weather Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase">PM2.5</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{aqiData?.pollutants?.pm25}</div>
          <span className="text-[10px] text-slate-400">µg/m³ &bull; Sub: {aqiData?.sub_indices?.pm25}</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase">PM10</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{aqiData?.pollutants?.pm10}</div>
          <span className="text-[10px] text-slate-400">µg/m³ &bull; Sub: {aqiData?.sub_indices?.pm10}</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase">NO2</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{aqiData?.pollutants?.no2}</div>
          <span className="text-[10px] text-slate-400">µg/m³ &bull; Sub: {aqiData?.sub_indices?.no2}</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase">O3 (Ozone)</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{aqiData?.pollutants?.o3}</div>
          <span className="text-[10px] text-slate-400">µg/m³ &bull; Sub: {aqiData?.sub_indices?.o3}</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Temperature</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{weatherData?.temperature}°C</div>
          <span className="text-[10px] text-slate-400">Humidity: {weatherData?.humidity}%</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Wind Vector</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{weatherData?.wind_speed} m/s</div>
          <span className="text-[10px] text-slate-400">{weatherData?.wind_cardinal} ({weatherData?.wind_direction}°)</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <NavLink
          to="/map"
          className="bg-white hover:bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-600">Interactive Map</span>
            <span className="text-[11px] text-slate-500">NCR Stations & Fires</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
        </NavLink>

        <NavLink
          to="/plume"
          className="bg-white hover:bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-600">Smoke Plume</span>
            <span className="text-[11px] text-slate-500">Trajectory Estimation</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
        </NavLink>

        <NavLink
          to="/dispersion"
          className="bg-white hover:bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-600">Dispersion Index</span>
            <span className="text-[11px] text-slate-500">Ventilation Analysis</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
        </NavLink>

        <NavLink
          to="/chat"
          className="bg-white hover:bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-slate-900 block group-hover:text-sky-600">AI Assistant</span>
            <span className="text-[11px] text-slate-500">Ask Natural Questions</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
        </NavLink>
      </div>
    </div>
  );
};
