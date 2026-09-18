import React, { useState, useEffect } from 'react';
import {
  Flame,
  Filter,
  ShieldAlert,
  Info,
  ExternalLink,
  MapPin,
  RefreshCw,
  Search
} from 'lucide-react';
import { aqiService } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const FireDetectionPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fireSummary, setFireSummary] = useState(null);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [minFRP, setMinFRP] = useState(10);
  const [minConfidence, setMinConfidence] = useState(70);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFires = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aqiService.getFireHotspots();
      setFireSummary(res.data);
    } catch (err) {
      console.error('Failed to load fire hotspots:', err);
      setError('Unable to retrieve thermal anomaly feed from NASA FIRMS pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFires();
  }, []);

  if (loading) {
    return <LoadingSkeleton height="h-[600px]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchFires} />;
  }

  // Filter hotspots
  const filteredHotspots = fireSummary?.hotspots?.filter((h) => {
    if (selectedRegion !== 'All' && h.region !== selectedRegion) return false;
    if (h.frp < minFRP) return false;
    if (h.confidence < minConfidence) return false;
    if (searchQuery && !h.district.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              NASA FIRMS NRT Satellite Surveillance
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Regional Thermal Hotspot & Agricultural Burning Detector
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            MODIS (Terra/Aqua) & VIIRS (S-NPP/NOAA-20) 375m fire detection across Punjab, Haryana, and NCR agricultural corridors.
          </p>
        </div>

        <button
          onClick={fetchFires}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Satellite Pass</span>
        </button>
      </div>

      {/* Mandatory Scientific Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-950 text-xs flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="block text-amber-900 uppercase font-bold text-[11px] mb-0.5">
            Important Attribution & Methodology Notice:
          </strong>
          {fireSummary?.inference_disclaimer}
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Active Hotspots"
          value={fireSummary?.total_count}
          unit="detections"
          icon={Flame}
          subtitle="Past 24-Hour Satellite Orbit"
          badge="Elevated Activity"
          badgeType="critical"
        />
        <MetricCard
          title="Punjab Agricultural Hotspots"
          value={fireSummary?.punjab_count}
          unit="hotspots"
          icon={MapPin}
          subtitle="Sangrur, Bathinda, Firozpur"
          badge="Primary Upwind Cluster"
          badgeType="warning"
        />
        <MetricCard
          title="Haryana Detections"
          value={fireSummary?.haryana_count}
          unit="hotspots"
          icon={MapPin}
          subtitle="Karnal, Kurukshetra, Kaithal"
          badge="Secondary Upwind Belt"
          badgeType="warning"
        />
        <MetricCard
          title="Mean Fire Radiative Power (FRP)"
          value={fireSummary?.avg_frp}
          unit="MW"
          icon={Flame}
          subtitle="Biomass combustion intensity"
          badge="Moderate Intensity"
          badgeType="neutral"
        />
      </div>

      {/* Filters & Interactive Hotspots Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">NASA FIRMS Hotspots Inventory</h3>
            <p className="text-xs text-slate-500">Showing {filteredHotspots.length} of {fireSummary?.total_count} recorded fire anomalies.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-sky-500 outline-none w-36 sm:w-44"
              />
            </div>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Regions</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>

            {/* Min FRP Slider */}
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span>Min FRP:</span>
              <span className="font-bold text-slate-900">{minFRP} MW</span>
              <input
                type="range"
                min="5"
                max="60"
                value={minFRP}
                onChange={(e) => setMinFRP(Number(e.target.value))}
                className="w-16 sm:w-24 accent-rose-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Hotspots Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">District & Region</th>
                <th className="py-3 px-4">Coordinates</th>
                <th className="py-3 px-4">Satellite Sensor</th>
                <th className="py-3 px-4">FRP (MW)</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Application-Inferred Agri Likelihood</th>
                <th className="py-3 px-4">Acquisition Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredHotspots.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {item.district}, <span className="text-slate-500 font-normal">{item.region}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                    {item.latitude.toFixed(3)}°N, {item.longitude.toFixed(3)}°E
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">
                      {item.satellite}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-600 font-mono">
                    {item.frp} MW
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold">{item.confidence}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.agri_burning_likelihood >= 80
                          ? 'bg-rose-100 text-rose-800'
                          : item.agri_burning_likelihood >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.agri_burning_likelihood}%
                      </span>
                      <span className="text-[10px] text-slate-400">Application-Inferred</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                    {new Date(item.acq_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
