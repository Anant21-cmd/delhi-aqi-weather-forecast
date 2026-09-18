import React, { useState, useEffect } from 'react';
import {
  Layers,
  Thermometer,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  Info,
  Activity,
  Compass
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { useApp } from '../context/AppContext';
import { aqiService } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const InversionPage = () => {
  const { selectedLocation } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inversion, setInversion] = useState(null);

  const fetchInversion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aqiService.getInversion(selectedLocation);
      setInversion(res.data);
    } catch (err) {
      console.error('Failed to load inversion sounding:', err);
      setError('Unable to retrieve vertical radiosonde sounding from NCMRWF feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInversion();
  }, [selectedLocation]);

  if (loading) {
    return <LoadingSkeleton height="h-[600px]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchInversion} />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Vertical Thermodynamic Sounding
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Atmospheric Inversion & Thermal Lid Monitor &mdash; {selectedLocation}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Vertical temperature lapse rate diagnosis ($dT/dz$) identifying nocturnal radiation and subsidence inversions.
          </p>
        </div>

        <div className={`p-3.5 rounded-xl border text-xs shrink-0 ${
          inversion?.status === 'Strong'
            ? 'bg-rose-50 border-rose-300 text-rose-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-0.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Inversion Status: {inversion?.status}</span>
          </div>
          <span className="text-[11px]">
            Trapping Risk: <strong>{inversion?.trapping_risk}</strong> | Dispersion: <strong>{inversion?.dispersion_condition}</strong>
          </span>
        </div>
      </div>

      {/* Inversion Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Inversion Base Height"
          value={inversion?.base_height_m}
          unit="meters AGL"
          icon={Layers}
          subtitle="Elevation where warming begins"
          badge="Critical Lid"
          badgeType="critical"
        />
        <MetricCard
          title="Inversion Top Height"
          value={inversion?.top_height_m}
          unit="meters AGL"
          icon={ArrowUpRight}
          subtitle={`Layer Depth: ${inversion?.depth_m}m`}
          badge={`ΔT: +${inversion?.delta_temp}°C`}
          badgeType="warning"
        />
        <MetricCard
          title="Layer Lapse Rate"
          value={`+${inversion?.lapse_rate}`}
          unit="°C / km"
          icon={Thermometer}
          subtitle="Normal atmosphere cools at -6.5°C/km"
          badge="Inverted Profile"
          badgeType="critical"
        />
        <MetricCard
          title="Pollution Trapping Risk"
          value={inversion?.trapping_risk}
          icon={ShieldAlert}
          subtitle="Buoyancy shutdown severity"
          badge={inversion?.trapping_risk === "Severe" ? "Emergency Stagnation" : "Elevated"}
          badgeType="critical"
        />
      </div>

      {/* Vertical Sounding Profile Chart (Altitude vs Temperature) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-600" />
                Atmospheric Sounding: Altitude vs Temperature Profile
              </h3>
              <p className="text-xs text-slate-500">
                Notice the bulge between {inversion?.base_height_m}m and {inversion?.top_height_m}m where temperature increases with height.
              </p>
            </div>
            <span className="text-xs font-mono bg-purple-50 text-purple-700 px-2.5 py-1 rounded border border-purple-200">
              Thermal Inversion Zone ({inversion?.base_height_m}m – {inversion?.top_height_m}m)
            </span>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={inversion?.sounding_profile || []}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" dataKey="temperature" unit="°C" domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis type="number" dataKey="altitude" unit="m" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name) => [`${val}°C`, name === 'temperature' ? 'Ambient Temp' : 'Dew Point']}
                  labelFormatter={(alt) => `Altitude: ${alt} meters AGL`}
                />
                <ReferenceArea
                  y1={inversion?.base_height_m}
                  y2={inversion?.top_height_m}
                  stroke="#ef4444"
                  strokeOpacity={0.4}
                  fill="#ef4444"
                  fillOpacity={0.12}
                />
                <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={3} name="Dry Bulb Temp (°C)" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="dew_point" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" name="Dew Point (°C)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scientific Explanation Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-600" />
              Why Current Conditions Trap Pollution
            </h4>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                {inversion?.scientific_explanation}
              </p>
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 space-y-1">
                <span className="font-bold block text-rose-900">The "Thermal Lid" Mechanism:</span>
                <p className="text-[11px]">
                  Warm air is naturally less dense than cold air. When a warm layer caps a cooler surface layer, any rising smoke or vehicle exhaust cools and immediately loses buoyancy. It cannot penetrate the warm layer, rebounding back towards ground level.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500">
            <strong>Expected Breakup:</strong> Requires surface solar insolation &gt; 450 W/m² or wind speed pickup &gt; 3.5 m/s to erode nocturnal inversion.
          </div>
        </div>
      </div>
    </div>
  );
};
