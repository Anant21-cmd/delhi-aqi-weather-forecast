import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Clock,
  CloudSun,
  Flame,
  Wind,
  Layers,
  Sparkles,
  MessageSquare,
  Bell,
  History,
  Database,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  ShieldAlert,
  Compass,
  ArrowRightLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoBanner } from '../components/common/DemoBanner';

export const MainLayout = () => {
  const {
    user,
    logoutUser,
    selectedLocation,
    setSelectedLocation,
    locations,
    unreadAlertsCount
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'AQI Map', path: '/map', icon: MapPin },
    { name: '72H Forecast', path: '/forecast', icon: Clock },
    { name: 'Weather', path: '/weather', icon: CloudSun },
    { name: 'Coupling Analysis', path: '/coupling', icon: ArrowRightLeft, highlight: true },
    { name: 'Inversion Monitor', path: '/inversion', icon: Layers },
    { name: 'Fire Detection', path: '/fire-detection', icon: Flame },
    { name: 'Plume Prediction', path: '/plume', icon: Compass },
    { name: 'Dispersion Analysis', path: '/dispersion', icon: Wind },
    { name: 'Analysis & Insights', path: '/insights', icon: Sparkles },
    { name: 'AI Chatbot', path: '/chat', icon: MessageSquare },
    { name: 'Alerts', path: '/alerts', icon: Bell, badge: unreadAlertsCount },
    { name: 'Historical Comparison', path: '/history', icon: History },
    { name: 'Data Sources', path: '/data-sources', icon: Database },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <DemoBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out border-r border-slate-800 lg:static ${
            mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
          } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                AQ
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="truncate">
                  <h1 className="text-sm font-bold text-white tracking-tight leading-none">NCMRWF Coupled</h1>
                  <span className="text-[10px] text-sky-400 font-medium tracking-wider uppercase">MoES Air Quality</span>
                </div>
              )}
            </div>

            {/* Collapse toggle (Desktop) */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm font-semibold'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                    } ${item.highlight && !isActive ? 'border-l-2 border-teal-400 pl-2.5' : ''}`
                  }
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {(!collapsed || mobileOpen) && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {item.badge > 0 && (!collapsed || mobileOpen) && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shrink-0">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile / Logout footer */}
          <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-950/40">
            {user ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  {(!collapsed || mobileOpen) && (
                    <div className="truncate">
                      <p className="text-xs font-medium text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                  )}
                </div>
                {(!collapsed || mobileOpen) && (
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {(!collapsed || mobileOpen) ? (
                  <div className="flex items-center gap-2">
                    <NavLink
                      to="/login"
                      className="flex-1 text-center px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/signup"
                      className="flex-1 text-center px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Sign Up
                    </NavLink>
                  </div>
                ) : (
                  <NavLink
                    to="/login"
                    className="p-2 flex justify-center text-slate-400 hover:text-white"
                    title="Login"
                  >
                    <User className="w-5 h-5" />
                  </NavLink>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-30 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Location Selector */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Monitoring Station</span>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent border-0 p-0 pr-6 focus:ring-0 cursor-pointer"
                  >
                    {locations.length > 0 ? (
                      locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name} ({loc.city})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Delhi (Anand Vihar)">Delhi (Anand Vihar)</option>
                        <option value="Delhi (ITO)">Delhi (ITO)</option>
                        <option value="Delhi (RK Puram)">Delhi (RK Puram)</option>
                        <option value="Delhi (Punjabi Bagh)">Delhi (Punjabi Bagh)</option>
                        <option value="Noida (Sector 62)">Noida (Sector 62)</option>
                        <option value="Gurugram (Sector 51)">Gurugram (Sector 51)</option>
                        <option value="Faridabad (Sector 16A)">Faridabad (Sector 16A)</option>
                        <option value="Ghaziabad (Vasundhara)">Ghaziabad (Vasundhara)</option>
                        <option value="Panipat (GT Road)">Panipat (GT Road)</option>
                        <option value="Ambala (Model Town)">Ambala (Model Town)</option>
                        <option value="Hisar (CCS HAU)">Hisar (CCS HAU)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions & Header Info */}
            <div className="flex items-center gap-3">
              <NavLink
                to="/chat"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-medium hover:bg-sky-100 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI Expert</span>
              </NavLink>

              <NavLink
                to="/alerts"
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                title="View Alerts"
              >
                <Bell className="w-5 h-5" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
              </NavLink>

              <div className="hidden md:flex flex-col text-right border-l border-slate-200 pl-3">
                <span className="text-[11px] font-semibold text-slate-700">MoES / NCMRWF</span>
                <span className="text-[10px] text-slate-500">Coupled Forecast v1.0</span>
              </div>
            </div>
          </header>

          {/* Page Content Outlet */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
