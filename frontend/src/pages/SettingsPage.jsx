import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  MapPin,
  Sliders,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aqiService } from '../services/api';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const SettingsPage = () => {
  const { user, loginUser, locations, selectedLocation, setSelectedLocation } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form State
  const [name, setName] = useState('Dr. S. K. Sharma');
  const [preferredLoc, setPreferredLoc] = useState('Delhi (Anand Vihar)');
  const [notifications, setNotifications] = useState(true);
  const [aqiThreshold, setAqiThreshold] = useState(250);
  const [healthPref, setHealthPref] = useState('Sensitive Groups');

  useEffect(() => {
    aqiService.getProfile()
      .then((res) => {
        if (res.data) {
          setName(res.data.name || '');
          setPreferredLoc(res.data.preferred_location || 'Delhi (Anand Vihar)');
          setNotifications(res.data.notification_enabled ?? true);
          setAqiThreshold(res.data.aqi_threshold || 250);
          setHealthPref(res.data.health_advisory_pref || 'Sensitive Groups');
        }
      })
      .catch((err) => console.warn('Using default profile state:', err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await aqiService.updateProfile({
        name,
        preferred_location: preferredLoc,
        notification_enabled: notifications,
        aqi_threshold: aqiThreshold,
        health_advisory_pref: healthPref
      });

      if (res.data) {
        setSaveSuccess(true);
        setSelectedLocation(preferredLoc);
        if (user) {
          loginUser({ ...user, ...res.data }, localStorage.getItem('aqi_auth_token'));
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setErrorMessage('Failed to save preferences. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton height="h-[500px]" />;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-sky-600" />
            User Preferences & Alert Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure default monitoring station, operational thresholds, and health hazard alerts.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Preferences updated successfully! Default station and alert thresholds have been applied.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            Full Name / Institutional Title
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            required
          />
        </div>

        {/* Preferred Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            Default NCR Monitoring Station
          </label>
          <select
            value={preferredLoc}
            onChange={(e) => setPreferredLoc(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-sky-500 outline-none"
          >
            {locations.length > 0 ? (
              locations.map((l) => (
                <option key={l.id} value={l.name}>{l.name} ({l.city})</option>
              ))
            ) : (
              <>
                <option value="Delhi (Anand Vihar)">Delhi (Anand Vihar)</option>
                <option value="Delhi (ITO)">Delhi (ITO)</option>
                <option value="Delhi (RK Puram)">Delhi (RK Puram)</option>
                <option value="Noida (Sector 62)">Noida (Sector 62)</option>
                <option value="Gurugram (Sector 51)">Gurugram (Sector 51)</option>
                <option value="Faridabad (Sector 16A)">Faridabad (Sector 16A)</option>
              </>
            )}
          </select>
        </div>

        {/* AQI Alert Threshold Slider */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-slate-400" />
              Custom AQI Hazard Notification Threshold
            </span>
            <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              AQI &ge; {aqiThreshold}
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="400"
            step="10"
            value={aqiThreshold}
            onChange={(e) => setAqiThreshold(Number(e.target.value))}
            className="w-full accent-rose-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>100 (Moderate trigger)</span>
            <span>200 (Poor)</span>
            <span>300 (Very Poor)</span>
            <span>400 (Severe)</span>
          </div>
        </div>

        {/* Health Advisory Group */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            Health Advisory Demographics Focus
          </label>
          <select
            value={healthPref}
            onChange={(e) => setHealthPref(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="Sensitive Groups">Sensitive Groups (Asthma, Respiratory, Elderly)</option>
            <option value="Children & Schools">Children & School Physical Activity</option>
            <option value="Outdoor Workers">Outdoor Workers & Traffic Police</option>
            <option value="General Public">General Public Standards</option>
          </select>
        </div>

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-sky-600" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Real-time Push Notifications</span>
              <span className="text-[11px] text-slate-500">Alert on rapid morning AQI escalation and inversion lids</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              notifications ? 'bg-sky-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                notifications ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Preferences...' : 'Save Configuration'}</span>
        </button>
      </form>
    </div>
  );
};
