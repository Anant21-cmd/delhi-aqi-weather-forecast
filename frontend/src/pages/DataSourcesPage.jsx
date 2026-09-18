import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Activity,
  Layers,
  Key,
  ShieldCheck,
  Server
} from 'lucide-react';
import { aqiService } from '../services/api';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const DataSourcesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sources, setSources] = useState([]);

  const fetchSources = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aqiService.getDataSources();
      setSources(res.data);
    } catch (err) {
      console.error('Failed to load data sources:', err);
      setError('Unable to query data pipeline status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  if (loading) {
    return <LoadingSkeleton height="h-[600px]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchSources} />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Data Pipeline Transparency & Ingestion Health
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-sky-600" />
            Scientific Upstream Data Sources
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Live health verification, latency diagnostics, and parameter inventory for observational and satellite feeds.
          </p>
        </div>

        <button
          onClick={fetchSources}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Ping Upstream Feeds</span>
        </button>
      </div>

      {/* Integration Instructions Card */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 text-sky-950 text-xs space-y-2">
        <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
          <Key className="w-4 h-4 text-sky-700" />
          <span>Live API Ingestion Configuration</span>
        </div>
        <p className="leading-relaxed text-sky-800">
          This system is architected for automated live ingestion. To transition from the centralized scientific mock layer to live feeds, simply set your API credentials in <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono text-[11px]">backend/.env</code>:
        </p>
        <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
          CPCB_API_KEY=your_cpcb_token<br />
          ERA5_API_KEY=your_copernicus_cds_key<br />
          NASA_FIRMS_MAP_KEY=your_earthdata_map_key<br />
          DEMO_MODE=false
        </div>
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sources.map((src) => {
          const isConnected = src.status.toLowerCase().includes('connected');

          return (
            <div
              key={src.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      isConnected
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                    {src.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Latency: {src.latency_ms}ms
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{src.source_name}</h3>
                <p className="text-xs text-slate-500 mt-1">{src.coverage}</p>

                {/* Variables Used */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Variables Ingested
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {src.variables_used.map((v, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-700 font-medium"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Data Quality Score:</span>
                  <strong className="text-emerald-600 font-bold">{src.quality_score}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Sync Protocol:</span>
                  <span className="font-mono text-[10px] text-slate-600">{src.protocol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Update Cadence:</span>
                  <span className="text-slate-600">{src.update_cadence}</span>
                </div>
                <div className="flex justify-between pt-1 text-[10px] text-slate-400">
                  <span>Last Handshake:</span>
                  <span>{new Date(src.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
