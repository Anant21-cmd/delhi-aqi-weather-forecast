import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PieChart as PieIcon,
  TrendingUp,
  ShieldCheck,
  Compass,
  AlertCircle,
  FileText,
  CheckCircle2,
  Share2
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { aqiService } from '../services/api';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const InsightsPage = () => {
  const { selectedLocation } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aqiService.getInsights(selectedLocation);
      setInsights(res.data);
    } catch (err) {
      console.error('Failed to load diagnostic insights:', err);
      setError('Unable to generate cause-based environmental insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [selectedLocation]);

  if (loading) {
    return <LoadingSkeleton height="h-[600px]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchInsights} />;
  }

  const pieData = insights?.source_apportionment?.map((s) => ({
    name: s.source,
    value: s.percentage,
    color: s.color,
  })) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              Automated Chemical Transport Intelligence
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Diagnostic Cause-Based Analysis & Source Apportionment
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quantitative attribution of atmospheric pollution into local emissions, meteorological stagnation, and regional biomass transport.
          </p>
        </div>

        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Model Confidence: {insights?.model_confidence_score}%</span>
        </div>
      </div>

      {/* Main Executive Summary Card */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Official NCMRWF Automated Intelligence Narrative</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black leading-tight">
          {insights?.headline}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          {insights?.primary_cause_summary}
        </p>

        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <div>
            Meteorological Stagnation Share: <strong className="text-amber-400 font-mono text-sm">{insights?.weather_contribution_pct}%</strong>
          </div>
          <div>
            Regional Biomass Plume Share: <strong className="text-rose-400 font-mono text-sm">{insights?.regional_fire_contribution_pct}%</strong>
          </div>
          <div>
            Urban Baseline Emissions: <strong className="text-sky-400 font-mono text-sm">{insights?.emission_contribution_pct}%</strong>
          </div>
        </div>
      </div>

      {/* Source Apportionment Chart & Trends Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Apportionment Pie */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-sky-600" />
            Estimated Source Contribution Breakdown
          </h3>
          <p className="text-xs text-slate-500">
            Calculated for {selectedLocation} using boundary layer ventilation coupling and upwind satellite trajectories.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Contribution']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Trend Outlook */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-sky-600" />
              Dynamic Atmospheric Outlook & Projections
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PM2.5 Diurnal Dynamics</span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {insights?.pm25_trend_assessment}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">72-Hour Projected AQI Evolution</span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {insights?.expected_aqi_trend_72h}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-emerald-950">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Actionable Decision Support & Health Guidance
                </span>
                <p className="text-xs leading-relaxed">
                  {insights?.actionable_advisory}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Generated dynamically by Model API</span>
            <span className="font-mono">NCMRWF Model Run #2026-A</span>
          </div>
        </div>
      </div>
    </div>
  );
};
