import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Layers, Flame, Compass, RefreshCw, Filter, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aqiService } from '../services/api';
import { AQIBadge, getAQIColorConfig } from '../components/common/AQIBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

// Fix for default Leaflet marker icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create custom colored HTML pin for stations
const createStationPin = (aqi, isSelected) => {
  const cfg = getAQIColorConfig(aqi);
  return L.divIcon({
    className: 'custom-station-pin',
    html: `
      <div style="
        background-color: ${cfg.solid.replace('bg-', '') === 'red-800' ? '#7f1d1d' : cfg.solid.replace('bg-', '') === 'rose-600' ? '#e11d48' : cfg.solid.replace('bg-', '') === 'orange-500' ? '#f97316' : cfg.solid.replace('bg-', '') === 'amber-500' ? '#f59e0b' : '#10b981'};
        color: white;
        padding: 3px 6px;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 11px;
        text-align: center;
        border: ${isSelected ? '3px solid #0284c7' : '2px solid white'};
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 3px;
      ">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: white; display: inline-block;"></span>
        ${aqi}
      </div>
    `,
    iconSize: [45, 24],
    iconAnchor: [22, 12]
  });
};

const createFirePin = (frp) => {
  return L.divIcon({
    className: 'custom-fire-pin',
    html: `
      <div style="
        background-color: #ef4444;
        color: white;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 0 8px #ef4444;
      ">
        <span style="font-size: 10px;">🔥</span>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

export const AQIMapPage = () => {
  const { selectedLocation, setSelectedLocation } = useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stations, setStations] = useState([]);
  const [fireData, setFireData] = useState(null);
  const [plumeData, setPlumeData] = useState(null);

  // Layer Toggles
  const [showStations, setShowStations] = useState(true);
  const [showFires, setShowFires] = useState(true);
  const [showPlume, setShowPlume] = useState(true);
  const [showZones, setShowZones] = useState(true);

  const fetchMapData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stnRes, fireRes, plumeRes] = await Promise.all([
        aqiService.getLocationsOverview(),
        aqiService.getFireHotspots(),
        aqiService.getPlumeEstimate({
          source_lat: 30.245,
          source_lon: 75.834,
          wind_speed: 12.0,
          wind_dir: 315.0
        })
      ]);

      setStations(stnRes.data);
      setFireData(fireRes.data);
      setPlumeData(plumeRes.data);
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError('Unable to load map overlay data from backend services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  if (loading) {
    return <LoadingSkeleton height="h-[650px]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchMapData} />;
  }

  // Delhi NCR center coordinate
  const mapCenter = [28.8, 76.9];

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Map Header & Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600" />
            Interactive Delhi NCR Air Quality & Coupled Transport Map
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time CPCB station markers &bull; NASA FIRMS satellite fire hotspots &bull; Downwind plume dispersion cone
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowStations(!showStations)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showStations ? 'bg-sky-50 text-sky-800 border-sky-300' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${showStations ? 'text-sky-600' : 'opacity-0'}`} />
            <span>Stations ({stations.length})</span>
          </button>

          <button
            onClick={() => setShowFires(!showFires)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showFires ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>FIRMS Fires ({fireData?.total_count})</span>
          </button>

          <button
            onClick={() => setShowPlume(!showPlume)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showPlume ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Plume Cone (NW→SE)</span>
          </button>

          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showZones ? 'bg-purple-50 text-purple-800 border-purple-300' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-purple-600" />
            <span>Trapping Zones</span>
          </button>

          <button
            onClick={fetchMapData}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 border border-slate-200"
            title="Refresh Map Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Container Viewport */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm overflow-hidden h-[620px] relative">
        <MapContainer
          center={mapCenter}
          zoom={8}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Pollution Trapping Zones (Circles centered on urban basins) */}
          {showZones && (
            <>
              {/* Central Delhi - East NCR High Trapping Core */}
              <Circle
                center={[28.64, 77.28]}
                radius={26000}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.12,
                  weight: 1.5,
                  dashArray: '4, 4'
                }}
              />
              {/* Haryana Agricultural Buffer Zone */}
              <Circle
                center={[29.8, 76.5]}
                radius={45000}
                pathOptions={{
                  color: '#f59e0b',
                  fillColor: '#f59e0b',
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '3, 6'
                }}
              />
            </>
          )}

          {/* Forward Smoke Plume Polygon (Downwind Dispersion Cone) */}
          {showPlume && plumeData?.plume_cone && (
            <Polygon
              positions={plumeData.plume_cone}
              pathOptions={{
                color: '#b45309',
                fillColor: '#d97706',
                fillOpacity: 0.22,
                weight: 2,
                dashArray: '6, 6'
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <h4 className="font-bold text-amber-900 uppercase">Estimated Smoke Plume Cone</h4>
                  <p className="text-slate-600 mt-1">Origin: {plumeData.origin_region}</p>
                  <p className="text-slate-600">Trajectory: {plumeData.plume_direction}</p>
                  <p className="text-slate-600 font-bold text-rose-600">NCR Impact: {plumeData.ncr_impact_likelihood}%</p>
                  <p className="text-[10px] text-amber-800 mt-1 font-semibold">{plumeData.model_estimate_note}</p>
                </div>
              </Popup>
            </Polygon>
          )}

          {/* Centerline of Plume Trajectory */}
          {showPlume && plumeData?.trajectory_points && (
            <Polyline
              positions={plumeData.trajectory_points.map(p => [p.lat, p.lon])}
              pathOptions={{ color: '#b45309', weight: 2.5 }}
            />
          )}

          {/* Station Markers */}
          {showStations && stations.map((stn) => {
            const isSelected = selectedLocation === stn.name;
            return (
              <Marker
                key={stn.id}
                position={[stn.latitude, stn.longitude]}
                icon={createStationPin(stn.aqi, isSelected)}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-2 min-w-[200px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-slate-900">{stn.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{stn.station_code}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <AQIBadge aqi={stn.aqi} category={stn.aqi_category} size="sm" />
                      <span className="text-slate-700 font-bold">AQI {stn.aqi}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 pt-1">
                      <div>PM2.5: <strong>{stn.pm25} µg/m³</strong></div>
                      <div>PM10: <strong>{stn.pm10} µg/m³</strong></div>
                      <div>Wind: <strong>{stn.wind_speed} m/s</strong></div>
                      <div>PBL: <strong>{stn.pbl_height}m</strong></div>
                    </div>

                    <button
                      onClick={() => setSelectedLocation(stn.name)}
                      className={`w-full py-1.5 rounded text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-sky-600 hover:bg-sky-700 text-white'
                      }`}
                    >
                      {isSelected ? '✓ Currently Active Station' : 'Select As Active Station'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* NASA FIRMS Fire Hotspot Markers */}
          {showFires && fireData?.hotspots?.map((fire) => (
            <Marker
              key={fire.id}
              position={[fire.latitude, fire.longitude]}
              icon={createFirePin(fire.frp)}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1.5 min-w-[190px]">
                  <div className="flex items-center gap-1 text-rose-600 font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>NASA FIRMS Thermal Hotspot</span>
                  </div>
                  <div className="text-slate-700">
                    Location: <strong>{fire.district}, {fire.region}</strong>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Satellite: {fire.satellite} | FRP: <strong>{fire.frp} MW</strong>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Confidence: {fire.confidence}%
                  </div>
                  <div className="p-1.5 bg-amber-50 rounded border border-amber-200 text-[10px] text-amber-900">
                    <strong>Application-inferred Agri Likelihood:</strong> {fire.agri_burning_likelihood}%
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-2 max-w-xs">
          <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">CPCB AQI Categories</span>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 shrink-0"></span>
              <span>Good (0-50)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-lime-500 shrink-0"></span>
              <span>Satisfactory (51-100)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 shrink-0"></span>
              <span>Moderate (101-200)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-orange-500 shrink-0"></span>
              <span>Poor (201-300)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-600 shrink-0"></span>
              <span>Very Poor (301-400)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-900 shrink-0"></span>
              <span>Severe (401-500+)</span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>🔥 FIRMS Thermal Hotspots</span>
            <span>💨 Smoke Plume Cone</span>
          </div>
        </div>
      </div>
    </div>
  );
};
