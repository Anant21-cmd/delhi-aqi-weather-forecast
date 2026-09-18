import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Wind,
  Layers,
  Thermometer,
  Compass,
  Droplets,
  Gauge,
  ArrowDown,
  Info,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { aqiService } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const WeatherPage = () => {
  const { selectedLocation } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherForecast, setWeatherForecast] = useState(null);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [curRes, fcastRes] = await Promise.all([
        aqiService.getCurrentWeather(selectedLocation),
        aqiService.getWeatherForecast(selectedLocation),
      ]);
      setCurrentWeather(curRes.data);
      setWeatherForecast(fcastRes.data);
    } catch (err) {
      console.error('Failed to load weather data:', err);
      setError('Unable to retrieve meteorological stream from NCMRWF/ERA5 feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [selectedLocation]);

  if (loading) {
    return <LoadingSkeleton height="h-[600px]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchWeatherData} />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Copernicus ERA5 & NCMRWF Gridded Fields
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Meteorological Dynamics & Boundary Layer Physics &mdash; {selectedLocation}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atmospheric parameters governing dispersion, horizontal dilution, and boundary layer carrying capacity.
          </p>
        </div>

        <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-sky-900 text-xs shrink-0 flex items-center gap-3">
          <Wind className="w-6 h-6 text-sky-600" />
          <div>
            <span className="font-bold block">Atmospheric Stability: Class {currentWeather?.stability_class}</span>
            <span className="text-[11px] text-sky-700">Pasquill-Gifford Scale</span>
          </div>
        </div>
      </div>

      {/* Primary Weather Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Surface Temperature"
          value={currentWeather?.temperature}
          unit="°C"
          icon={Thermometer}
          subtitle={`Dew Point: ~16.4°C`}
          badge="Winter Inversion Setup"
          badgeType="warning"
        />
        <MetricCard
          title="Wind Velocity & Vector"
          value={currentWeather?.wind_speed}
          unit="m/s"
          icon={Wind}
          subtitle={`Direction: ${currentWeather?.wind_cardinal} (${currentWeather?.wind_direction}°)`}
          badge={currentWeather?.wind_speed < 2.0 ? "Critical Calm" : "Moderate Breeze"}
          badgeType={currentWeather?.wind_speed < 2.0 ? "critical" : "positive"}
        />
        <MetricCard
          title="Planetary Boundary Layer (PBL)"
          value={currentWeather?.pbl_height}
          unit="meters AGL"
          icon={Layers}
          subtitle="Convective mixing volume ceiling"
          badge={currentWeather?.pbl_height < 450 ? "Restricted Dilution" : "Adequate"}
          badgeType={currentWeather?.pbl_height < 450 ? "critical" : "positive"}
        />
        <MetricCard
          title="Atmospheric Pressure"
          value={currentWeather?.pressure}
          unit="hPa"
          icon={Gauge}
          subtitle={`Relative Humidity: ${currentWeather?.humidity}%`}
          badge="High Pressure Ridge"
          badgeType="neutral"
        />
      </div>

      {/* Atmospheric Physics Causality Explanation */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-600" />
          The Science of Weather–Pollution Interaction
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Why does air quality deteriorate rapidly even if daily local emissions remain constant?
        </p>

        {/* Step-by-Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center mx-auto mb-2 text-xs">1</span>
            <h4 className="text-xs font-bold text-slate-900">Low Surface Wind</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Winds drop below 2.0 m/s, eliminating horizontal advection and downwind flushing of city exhaust.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center mx-auto mb-2 text-xs">2</span>
            <h4 className="text-xs font-bold text-slate-900">Weak Atmospheric Dispersion</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Ventilation Index falls below 2000 m²/s. Mechanical turbulence is suppressed across NCR.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center mx-auto mb-2 text-xs">3</span>
            <h4 className="text-xs font-bold text-slate-900">Pollutant Accumulation</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Vehicular, dust, and regional biomass smoke cannot escape vertically and stack up near breathing zone.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <span className="w-8 h-8 rounded-full bg-red-800 text-white font-bold flex items-center justify-center mx-auto mb-2 text-xs">4</span>
            <h4 className="text-xs font-bold text-slate-900">AQI Surge / Severe Smog</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Fine particulate concentrations (PM2.5) spike 3x–6x above national ambient standards, breaching 350+ AQI.
            </p>
          </div>
        </div>
      </div>

      {/* 72-Hour Weather Parameter Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wind & PBL Height Evolution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Boundary Layer Height & Ventilation Progression
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Shallow nocturnal boundary layer heights vs daytime convective expansion.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weatherForecast?.forecast_series || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pblGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" unit="m" />
                <Tooltip />
                <Area type="monotone" dataKey="pbl_height" stroke="#0284c7" strokeWidth={2} fill="url(#pblGrad)" name="PBL Height (m)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature & Wind Speed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            Surface Wind Velocity Forecast (m/s)
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Critical threshold is 2.0 m/s. Winds below this value lead to extreme stagnation.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weatherForecast?.forecast_series || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis domain={[0, 6]} tick={{ fontSize: 11 }} stroke="#64748b" unit="m/s" />
                <Tooltip />
                <Line type="monotone" dataKey="wind_speed" stroke="#0d9488" strokeWidth={2.5} name="Wind Speed (m/s)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
