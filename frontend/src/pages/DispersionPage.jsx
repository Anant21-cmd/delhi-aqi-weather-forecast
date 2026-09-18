import React, { useState, useEffect } from 'react';
import {
  Wind,
  Layers,
  ShieldAlert,
  Activity,
  Gauge,
  Info,
  Thermometer,
  Droplets,
  Compass,
  BarChart3,
  CloudSun,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import { aqiService } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { AQIBadge } from '../components/common/AQIBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const DispersionPage = () => {
  const { selectedLocation } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dispersion, setDispersion] = useState(null);
  const [chartView, setChartView] = useState('diurnal'); // 'diurnal' | 'stations'

  const fetchDispersion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aqiService.getDispersion(selectedLocation);
      if (res && res.data) {
        setDispersion(res.data);
      } else {
        throw new Error('Empty dispersion payload returned from service.');
      }
    } catch (err) {
      console.error('Failed to load dispersion analysis:', err);
      const msg = err.response?.data?.detail || err.message || 'Unable to compute ventilation index and atmospheric dispersion.';
      setError(typeof msg === 'string' ? msg : 'Unable to compute ventilation index and atmospheric dispersion.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispersion();
  }, [selectedLocation]);

  const weather = dispersion?.weather_parameters;
  const pollution = dispersion?.pollution_parameters;
  const vi = dispersion?.ventilation_index ?? 0;
  const level = dispersion?.dispersion_level || 'Low';
  const risk = dispersion?.accumulation_risk || 'High';

  // Format custom tooltip for Diurnal Chart
  const CustomDiurnalTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 backdrop-blur-sm">
          <div className="font-bold text-sky-400 border-b border-slate-700 pb-1 flex items-center justify-between gap-4">
            <span>{data.time_label} ({data.hour})</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              data.dispersion_category === 'High' ? 'bg-emerald-500/20 text-emerald-300' :
              data.dispersion_category === 'Moderate' ? 'bg-amber-500/20 text-amber-300' :
              'bg-rose-500/20 text-rose-300'
            }`}>
              {data.dispersion_category} Dispersion
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
            <span className="text-slate-400">Ventilation Index:</span>
            <span className="font-bold text-sky-300">{data.ventilation_index} m²/s</span>
            <span className="text-slate-400">Boundary Layer:</span>
            <span className="font-semibold text-slate-200">{data.pbl_height} m AGL</span>
            <span className="text-slate-400">Wind Velocity:</span>
            <span className="font-semibold text-slate-200">{data.wind_speed} m/s</span>
            <span className="text-slate-400">Coupled PM2.5:</span>
            <span className="font-bold text-rose-400">{data.pm25} µg/m³</span>
          </div>
          {data.is_current && (
            <div className="mt-1 pt-1 border-t border-slate-700/80 text-[10px] text-amber-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Current Observation Time
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3 text-slate-700">
          <RefreshCw className="w-5 h-5 text-sky-600 animate-spin" />
          <span className="text-sm font-semibold">Loading Dispersion Analysis & Atmospheric Ventilation Data...</span>
        </div>
        <LoadingSkeleton height="h-[600px]" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load dispersion analysis"
        message={error}
        onRetry={fetchDispersion}
      />
    );
  }

  if (!dispersion) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-8">
        <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900 mb-1">
          No dispersion data available for the selected conditions.
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Please select another monitoring station or retry the calculation.
        </p>
        <button
          onClick={fetchDispersion}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Dispersion Analysis</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              NCMRWF Carrying Capacity Intelligence
            </span>
            <span className="text-[11px] text-slate-400">
              Station Code: <strong className="text-slate-700">{dispersion?.station_code || 'NCR-STN'}</strong>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Atmospheric Dispersion & Ventilation Analysis &mdash; {selectedLocation}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Quantitative assessment of dynamic airshed ventilation volume (VI = PBL Height &times; Wind Speed in m&sup2;/s)
            determining whether ground emissions dilute or accumulate into severe smog episodes.
          </p>
        </div>

        <div className={`p-4 rounded-xl border text-xs shrink-0 ${
          level === 'Low'
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : level === 'Moderate'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            <Wind className={`w-4 h-4 shrink-0 ${
              level === 'Low' ? 'text-rose-600' : level === 'Moderate' ? 'text-amber-600' : 'text-emerald-600'
            }`} />
            <span className="text-sm">Dispersion Capacity: {level.toUpperCase()}</span>
          </div>
          <div className="text-[11px] space-y-0.5">
            <div>Accumulation Risk: <strong className="font-bold">{risk}</strong></div>
            <div>Atmospheric Stability: <strong className="font-bold">Class {dispersion?.stability_class || 'F'}</strong></div>
          </div>
        </div>
      </div>

      {/* 2. Coupled Weather & Air Pollution Context Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weather Observations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-sky-600" />
              Retrieved Meteorological Parameters
            </h3>
            <span className="text-[10px] text-slate-400">IMD / NCMRWF Surface Stream</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Temperature</span>
              <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                {weather?.temperature ?? 24.2}°C
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Rel. Humidity</span>
              <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-500" />
                {weather?.humidity ?? 68}%
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Wind Vector</span>
              <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                {weather?.wind_cardinal ?? 'NW'} ({weather?.wind_direction ?? 310}°)
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Surface Pressure</span>
              <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                {weather?.pressure ?? 1012.4} hPa
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic bg-sky-50/50 p-2 rounded-lg border border-sky-100/80">
            {weather?.stability_description || dispersion?.stability_description || 'Surface boundary layer stability regulates dilution volume.'}
          </p>
        </div>

        {/* Air Pollution Observations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              Retrieved Air Pollution Parameters
            </h3>
            <span className="text-[10px] text-slate-400">CPCB CAAQMS Real-Time</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">CPCB NAQI</span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-lg font-extrabold text-slate-900">{pollution?.aqi ?? 380}</span>
                <AQIBadge aqi={pollution?.aqi ?? 380} category={pollution?.aqi_category} size="sm" />
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">PM2.5 (NAAQS: 60)</span>
              <div className="text-base font-bold text-rose-700 mt-0.5">
                {pollution?.pm25 ?? 220} <span className="text-[10px] text-slate-500 font-normal">µg/m³</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">PM10 (NAAQS: 100)</span>
              <div className="text-base font-bold text-amber-700 mt-0.5">
                {pollution?.pm10 ?? 380} <span className="text-[10px] text-slate-500 font-normal">µg/m³</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase block font-medium">Dominant Driver</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {pollution?.dominant_pollutant ?? 'PM2.5'}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Secondary gases: NO₂: <strong>{pollution?.no2 ?? 72} µg/m³</strong> | O₃: <strong>{pollution?.o3 ?? 32} µg/m³</strong></span>
            <span className="text-rose-600 font-semibold">Exceedance: {Math.round(((pollution?.pm25 ?? 220) / 60) * 10) / 10}x NAAQS</span>
          </div>
        </div>
      </div>

      {/* 3. Core Dispersion KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Ventilation Index (VI)"
          value={vi}
          unit="m²/s"
          icon={Gauge}
          subtitle="Safe Cleansing Threshold: >6000 m²/s"
          badge={vi < 2000 ? "Severe Stagnation" : vi <= 6000 ? "Moderate Dilution" : "Favorable Cleansing"}
          badgeType={vi < 2000 ? "critical" : vi <= 6000 ? "warning" : "positive"}
        />
        <MetricCard
          title="Surface Wind Velocity"
          value={dispersion?.wind_speed ?? 1.8}
          unit="m/s"
          icon={Wind}
          subtitle="Horizontal transport driver"
          badge={(dispersion?.wind_speed ?? 1.8) < 2.0 ? "Sub-Critical Calm" : (dispersion?.wind_speed ?? 1.8) < 4.0 ? "Moderate Advection" : "Brisk Dispersion"}
          badgeType={(dispersion?.wind_speed ?? 1.8) < 2.0 ? "critical" : "positive"}
        />
        <MetricCard
          title="Planetary Boundary Layer"
          value={dispersion?.pbl_height ?? 380}
          unit="meters AGL"
          icon={Layers}
          subtitle="Vertical dilution mixing depth"
          badge={(dispersion?.pbl_height ?? 380) < 400 ? "Shallow Ceiling" : (dispersion?.pbl_height ?? 380) < 800 ? "Standard Mixing" : "Deep Convective Layer"}
          badgeType={(dispersion?.pbl_height ?? 380) < 400 ? "critical" : "positive"}
        />
        <MetricCard
          title="Aerosol Trapping Risk"
          value={risk}
          icon={ShieldAlert}
          subtitle="Risk of hour-by-hour buildup"
          badge={risk === "High" ? "Extreme Trapping" : risk === "Moderate" ? "Moderate Buildup" : "Clean Dilution"}
          badgeType={risk === "High" ? "critical" : risk === "Moderate" ? "warning" : "positive"}
        />
      </div>

      {/* 4. Interactive Atmospheric Dispersion Visualizations */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              {chartView === 'diurnal'
                ? 'Diurnal 24-Hour Ventilation Cycle & PM2.5 Trapping Dynamics'
                : 'Delhi NCR Regional Station Carrying Capacity Comparison'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {chartView === 'diurnal'
                ? 'Coupled temporal dynamics showing how daytime boundary layer growth ventilates pollutants and nighttime collapse drives severe smog peaks.'
                : 'Spatial gradient of atmospheric dispersion across 11 key monitoring stations throughout Delhi, Haryana, and UP.'}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setChartView('diurnal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartView === 'diurnal'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24-Hour Diurnal Cycle
            </button>
            <button
              onClick={() => setChartView('stations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartView === 'stations'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              NCR Multi-Station Ranking
            </button>
          </div>
        </div>

        {/* View 1: Diurnal Area Chart */}
        {chartView === 'diurnal' && dispersion?.hourly_dispersion_trend && (
          <div className="space-y-3">
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dispersion.hourly_dispersion_trend}
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="viGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    yAxisId="vi"
                    stroke="#0284c7"
                    fontSize={11}
                    tickLine={false}
                    unit=" m²/s"
                    domain={[0, 'auto']}
                  />
                  <YAxis
                    yAxisId="pm"
                    orientation="right"
                    stroke="#e11d48"
                    fontSize={11}
                    tickLine={false}
                    unit=" µg"
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<CustomDiurnalTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px' }}
                  />

                  {/* Safety Reference Lines */}
                  <ReferenceLine
                    yAxisId="vi"
                    y={6000}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{ value: 'Cleansing Threshold (>6000 m²/s)', position: 'insideTopLeft', fill: '#059669', fontSize: 10 }}
                  />
                  <ReferenceLine
                    yAxisId="vi"
                    y={2000}
                    stroke="#f43f5e"
                    strokeDasharray="4 4"
                    label={{ value: 'Critical Stagnation Limit (<2000 m²/s)', position: 'insideBottomLeft', fill: '#e11d48', fontSize: 10 }}
                  />

                  <Area
                    yAxisId="vi"
                    type="monotone"
                    dataKey="ventilation_index"
                    name="Ventilation Index (m²/s)"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#viGradient)"
                  />
                  <Line
                    yAxisId="pm"
                    type="monotone"
                    dataKey="pm25"
                    name="Coupled PM2.5 Concentration (µg/m³)"
                    stroke="#e11d48"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Night/Morning Collapse: VI &lt; 1,000 m²/s drives maximum PM2.5 entrapment
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Midday Thermal Expansion: Boundary layer expands up to 1,200m+ providing partial dilution
              </span>
            </div>
          </div>
        )}

        {/* View 2: Multi-Station Ranking Bar Chart */}
        {chartView === 'stations' && dispersion?.station_comparisons && (
          <div className="space-y-3">
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dispersion.station_comparisons}
                  margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#0284c7"
                    fontSize={11}
                    tickLine={false}
                    unit=" m²/s"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs space-y-1">
                            <strong className="block text-sky-400">{d.name} ({d.city})</strong>
                            <div>Ventilation Index: <strong>{d.ventilation_index} m²/s</strong></div>
                            <div>Dispersion Level: <span className="text-amber-400 font-bold">{d.dispersion_level}</span></div>
                            <div>Wind Speed: {d.wind_speed} m/s | PBL: {d.pbl_height} m</div>
                            <div>Current AQI: <strong>{d.aqi} ({d.aqi_category})</strong></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={2000} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Stagnation Limit (2000)', fill: '#e11d48', fontSize: 10 }} />
                  <Bar dataKey="ventilation_index" name="Ventilation Index" radius={[4, 4, 0, 0]}>
                    {dispersion.station_comparisons.map((entry, index) => {
                      const isSelected = entry.name.toLowerCase().includes(selectedLocation.toLowerCase()) ||
                                         selectedLocation.toLowerCase().includes(entry.name.toLowerCase());
                      const fillColor = isSelected
                        ? '#0284c7'
                        : entry.dispersion_level === 'High'
                        ? '#10b981'
                        : entry.dispersion_level === 'Moderate'
                        ? '#f59e0b'
                        : '#f43f5e';
                      return <Cell key={`cell-${index}`} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span>Selected station is highlighted in blue. Click any station in the top bar to inspect regional carrying capacity.</span>
              <div className="flex items-center gap-3 font-medium">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Stagnant (&lt;2000)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Moderate (2000-6000)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Favorable (&gt;6000)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Visual Chain of Causation Flow */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-600" />
          The Atmospheric Chain of Causation
        </h3>
        <p className="text-xs text-slate-500">
          Step-by-step physical breakdown explaining why current meteorological conditions suppress dispersion over {selectedLocation}.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {dispersion?.chain_of_causation?.map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-sky-300 transition-colors">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block mb-1">
                  Factor 0{idx + 1}
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">{item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Ventilation Index Scale Reference with Dynamic Indicator */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-600" />
          MoES / NCMRWF Ventilation Index Scale Reference
        </h4>

        <div className="space-y-3 text-xs">
          {/* Low / Stagnant */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
            vi < 2000
              ? 'bg-rose-50 border-rose-300 text-rose-950 ring-2 ring-rose-500/20 shadow-sm'
              : 'bg-slate-50/60 border-slate-200 text-slate-600 opacity-80'
          }`}>
            <div>
              <strong className="block text-rose-900 text-xs">
                Low / Stagnant (&lt; 2,000 m²/s) &mdash; CRITICAL RISK
              </strong>
              <span className="text-[11px] mt-0.5 block">
                Severe atmospheric trapping. Emissions remain confined to near-surface layer. AQI deteriorates rapidly.
              </span>
            </div>
            {vi < 2000 && (
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-[11px] shrink-0 shadow-sm animate-pulse">
                CURRENT STATE
              </span>
            )}
          </div>

          {/* Moderate */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
            vi >= 2000 && vi <= 6000
              ? 'bg-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-slate-50/60 border-slate-200 text-slate-600 opacity-80'
          }`}>
            <div>
              <strong className="block text-amber-900 text-xs">
                Moderate (2,000 – 6,000 m²/s) &mdash; INTERMEDIATE
              </strong>
              <span className="text-[11px] mt-0.5 block">
                Partial pollutant ventilation. Gradual accumulation during evening calm, moderate daytime clearing.
              </span>
            </div>
            {vi >= 2000 && vi <= 6000 && (
              <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-[11px] shrink-0 shadow-sm">
                CURRENT STATE
              </span>
            )}
          </div>

          {/* High */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
            vi > 6000
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-slate-50/60 border-slate-200 text-slate-600 opacity-80'
          }`}>
            <div>
              <strong className="block text-emerald-900 text-xs">
                High (&gt; 6,000 m²/s) &mdash; FAVORABLE DISPERSION
              </strong>
              <span className="text-[11px] mt-0.5 block">
                Atmosphere cleanses efficiently. Deep boundary layer mixing and sustained winds carry away particulate load.
              </span>
            </div>
            {vi > 6000 && (
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0 shadow-sm">
                CURRENT STATE
              </span>
            )}
          </div>
        </div>

        {/* Scientific Narrative */}
        <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-slate-600 text-xs">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {dispersion?.detailed_narrative}
          </p>
        </div>
      </div>
    </div>
  );
};
