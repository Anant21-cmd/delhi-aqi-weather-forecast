import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  Wind,
  Layers,
  MapPin,
  Sliders,
  AlertTriangle,
  Info,
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { aqiService } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const PlumePredictionPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Plume input parameters
  const [selectedFireOrigin, setSelectedFireOrigin] = useState('Sangrur');
  const [windSpeed, setWindSpeed] = useState(12.0); // km/h
  const [windDir, setWindDir] = useState(315.0); // deg (NW)
  const [plumeResult, setPlumeResult] = useState(null);

  const fireLocations = [
    { name: 'Sangrur, Punjab', lat: 30.245, lon: 75.834 },
    { name: 'Bathinda, Punjab', lat: 30.342, lon: 75.452 },
    { name: 'Firozpur, Punjab', lat: 31.124, lon: 75.210 },
    { name: 'Karnal, Haryana', lat: 29.685, lon: 76.985 },
    { name: 'Kurukshetra, Haryana', lat: 29.965, lon: 76.880 },
    { name: 'Kaithal, Haryana', lat: 29.805, lon: 76.402 }
  ];

  const fetchPlume = async (originName, speed, dir) => {
    setLoading(true);
    setError(null);
    try {
      const loc = fireLocations.find(f => f.name.startsWith(originName)) || fireLocations[0];
      const res = await aqiService.getPlumeEstimate({
        source_lat: loc.lat,
        source_lon: loc.lon,
        wind_speed: speed,
        wind_dir: dir
      });
      setPlumeResult(res.data);
    } catch (err) {
      console.error('Failed to load plume estimate:', err);
      setError('Unable to compute forward smoke plume trajectory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlume(selectedFireOrigin, windSpeed, windDir);
  }, []);

  const handleOriginChange = (name) => {
    setSelectedFireOrigin(name);
    fetchPlume(name, windSpeed, windDir);
  };

  const handleWindSpeedChange = (spd) => {
    setWindSpeed(spd);
    fetchPlume(selectedFireOrigin, spd, windDir);
  };

  const handleWindDirChange = (dir) => {
    setWindDir(dir);
    fetchPlume(selectedFireOrigin, windSpeed, dir);
  };

  if (loading && !plumeResult) {
    return <LoadingSkeleton height="h-[650px]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchPlume(selectedFireOrigin, windSpeed, windDir)} />;
  }

  // Delhi NCR center coordinate
  const ncrCenter = [28.6139, 77.2090];
  const sourcePos = [plumeResult?.source_lat || 30.245, plumeResult?.source_lon || 75.834];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              Atmospheric Transport & Dispersion Model
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Smoke Plume Trajectory & Forward Dispersion Predictor
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Lagrangian advection and Pasquill-Gifford stability dispersion estimating upwind biomass smoke transit into Delhi NCR.
          </p>
        </div>

        {/* Mandatory Model Estimate Tag */}
        <div className="bg-amber-50 border border-amber-300 px-4 py-2 rounded-xl text-amber-950 text-xs shrink-0 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="font-extrabold block uppercase tracking-wider text-[11px]">MODEL ESTIMATE</span>
            <span className="text-[10px] text-amber-800">Not guaranteed real-world trajectory</span>
          </div>
        </div>
      </div>

      {/* Model Estimates KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Delhi NCR Impact Likelihood"
          value={`${plumeResult?.ncr_impact_likelihood}%`}
          icon={Compass}
          subtitle={`Severity: ${plumeResult?.impact_severity}`}
          badge={plumeResult?.ncr_impact_likelihood > 60 ? "Direct Trajectory" : "Marginal Impact"}
          badgeType={plumeResult?.ncr_impact_likelihood > 60 ? "critical" : "warning"}
        />
        <MetricCard
          title="Estimated Plume Reach"
          value={plumeResult?.estimated_reach_km}
          unit="km downwind"
          icon={Wind}
          subtitle={`Trajectory Direction: ${plumeResult?.plume_direction}`}
          badge="Sustained Transit"
          badgeType="warning"
        />
        <MetricCard
          title="Estimated Transit Travel Time"
          value={plumeResult?.travel_time_hours}
          unit="hours to NCR"
          icon={Clock}
          subtitle={`Wind Velocity: ${plumeResult?.wind_speed_kmh} km/h`}
          badge="Advective Lag"
          badgeType="neutral"
        />
        <MetricCard
          title="Downwind Transport Bearing"
          value={`${plumeResult?.wind_bearing}°`}
          icon={Compass}
          subtitle="Angle of downwind smoke cone"
          badge="North-West Corridor"
          badgeType="info"
        />
      </div>

      {/* Map & Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Controls Column */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              Plume Model Parameters
            </h3>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">MODEL ESTIMATE</span>
          </div>

          {/* Origin Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Source Fire Cluster Origin</label>
            <select
              value={selectedFireOrigin}
              onChange={(e) => handleOriginChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-slate-50 focus:ring-1 focus:ring-sky-500 outline-none"
            >
              {fireLocations.map((f) => (
                <option key={f.name} value={f.name.split(',')[0]}>
                  {f.name} ({f.lat}°N, {f.lon}°E)
                </option>
              ))}
            </select>
          </div>

          {/* Wind Speed Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Transport Wind Speed</span>
              <span className="text-sky-700 font-mono font-bold">{windSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="4.0"
              max="28.0"
              step="1.0"
              value={windSpeed}
              onChange={(e) => handleWindSpeedChange(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>4 km/h (Slow transit)</span>
              <span>28 km/h (Rapid transit)</span>
            </div>
          </div>

          {/* Wind Direction Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Upwind Meteorological Direction</span>
              <span className="text-amber-700 font-mono font-bold">{windDir}° (NW)</span>
            </div>
            <input
              type="range"
              min="270"
              max="360"
              step="5"
              value={windDir}
              onChange={(e) => handleWindDirChange(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>270° (Westerly)</span>
              <span>315° (NW &rarr; Delhi)</span>
              <span>360° (Northerly)</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-600" /> Model Physics Specification
            </span>
            <p className="text-[11px] leading-relaxed">
              {plumeResult?.model_estimate_note}
            </p>
          </div>
        </div>

        {/* Trajectory Leaflet Map Viewport */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-2 border border-slate-200 shadow-sm overflow-hidden h-[540px] relative">
          <MapContainer
            center={[29.4, 76.5]}
            zoom={7}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Source Fire Pin */}
            <Marker position={sourcePos}>
              <Popup>
                <div className="text-xs p-1">
                  <h4 className="font-bold text-rose-600">Active Fire Source</h4>
                  <p>{plumeResult?.origin_region}</p>
                </div>
              </Popup>
            </Marker>

            {/* Delhi NCR Target Circle */}
            <Circle
              center={ncrCenter}
              radius={35000}
              pathOptions={{
                color: '#0284c7',
                fillColor: '#0284c7',
                fillOpacity: 0.15,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <h4 className="font-bold text-sky-800">Delhi NCR Target Receptor</h4>
                  <p className="text-slate-600">Receptor Air Quality Domain</p>
                </div>
              </Popup>
            </Circle>

            {/* Smoke Plume Dispersion Cone Polygon */}
            {plumeResult?.plume_cone && (
              <Polygon
                positions={plumeResult.plume_cone}
                pathOptions={{
                  color: '#b45309',
                  fillColor: '#d97706',
                  fillOpacity: 0.28,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <h4 className="font-bold text-amber-900">MODEL ESTIMATE: Smoke Dispersion Cone</h4>
                    <p className="text-slate-600">Direction: {plumeResult.plume_direction}</p>
                    <p className="text-rose-600 font-bold">NCR Impact Risk: {plumeResult.ncr_impact_likelihood}%</p>
                  </div>
                </Popup>
              </Polygon>
            )}

            {/* Plume Centerline Polyline */}
            {plumeResult?.trajectory_points && (
              <Polyline
                positions={plumeResult.trajectory_points.map(p => [p.lat, p.lon])}
                pathOptions={{ color: '#b45309', weight: 3 }}
              />
            )}
          </MapContainer>

          {/* Map Overlay Badge */}
          <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-300 shadow-md text-xs font-bold text-amber-950 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>MODEL ESTIMATE &mdash; Forward Dispersion Cone</span>
          </div>
        </div>
      </div>
    </div>
  );
};
