import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  CheckCheck,
  Filter,
  ShieldAlert,
  Clock,
  MapPin
} from 'lucide-react';
import { aqiService } from '../services/api';
import { useApp } from '../context/AppContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';

export const AlertsPage = () => {
  const { setUnreadAlertsCount } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('All');

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aqiService.getAlerts();
      setAlerts(res.data);
      const unread = res.data.filter((a) => !a.is_read).length;
      setUnreadAlertsCount(unread);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Unable to retrieve alerts from notification service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await aqiService.markAlertRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
      setUnreadAlertsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking alert read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await aqiService.markAllAlertsRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      setUnreadAlertsCount(0);
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  if (loading) {
    return <LoadingSkeleton height="h-[600px]" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchAlerts} />;
  }

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'All' && a.severity.toLowerCase() !== filterSeverity.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Operational Hazard Center
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-sky-600" />
            Alerts, Warnings & Health Advisories
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time threshold breaches, thermal inversion locks, and plume incursion notifications.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All As Read</span>
        </button>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Critical', 'Warning', 'Info'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterSeverity === sev
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sev} Alerts
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-sm">
            No alerts match the selected severity filter.
          </div>
        ) : (
          filteredAlerts.map((item) => {
            const isCritical = item.severity.toLowerCase() === 'critical';
            const isWarning = item.severity.toLowerCase() === 'warning';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-6 border shadow-sm transition-all ${
                  item.is_read ? 'border-slate-200 opacity-80' : 'border-slate-300 ring-1 ring-sky-500/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-xl shrink-0 ${
                        isCritical
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : isWarning
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-sky-50 text-sky-600 border border-sky-200'
                      }`}
                    >
                      {isCritical ? (
                        <AlertOctagon className="w-5 h-5" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {item.location_name}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>

                      {/* Recommendations */}
                      {item.health_recommendations && item.health_recommendations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                            Official Health Guidance
                          </span>
                          <ul className="space-y-1">
                            {item.health_recommendations.map((rec, rIdx) => (
                              <li key={rIdx} className="text-xs text-slate-700 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-800 self-end sm:self-start shrink-0 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
