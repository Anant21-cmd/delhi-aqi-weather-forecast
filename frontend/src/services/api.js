import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aqi_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, clear stale token
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('aqi_auth_token');
      localStorage.removeItem('aqi_user');
    }
    return Promise.reject(error);
  }
);

// Unified API Service
export const aqiService = {
  // Auth
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),

  // Locations
  getLocations: () => api.get('/locations'),
  getLocationsOverview: () => api.get('/locations/current-overview'),

  // AQI & Pollutants
  getCurrentAQI: (location) => api.get('/aqi/current', { params: { location } }),
  getAQIForecast: (location) => api.get('/aqi/forecast', { params: { location } }),
  calculateCustomAQI: (pollutants) => api.post('/aqi/calculate', pollutants),

  // Weather
  getCurrentWeather: (location) => api.get('/weather/current', { params: { location } }),
  getWeatherForecast: (location) => api.get('/weather/forecast', { params: { location } }),

  // Coupling & Radiative Feedback
  getCoupling: (location) => api.get('/coupling', { params: { location } }),
  simulateCoupling: (data) => api.post('/coupling/simulate', data),

  // Inversion Sounding
  getInversion: (location) => api.get('/inversion', { params: { location } }),

  // Dispersion Analysis
  getDispersion: (location) => api.get('/dispersion', { params: { location } }),

  // NASA FIRMS Fire Detection
  getFireHotspots: () => api.get('/fire-hotspots'),

  // Smoke Plume Prediction
  getPlumeEstimate: (params) => api.get('/plume', { params }),

  // Insights & Cause Analysis
  getInsights: (location) => api.get('/analysis', { params: { location } }),

  // AI Chatbot
  sendChatMessage: (data) => api.post('/chat', data),

  // Alerts
  getAlerts: (severity) => api.get('/alerts', { params: { severity } }),
  markAlertRead: (id) => api.patch(`/alerts/${id}/read`),
  markAllAlertsRead: () => api.post('/alerts/mark-all-read'),

  // Historical Comparison
  getHistory: (period) => api.get('/history', { params: { period } }),

  // Data Sources
  getDataSources: () => api.get('/data-sources'),

  // Profile & Settings
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

export default api;
