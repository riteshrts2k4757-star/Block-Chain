import React, { createContext, useContext, useState, useCallback } from 'react';

const DEFAULT_SETTINGS = {
  // Temperature thresholds (°C)
  tempMin: 2,
  tempMax: 8,
  // Humidity thresholds (%)
  humidityMin: 60,
  humidityMax: 80,
  // MQ3 thresholds (Alcohol Risk Index)
  mq3Normal: 300,      // >= 300 is normal
  mq3Suspicious: 200,  // 200-299
  mq3HighRisk: 80,     // 80-199
  mq3Critical: 80,     // < 80
  // MQ6 thresholds (Gas Sensor Index)
  mq6Normal: 400,      // <= 400 is normal
  mq6Elevated: 500,    // 401-500
  mq6Warning: 650,     // 501-650
  mq6Critical: 650,    // > 650
  // Speed threshold (km/h)
  overspeedThreshold: 80,
  // Battery warning (%)
  batteryWarning: 20,
  // Solar warning (V)
  solarWarning: 3.0,
  // MQTT timeout (seconds) — auto-switch to simulation
  mqttTimeout: 30,
  // Simulation timeout (seconds)
  simulationTimeout: 30,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('ft_settings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  const updateSettings = useCallback((updates) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('ft_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.removeItem('ft_settings');
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Classification helpers
  const classifyMQ3 = useCallback((value) => {
    if (value == null) return { status: 'UNKNOWN', color: '#94A3B8', level: 0 };
    if (value >= settings.mq3Normal) return { status: 'NORMAL', color: '#16A34A', level: 0 };
    if (value >= settings.mq3Suspicious) return { status: 'SUSPICIOUS', color: '#F59E0B', level: 1 };
    if (value >= settings.mq3HighRisk) return { status: 'HIGH RISK', color: '#EA580C', level: 2 };
    return { status: 'CRITICAL', color: '#DC2626', level: 3 };
  }, [settings]);

  const classifyMQ6 = useCallback((value) => {
    if (value == null) return { status: 'UNKNOWN', color: '#94A3B8', level: 0 };
    if (value <= settings.mq6Normal) return { status: 'NORMAL', color: '#16A34A', level: 0 };
    if (value <= settings.mq6Elevated) return { status: 'ELEVATED', color: '#F59E0B', level: 1 };
    if (value <= settings.mq6Warning) return { status: 'WARNING', color: '#EA580C', level: 2 };
    return { status: 'CRITICAL', color: '#DC2626', level: 3 };
  }, [settings]);

  const classifyTemp = useCallback((value) => {
    if (value == null) return { status: 'UNKNOWN', color: '#94A3B8' };
    if (value < settings.tempMin) return { status: 'LOW', color: '#2563EB' };
    if (value > settings.tempMax) return { status: 'HIGH', color: '#DC2626' };
    return { status: 'NORMAL', color: '#16A34A' };
  }, [settings]);

  const classifyHumidity = useCallback((value) => {
    if (value == null) return { status: 'UNKNOWN', color: '#94A3B8' };
    if (value < settings.humidityMin) return { status: 'LOW', color: '#F59E0B' };
    if (value > settings.humidityMax) return { status: 'HIGH', color: '#DC2626' };
    return { status: 'NORMAL', color: '#16A34A' };
  }, [settings]);

  return (
    <SettingsContext.Provider value={{
      settings, updateSettings, resetSettings,
      classifyMQ3, classifyMQ6, classifyTemp, classifyHumidity
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export default SettingsContext;
