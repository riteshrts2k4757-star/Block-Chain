import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';
const HISTORY_SIZE = 60;

const TelemetryContext = createContext(null);

// Smooth simulation value generator
function smoothValue(current, target, step = 0.1) {
  if (current === target) return target;
  const diff = target - current;
  return current + diff * step;
}

function generateSimulatedDriver(prev, overrides = {}) {
  const t = Date.now() / 1000;
  const base = prev || {};
  return {
    device: 'driver',
    mq3: overrides.mq3 ?? Math.round(smoothValue(base.mq3 || 380, 350 + Math.sin(t / 30) * 50, 0.05)),
    motion: {
      x: overrides.motionX ?? parseFloat((Math.sin(t / 10) * 0.15).toFixed(3)),
      y: overrides.motionY ?? parseFloat((Math.cos(t / 12) * 0.08).toFixed(3)),
      z: overrides.motionZ ?? parseFloat((9.81 + Math.sin(t / 8) * 0.05).toFixed(3)),
    },
    gyro: {
      x: overrides.gyroX ?? parseFloat((Math.sin(t / 15) * 0.03).toFixed(3)),
      y: overrides.gyroY ?? parseFloat((Math.cos(t / 18) * 0.02).toFixed(3)),
      z: overrides.gyroZ ?? parseFloat((Math.sin(t / 20) * -0.01).toFixed(3)),
    },
    temperature: overrides.driverTemp ?? parseFloat(smoothValue(base.temperature || 28, 28 + Math.sin(t / 60) * 2, 0.02).toFixed(1)),
    speed: overrides.speed ?? parseFloat(smoothValue(base.speed || 60, 55 + Math.sin(t / 25) * 15, 0.03).toFixed(1)),
    battery: overrides.driverBattery ?? Math.round(smoothValue(base.battery || 92, 90 + Math.sin(t / 200) * 5, 0.01)),
    solar: overrides.driverSolar ?? parseFloat(smoothValue(base.solar || 4.0, 3.9 + Math.sin(t / 150) * 0.2, 0.01).toFixed(1)),
    timestamp: Date.now(),
    simulated: true,
  };
}

function generateSimulatedContainer(prev, overrides = {}) {
  const t = Date.now() / 1000;
  const base = prev || {};
  const seq = (base.sequence || 0) + 1;
  return {
    device: 'container',
    sequence: seq,
    temperature: overrides.containerTemp ?? parseFloat(smoothValue(base.temperature || 5.5, 5 + Math.sin(t / 45) * 1.5, 0.02).toFixed(1)),
    humidity: overrides.containerHumidity ?? parseFloat(smoothValue(base.humidity || 72, 70 + Math.sin(t / 50) * 8, 0.02).toFixed(1)),
    mq6: overrides.mq6 ?? Math.round(smoothValue(base.mq6 || 350, 340 + Math.sin(t / 35) * 30, 0.03)),
    battery: overrides.containerBattery ?? Math.round(smoothValue(base.battery || 87, 85 + Math.sin(t / 180) * 5, 0.01)),
    solar: overrides.containerSolar ?? parseFloat(smoothValue(base.solar || 3.9, 3.8 + Math.sin(t / 120) * 0.3, 0.01).toFixed(1)),
    timestamp: Date.now(),
    simulated: true,
  };
}

export function TelemetryProvider({ children }) {
  const [driverData, setDriverData] = useState(null);
  const [containerData, setContainerData] = useState(null);
  const [driverHistory, setDriverHistory] = useState([]);
  const [containerHistory, setContainerHistory] = useState([]);
  const [dataSource, setDataSource] = useState('SIMULATION'); // 'LIVE_HARDWARE' or 'SIMULATION'
  const [mqttStatus, setMqttStatus] = useState('disconnected');
  const [packetsReceived, setPacketsReceived] = useState({ driver: 0, container: 0 });
  const [lastDriverPacketAt, setLastDriverPacketAt] = useState(null);
  const [lastContainerPacketAt, setLastContainerPacketAt] = useState(null);
  const [mqttLog, setMqttLog] = useState([]); // Activity stream

  const socketRef = useRef(null);
  const simIntervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const driverRef = useRef(null);
  const containerRef = useRef(null);
  const simOverridesRef = useRef({});

  // Keep refs in sync
  useEffect(() => { driverRef.current = driverData; }, [driverData]);
  useEffect(() => { containerRef.current = containerData; }, [containerData]);

  const addToHistory = useCallback((setter, data) => {
    const entry = {
      time: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: data.timestamp || Date.now(),
      ...data,
    };
    setter(prev => {
      const next = [...prev, entry];
      if (next.length > HISTORY_SIZE) next.shift();
      return next;
    });
  }, []);

  const addLogEntry = useCallback((type, message) => {
    setMqttLog(prev => {
      const next = [...prev, {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type,
        message,
        id: Date.now() + Math.random(),
      }];
      if (next.length > 100) next.shift();
      return next;
    });
  }, []);

  // Start simulation
  const startSimulation = useCallback(() => {
    if (simIntervalRef.current) return;
    setDataSource('SIMULATION');
    addLogEntry('system', 'Simulation mode activated');

    simIntervalRef.current = setInterval(() => {
      const overrides = simOverridesRef.current;
      const newDriver = generateSimulatedDriver(driverRef.current, overrides);
      const newContainer = generateSimulatedContainer(containerRef.current, overrides);

      setDriverData(newDriver);
      setContainerData(newContainer);
      addToHistory(setDriverHistory, newDriver);
      addToHistory(setContainerHistory, newContainer);
    }, 2000);
  }, [addToHistory, addLogEntry]);

  const stopSimulation = useCallback(() => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
  }, []);

  // Update simulation overrides (from SimulationContext)
  const setSimulationOverrides = useCallback((overrides) => {
    simOverridesRef.current = overrides;
  }, []);

  // Reset hardware timeout — if no MQTT data for N seconds, switch to simulation
  const resetHardwareTimeout = useCallback((timeoutMs = 30000) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (dataSource === 'LIVE_HARDWARE') {
        addLogEntry('warning', 'Hardware data timeout — switching to simulation');
        startSimulation();
      }
    }, timeoutMs);
  }, [dataSource, startSimulation, addLogEntry]);

  // Socket.IO connection
  useEffect(() => {
    const socket = io(SOCKET_URL, { reconnectionAttempts: 10, reconnectionDelay: 2000 });
    socketRef.current = socket;

    socket.on('connect', () => {
      setMqttStatus('connected');
      addLogEntry('success', `Socket connected (${socket.id})`);
    });

    socket.on('disconnect', () => {
      setMqttStatus('disconnected');
      addLogEntry('error', 'Socket disconnected');
    });

    socket.on('connect_error', () => {
      setMqttStatus('error');
      // Start simulation if not already running
      if (!simIntervalRef.current) {
        startSimulation();
      }
    });

    socket.on('farmtrace:driver:data', (data) => {
      // Live hardware data received
      stopSimulation();
      setDataSource('LIVE_HARDWARE');
      setDriverData(data);
      addToHistory(setDriverHistory, data);
      setPacketsReceived(prev => ({ ...prev, driver: prev.driver + 1 }));
      setLastDriverPacketAt(new Date().toISOString());
      addLogEntry('driver', `Driver packet — MQ3: ${data.mq3 ?? '-'}`);
      resetHardwareTimeout();
    });

    socket.on('farmtrace:container:data', (data) => {
      stopSimulation();
      setDataSource('LIVE_HARDWARE');
      setContainerData(data);
      addToHistory(setContainerHistory, data);
      setPacketsReceived(prev => ({ ...prev, container: prev.container + 1 }));
      setLastContainerPacketAt(new Date().toISOString());
      addLogEntry('container', `Container packet — Seq: ${data.sequence ?? '-'}, Temp: ${data.temperature ?? '-'}°C`);
      resetHardwareTimeout();
    });

    socket.on('farmtrace:status', (status) => {
      addLogEntry('system', `Status: ${JSON.stringify(status)}`);
    });

    // Start simulation immediately (will be stopped when hardware data arrives)
    startSimulation();

    return () => {
      socket.disconnect();
      stopSimulation();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TelemetryContext.Provider value={{
      driverData,
      containerData,
      driverHistory,
      containerHistory,
      dataSource,
      mqttStatus,
      packetsReceived,
      lastDriverPacketAt,
      lastContainerPacketAt,
      mqttLog,
      setSimulationOverrides,
      startSimulation,
      stopSimulation,
      socket: socketRef.current,
    }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error('useTelemetry must be used within TelemetryProvider');
  return ctx;
}

export default TelemetryContext;
