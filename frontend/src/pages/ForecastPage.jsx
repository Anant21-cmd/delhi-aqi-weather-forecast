import React, { useState, useEffect } from 'react';
import {
  Clock,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useApp } from '../context/AppContext';
import { aqiService } from '../services/api';
import { AQIBadge, getAQIColorConfig } from '../components/common/AQIBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const ForecastPage = () => {
  const { selectedLocation } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [activeTab, setActiveTab] = useState('aqi'); // aqi | pm | all

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aqiService.getAQIForecast(selectedLocation);
      setForecast(res.data);
    } catch (err) {
      console.error('Failed to load forecast:', err);
      setError('Unable to load coupled 72-hour forecast model predictions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [selectedLocation]);

  if (loading) {
    return <LoadingSkeleton height="h-[600px]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchForecast} />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              NCMRWF Coupled Numerical Prediction
            </span>
            <span className="text-xs text-slate-500">
              Model Horizon: +72 Hours
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            72-Hour Coupled Air Quality Forecast &mdash; {selectedLocation}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Methodology: Atmospheric pollutant concentrations predicted first via boundary layer advection-dispersion, followed by CPCB sub-index calculation.
          </p>
        </div>

        {/* Methodology Pill */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-emerald-900 text-xs shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block">CPCB Piecewise Linear Formula</span>
            <span className="text-[11px] text-emerald-700">Non-linear aerosol coupling</span>
          </div>
        </div>
      </div>

      {/* 4 Horizon Period Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {forecast?.intervals?.map((interval) => {
          const cfg = getAQIColorConfig(interval.aqi);
          return (
            <div
              key={interval.period}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${cfg.solid}`} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{interval.period}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(interval.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(interval.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-slate-900">{interval.aqi}</span>
                  <AQIBadge aqi={interval.aqi} category={interval.aqi_category} size="sm" />
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Dominant Pollutant: <strong className="text-slate-800">{interval.dominant_pollutant}</strong>
                </div>

                {/* Pollutant Sub-Matrix */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">PM2.5</span>
                    <strong className="text-slate-800 text-sm">{interval.pm25}</strong> <span className="text-[10px] text-slate-400">µg/m³</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">PM10</span>
                    <strong className="text-slate-800 text-sm">{interval.pm10}</strong> <span className="text-[10px] text-slate-400">µg/m³</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">NO2</span>
                    <strong className="text-slate-800 text-sm">{interval.no2}</strong> <span className="text-[10px] text-slate-400">µg/m³</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">O3 (Ozone)</span>
                    <strong className="text-slate-800 text-sm">{interval.o3}</strong> <span className="text-[10px] text-slate-400">µg/m³</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Atmospheric Forcing:</span>
                <p className="mt-0.5 leading-snug">{interval.meteorological_influence}</p>
                <span className="text-[10px] font-mono text-sky-700 mt-2 block font-semibold">
                  Confidence: [{interval.confidence_interval[0]} – {interval.confidence_interval[1]}]
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Trend Charts */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              72-Hour Continuous Forecast Evolution
            </h3>
            <p className="text-xs text-slate-500">
              3-hourly resolution with 95% meteorological confidence intervals.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('aqi')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'aqi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AQI & Uncertainty
            </button>
            <button
              onClick={() => setActiveTab('pm')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'pm' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PM2.5 vs PM10
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Pollutants Comparison
            </button>
          </div>
        </div>

        {/* Chart Viewports */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'aqi' ? (
              <AreaChart data={forecast?.hourly_trends || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAQI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorUncertainty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis domain={[0, 500]} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-bold border-b border-slate-700 pb-1">{d.time_label} ({d.hour})</p>
                          <p className="text-rose-400 font-bold">Predicted AQI: {d.aqi}</p>
                          <p className="text-slate-300">95% Uncertainty: [{d.lower_bound} – {d.upper_bound}]</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="upper_bound" stroke="transparent" fill="url(#colorUncertainty)" fillOpacity={1} />
                <Area type="monotone" dataKey="aqi" stroke="#ef4444" strokeWidth={2.5} fill="url(#colorAQI)" fillOpacity={1} />
              </AreaChart>
            ) : activeTab === 'pm' ? (
              <LineChart data={forecast?.hourly_trends || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" unit=" µg/m³" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pm25" stroke="#ef4444" strokeWidth={2.5} name="PM2.5 (Fine Particulate)" dot={false} />
                <Line type="monotone" dataKey="pm10" stroke="#f59e0b" strokeWidth={2} name="PM10 (Coarse Particulate)" dot={false} />
              </LineChart>
            ) : (
              <BarChart data={forecast?.intervals || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" unit=" µg/m³" />
                <Tooltip />
                <Legend />
                <Bar dataKey="pm25" fill="#ef4444" name="PM2.5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pm10" fill="#f59e0b" name="PM10" radius={[4, 4, 0, 0]} />
                <Bar dataKey="no2" fill="#3b82f6" name="NO2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="o3" fill="#10b981" name="Ozone" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Narrative & Scientific Explanation */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mt-6">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1.5">
            <Info className="w-4 h-4 text-sky-600" />
            Diagnostic Forecast Interpretation
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {forecast?.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
