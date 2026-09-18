import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AQIMapPage } from './pages/AQIMapPage';
import { ForecastPage } from './pages/ForecastPage';
import { WeatherPage } from './pages/WeatherPage';
import { CouplingPage } from './pages/CouplingPage';
import { InversionPage } from './pages/InversionPage';
import { FireDetectionPage } from './pages/FireDetectionPage';
import { PlumePredictionPage } from './pages/PlumePredictionPage';
import { DispersionPage } from './pages/DispersionPage';
import { InsightsPage } from './pages/InsightsPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoryPage } from './pages/HistoryPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

export function App() {
  return (
    <Routes>
      {/* Auth Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Main Application Layout Protected / Dashboard Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="map" element={<AQIMapPage />} />
        <Route path="forecast" element={<ForecastPage />} />
        <Route path="weather" element={<WeatherPage />} />
        <Route path="coupling" element={<CouplingPage />} />
        <Route path="inversion" element={<InversionPage />} />
        <Route path="fire-detection" element={<FireDetectionPage />} />
        <Route path="plume" element={<PlumePredictionPage />} />
        <Route path="dispersion" element={<DispersionPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="chat" element={<ChatbotPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="data-sources" element={<DataSourcesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
