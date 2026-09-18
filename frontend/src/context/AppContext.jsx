import React, { createContext, useContext, useState, useEffect } from 'react';
import { aqiService } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aqi_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('aqi_auth_token'));
  const [selectedLocation, setSelectedLocation] = useState('Delhi (Anand Vihar)');
  const [locations, setLocations] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(3);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Fetch locations list on load
  useEffect(() => {
    aqiService.getLocations()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setLocations(res.data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch locations, using defaults:', err.message);
      });
  }, []);

  const loginUser = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('aqi_user', JSON.stringify(userData));
    localStorage.setItem('aqi_auth_token', authToken);
    if (userData.preferred_location) {
      setSelectedLocation(userData.preferred_location);
    }
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aqi_user');
    localStorage.removeItem('aqi_auth_token');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loginUser,
        logoutUser,
        selectedLocation,
        setSelectedLocation,
        locations,
        unreadAlertsCount,
        setUnreadAlertsCount,
        isDemoMode,
        setIsDemoMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
