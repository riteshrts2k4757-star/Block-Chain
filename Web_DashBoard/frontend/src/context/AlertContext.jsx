import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useTelemetry } from './TelemetryContext';
import { useSettings } from './SettingsContext';
import { API_BASE_URL } from '../config';
const AlertContext = createContext(null);

let alertIdCounter = 1;

function createAlert(type, severity, title, description, device = null, truck = null, container = null) {
  return {
    id: `ALT-${String(alertIdCounter++).padStart(5, '0')}`,
    type,
    severity,
    title,
    description,
    device,
    truck: truck || 'FT-TRK-001',
    container: container || 'FT-CNT-001',
    timestamp: new Date().toISOString(),
    status: 'active',
    source: 'system',
    acknowledged: false,
  };
}

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { driverData, containerData, dataSource } = useTelemetry();
  const { settings, classifyMQ3, classifyMQ6, classifyTemp, classifyHumidity } = useSettings();
  const lastAlertTimesRef = useRef({});

  const addAlert = useCallback((alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 200));
    setUnreadCount(prev => prev + 1);
  }, []);

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true, status: 'acknowledged' } : a));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setUnreadCount(0);
  }, []);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Throttle alerts — don't fire the same type more than once per 30 seconds
  const shouldAlert = useCallback((type) => {
    const now = Date.now();
    const last = lastAlertTimesRef.current[type] || 0;
    if (now - last < 30000) return false;
    lastAlertTimesRef.current[type] = now;
    return true;
  }, []);

  // Sync with Backend Alerts
  useEffect(() => {
    const fetchDBAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/alerts`);
        const result = await res.json();
        if (result.success && result.data) {
          const dbAlerts = result.data.map(dbA => ({
            id: dbA._id,
            type: dbA.type.toLowerCase(),
            severity: dbA.severity.toUpperCase(),
            title: dbA.type.replace('_', ' '),
            description: dbA.message,
            device: dbA.deviceId,
            truck: 'FT-TRK-001',
            container: dbA.containerId,
            timestamp: dbA.timestamp,
            status: dbA.status,
            source: 'backend',
            acknowledged: dbA.status === 'resolved' || dbA.status === 'acknowledged'
          }));
          
          setAlerts(prev => {
            // Merge DB alerts with local unacknowledged simulation alerts
            const local = prev.filter(a => a.source === 'system');
            const merged = [...dbAlerts, ...local].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            return merged.slice(0, 200);
          });
        }
      } catch (err) {
        console.error('Failed to sync alerts', err);
      }
    };

    fetchDBAlerts();
    const interval = setInterval(fetchDBAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Alert engine — evaluate telemetry against thresholds
  useEffect(() => {
    if (!containerData) return;

    const mq6Class = classifyMQ6(containerData.mq6);
    if (mq6Class.level >= 2 && shouldAlert('gas_warning')) {
      addAlert(createAlert('gas_warning', mq6Class.level >= 3 ? 'CRITICAL' : 'WARNING',
        `Gas Level ${mq6Class.status}`,
        `Gas Sensor Index reading: ${containerData.mq6} — ${mq6Class.status}`,
        'Container ESP32', null, 'FT-CNT-001'));
    }
  }, [containerData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!driverData) return;

    const mq3Class = classifyMQ3(driverData.mq3);
    if (mq3Class.level >= 2 && shouldAlert('alcohol_warning')) {
      addAlert(createAlert('alcohol_vapour', mq3Class.level >= 3 ? 'CRITICAL' : 'WARNING',
        'Possible Alcohol Vapour Detected',
        `Alcohol Risk Index: ${driverData.mq3} — ${mq3Class.status}. Sensor reading requires calibration for actual BAC.`,
        'Driver ESP8266', 'FT-TRK-001'));
    }

    if (driverData.speed > settings.overspeedThreshold && shouldAlert('overspeed')) {
      addAlert(createAlert('overspeed', 'WARNING', 'Overspeed Alert',
        `Vehicle speed ${driverData.speed} km/h exceeds limit ${settings.overspeedThreshold} km/h`,
        'Driver ESP8266', 'FT-TRK-001'));
    }
  }, [driverData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manually trigger simulation alerts (for demo)
  const simulateAlert = useCallback((type) => {
    const alertMap = {
      'high_temp': () => createAlert('temperature_high', 'CRITICAL', 'Temperature High',
        'SIMULATED — Container temperature 12.5°C exceeds maximum 8°C', 'Container ESP32'),
      'low_temp': () => createAlert('temperature_low', 'WARNING', 'Temperature Low',
        'SIMULATED — Container temperature 0.5°C below minimum 2°C', 'Container ESP32'),
      'high_humidity': () => createAlert('humidity_high', 'WARNING', 'Humidity High',
        'SIMULATED — Container humidity 92% exceeds maximum 80%', 'Container ESP32'),
      'gas_warning': () => createAlert('gas_warning', 'CRITICAL', 'Critical Gas Level',
        'SIMULATED — Gas Sensor Index reading: 730 — CRITICAL', 'Container ESP32'),
      'alcohol': () => createAlert('alcohol_vapour', 'CRITICAL', 'Possible Alcohol Vapour Detected',
        'SIMULATED — Alcohol Risk Index: 65 — CRITICAL', 'Driver ESP8266'),
      'overspeed': () => createAlert('overspeed', 'WARNING', 'Overspeed Alert',
        'SIMULATED — Vehicle speed 105 km/h exceeds limit 80 km/h', 'Driver ESP8266'),
      'vibration': () => createAlert('excessive_vibration', 'WARNING', 'Excessive Vibration',
        'SIMULATED — Vibration 0.85g exceeds normal range', 'Driver ESP8266'),
      'low_battery': () => createAlert('battery_low', 'WARNING', 'Battery Low',
        'SIMULATED — Battery level 12% below warning threshold', 'Container ESP32'),
      'mqtt_disconnect': () => createAlert('mqtt_disconnected', 'CRITICAL', 'MQTT Disconnected',
        'SIMULATED — Lost connection to MQTT broker', 'System'),
      'tamper': () => createAlert('tamper_detected', 'CRITICAL', 'Hardware Tamper Detected',
        'SIMULATED — Physical tamper switch triggered on Container ESP32', 'Container ESP32'),
      'integrity': () => createAlert('integrity_violation', 'CRITICAL', 'Data Integrity Violation',
        'SIMULATED — Hash mismatch detected. Expected sequence 45, received 48.', 'System'),
    };

    const factory = alertMap[type];
    if (factory) {
      addAlert(factory());
    }
  }, [addAlert]);

  // Filter helpers
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged);
  const activeAlerts = alerts.filter(a => !a.acknowledged);

  // Driver-safe alerts (no MQ3/alcohol/MQ6 raw)
  const driverAlerts = alerts.filter(a =>
    !['alcohol_vapour', 'gas_warning'].includes(a.type) && !a.acknowledged
  );

  return (
    <AlertContext.Provider value={{
      alerts,
      activeAlerts,
      criticalAlerts,
      driverAlerts,
      unreadCount,
      addAlert,
      acknowledgeAlert,
      clearAlerts,
      markAllRead,
      simulateAlert,
    }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertProvider');
  return ctx;
}

export default AlertContext;
