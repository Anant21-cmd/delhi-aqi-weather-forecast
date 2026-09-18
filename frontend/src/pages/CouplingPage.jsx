import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Sun,
  Wind,
  Layers,
  Activity,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Sliders,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aqiService } from '../services/api';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const CouplingPage = () => {
  const { selectedLocation } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Coupling data from API
  const [couplingData, setCouplingData] = useState(null);

  // Interactive Simulation Controls
  const [simWind, setSimWind] = useState(1.8);
  const [simPbl, setSimPbl] = useState(380);
  const [simPm25, setSimPm25] = useState(220);
  const [simInversion, setSimInversion] = useState(true);
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Fetch initial coupling status
  const fetchCoupling = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aqiService.getCoupling(selectedLocation);
      setCouplingData(res.data);
      // Initialize simulation controls with current values
      setSimWind(res.data.wind_speed);
      setSimPbl(res.data.pbl_height);
      setSimPm25(res.data.aerosol_loading_pm25);
      setSimResult(res.data);
    } catch (err) {
      console.error('Failed to load coupling data:', err);
      setError('Unable to initialize coupled atmospheric-chemical model.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupling();
  }, [selectedLocation]);

  // Run simulation whenever controls change
  const runSimulation = async (w, p, pm, inv) => {
    setSimulating(true);
    try {
      const res = await aqiService.simulateCoupling({
        wind_speed: parseFloat(w),
        pbl_height: parseFloat(p),
        aerosol_pm25: parseFloat(pm),
        inversion_layer: Boolean(inv),
      });
      setSimResult(res.data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleWindChange = (val) => {
    setSimWind(val);
    runSimulation(val, simPbl, simPm25, simInversion);
  };

  const handlePblChange = (val) => {
    setSimPbl(val);
    runSimulation(simWind, val, simPm25, simInversion);
  };

  const handlePm25Change = (val) => {
    setSimPm25(val);
    runSimulation(simWind, simPbl, val, simInversion);
  };

  const handleInversionToggle = () => {
    const next = !simInversion;
    setSimInversion(next);
    runSimulation(simWind, simPbl, simPm25, next);
  };

  if (loading) {
    return <LoadingSkeleton height="h-[650px]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchCoupling} />;
  }

  const activeResult = simResult || couplingData;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              Two-Way Atmospheric-Chemical Coupling
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Weather–Pollution Radiative Feedback Lab
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing the vicious positive feedback loop: Weather traps aerosols &rarr; Aerosols dim sunlight &rarr; Suppresses boundary layer &rarr; Traps more aerosols.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-amber-950 text-xs shrink-0 max-w-sm">
          <div className="flex items-center gap-2 font-bold mb-0.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Self-Reinforcing Feedback Active</span>
          </div>
          <p className="text-[11px] text-amber-800">
            {activeResult?.scientific_summary}
          </p>
        </div>
      </div>

      {/* Interactive Cause-and-Effect Loop Diagram */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
              <RotateCw className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Coupled Feedback Loop Dynamics</h3>
              <p className="text-xs text-slate-400">Continuous 2-way energy & mass flux between boundary layer and aerosols</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {activeResult?.feedback_state}
          </span>
        </div>

        {/* 5-Step Visual Loop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10">
          {activeResult?.feedback_steps?.map((step, idx) => (
            <div
              key={step.step}
              className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
                step.type === 'feedback'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-100 ring-1 ring-rose-500/30'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Step 0{step.step}</span>
                  {step.type === 'cause' && <Wind className="w-4 h-4 text-sky-400" />}
                  {step.type === 'mechanism' && <Sun className="w-4 h-4 text-amber-400" />}
                  {step.type === 'effect' && <Layers className="w-4 h-4 text-teal-400" />}
                  {step.type === 'feedback' && <RotateCw className="w-4 h-4 text-rose-400 animate-spin" style={{ animationDuration: '8s' }} />}
                </div>
                <h4 className="text-xs font-bold mb-1.5 leading-snug">{step.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{step.description}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                <span className="capitalize">{step.type}</span>
                <span>&rarr; Next</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Simulation Lab Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              Atmospheric Parameter Controls
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Live Sandbox</span>
          </div>

          {/* Slider 1: Wind Speed */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Surface Wind Velocity</span>
              <span className="text-sky-700 font-mono font-bold">{simWind} m/s</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="7.0"
              step="0.1"
              value={simWind}
              onChange={(e) => handleWindChange(e.target.value)}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.5 m/s (Calm stagnation)</span>
              <span>7.0 m/s (Strong flush)</span>
            </div>
          </div>

          {/* Slider 2: Baseline PBL Height */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Theoretical Clear-Sky PBL</span>
              <span className="text-teal-700 font-mono font-bold">{simPbl} meters</span>
            </div>
            <input
              type="range"
              min="200"
              max="1400"
              step="20"
              value={simPbl}
              onChange={(e) => handlePblChange(e.target.value)}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>200m (Shallow winter night)</span>
              <span>1400m (Deep summer midday)</span>
            </div>
          </div>

          {/* Slider 3: Aerosol Loading (PM2.5) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Initial Aerosol Loading</span>
              <span className="text-rose-700 font-mono font-bold">{simPm25} µg/m³</span>
            </div>
            <input
              type="range"
              min="25"
              max="450"
              step="5"
              value={simPm25}
              onChange={(e) => handlePm25Change(e.target.value)}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>25 µg/m³ (Clean monsoon)</span>
              <span>450 µg/m³ (Post-Diwali emergency)</span>
            </div>
          </div>

          {/* Inversion Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Atmospheric Inversion Lid</span>
              <span className="text-[11px] text-slate-500">Adds static thermal stability suppression</span>
            </div>
            <button
              onClick={handleInversionToggle}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                simInversion ? 'bg-sky-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  simInversion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Real-time Computed Coupling Results */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Simulated Coupled Atmospheric Response
              </h3>
              {simulating && <span className="text-xs text-sky-600 animate-pulse font-medium">Computing...</span>}
            </div>

            {/* Computed Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-900 block">Solar Dimming</span>
                <div className="text-2xl font-black text-amber-950 mt-1">
                  -{activeResult?.solar_attenuation_watts}
                </div>
                <span className="text-[10px] text-amber-800">W/m² reduction</span>
              </div>

              <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200 text-center">
                <span className="text-[10px] uppercase font-bold text-sky-900 block">PBL Compression</span>
                <div className="text-2xl font-black text-sky-950 mt-1">
                  {activeResult?.boundary_layer_compression_pct}%
                </div>
                <span className="text-[10px] text-sky-800">Expansion suppressed</span>
              </div>

              <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-200 text-center">
                <span className="text-[10px] uppercase font-bold text-teal-900 block">Effective PBL</span>
                <div className="text-2xl font-black text-teal-950 mt-1">
                  {activeResult?.effective_pbl}m
                </div>
                <span className="text-[10px] text-teal-800">Reduced ceiling</span>
              </div>

              <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 text-center">
                <span className="text-[10px] uppercase font-bold text-rose-900 block">Trapped PM2.5</span>
                <div className="text-2xl font-black text-rose-950 mt-1">
                  {activeResult?.coupled_pm25}
                </div>
                <span className="text-[10px] text-rose-800">µg/m³ (+{Math.round(activeResult?.coupled_pm25 - simPm25)})</span>
              </div>
            </div>

            {/* Comparative Visualizer: Clear-Sky vs Coupled Atmosphere */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Boundary Layer Vertical Dilution Comparison
              </h4>

              {/* Clear-sky baseline bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Theoretical Clear-Sky Convective Dilution Ceiling</span>
                  <span className="font-bold text-slate-900">{simPbl} meters</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (simPbl / 1400) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Effective coupled bar under aerosol dimming */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Effective Coupled PBL (Under Aerosol Solar Dimming & Inversion)</span>
                  <span className="font-bold text-rose-600">{activeResult?.effective_pbl} meters</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (activeResult?.effective_pbl / 1400) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-950 leading-relaxed">
            <strong>Key Scientific Takeaway:</strong> High aerosol loading suppresses surface solar heating by <strong>{activeResult?.solar_attenuation_watts} W/m²</strong>, crushing convective plumes and shrinking the mixing ceiling by <strong>{activeResult?.boundary_layer_compression_pct}%</strong>. This concentrates ground emissions from {simPm25} to <strong>{activeResult?.coupled_pm25} µg/m³</strong> without adding any new emissions.
          </div>
        </div>
      </div>
    </div>
  );
};
