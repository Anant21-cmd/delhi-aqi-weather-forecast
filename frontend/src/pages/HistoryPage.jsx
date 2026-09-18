import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Wind,
  Flame,
  Info,
  ArrowRight
} from 'lucide-react';
import {
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
import { aqiService } from '../services/api';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const HistoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('today_vs_yesterday');
  const [historyData, setHistoryData] = useState(null);

  const fetchHistory = async (selectedPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aqiService.getHistory(selectedPeriod);
      setHistoryData(res.data);
    } catch (err) {
      console.error('Failed to load historical comparison:', err);
      setError('Unable to retrieve historical comparison records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(period);
  }, [period]);

  const periods = [
    { key: 'today_vs_yesterday', label: 'Today vs Yesterday' },
    { key: 'week_vs_last_week', label: 'Current Week vs Previous Week' },
    { key: 'episodic_post_diwali', label: 'Post-Diwali Smog Episode vs Baseline' }
  ];

  if (loading && !historyData) {
    return <LoadingSkeleton height="h-[600px]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchHistory(period)} />;
  }

  const metrics = historyData?.metrics || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              Comparative Longitudinal Analysis
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-sky-600" />
            Historical Conditions & Episode Comparison
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Side-by-side metric differences, delta evaluations, and multi-series trend visualizations.
          </p>
        </div>

        {/* Period Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                period === p.key ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delta Evaluation Narrative Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            {historyData?.current_label} &mdash; Comparative Delta Synthesis
          </span>
          <span className="text-xs text-slate-400">Compared to: {historyData?.previous_label}</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed max-w-4xl">
          {historyData?.delta_summary}
        </p>
      </div>

      {/* Metrics Comparison Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(metrics).map(([key, item]) => {
          const isWorse = item.delta_type === 'worse';
          const isBetter = item.delta_type === 'better';

          return (
            <div key={key} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {key.toUpperCase()}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    isWorse
                      ? 'bg-rose-100 text-rose-800'
                      : isBetter
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {isWorse && <TrendingUp className="w-3 h-3" />}
                  {isBetter && <TrendingDown className="w-3 h-3" />}
                  {item.delta} {item.unit}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xs text-slate-500 block">Current</span>
                  <strong className="text-xl font-extrabold text-slate-900">{item.current}</strong>
                  <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Prior</span>
                  <span className="text-sm font-semibold text-slate-500">{item.previous}</span>
                  <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Series Trend Evolution Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            Longitudinal Trend Curves ({historyData?.current_label} vs {historyData?.previous_label})
          </h3>
          <p className="text-xs text-slate-500">
            Compare diurnal curves to observe meteorological suppression and nocturnal peak spikes.
          </p>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData?.trend_series || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey={historyData?.trend_series?.[0]?.day ? 'day' : (historyData?.trend_series?.[0]?.time ? 'time' : 'hour')} tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis domain={[0, 'auto']} tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="current_aqi" stroke="#ef4444" strokeWidth={2.5} name={`${historyData?.current_label} (AQI)`} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="previous_aqi" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" name={`${historyData?.previous_label} (AQI)`} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
