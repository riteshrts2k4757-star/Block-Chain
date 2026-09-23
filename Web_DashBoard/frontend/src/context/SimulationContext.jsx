import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useTelemetry } from './TelemetryContext';

const SimulationContext = createContext(null);

const DEFAULT_SIM = {
  speed: 60,
  containerTemp: null,     // null = auto
  containerHumidity: null,
  mq3: null,
  mq6: null,
  containerBattery: null,
  containerSolar: null,
  driverBattery: null,
  driverSolar: null,
  driverTemp: null,
  motionX: null,
  motionY: null,
  motionZ: null,
  gyroX: null,
  gyroY: null,
  gyroZ: null,
};

export function SimulationProvider({ children }) {
  const [controls, setControls] = useState(DEFAULT_SIM);
  const [demoMode, setDemoMode] = useState(false);
  const [tamperActive, setTamperActive] = useState(false);
  const [mpuSimulated, setMpuSimulated] = useState(true);
  const { setSimulationOverrides } = useTelemetry();
  const demoIntervalRef = useRef(null);

  // Push overrides to telemetry whenever controls change
  useEffect(() => {
    const overrides = {};
    Object.entries(controls).forEach(([key, val]) => {
      if (val !== null) overrides[key] = val;
    });
    setSimulationOverrides(overrides);
  }, [controls, setSimulationOverrides]);

  const updateControl = useCallback((key, value) => {
    setControls(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetControls = useCallback(() => {
    setControls(DEFAULT_SIM);
  }, []);

  const simulateTamper = useCallback(() => {
    setTamperActive(true);
  }, []);

  const resetTamper = useCallback(() => {
    setTamperActive(false);
  }, []);

  // Demo mode — cycle through scenarios
  const startDemo = useCallback(() => {
    setDemoMode(true);
    let step = 0;
    const scenarios = [
      { label: 'Normal', containerTemp: 5, containerHumidity: 72, mq3: 380, mq6: 350, speed: 60 },
      { label: 'Temperature Warning', containerTemp: 12, containerHumidity: 72, mq3: 380, mq6: 350, speed: 60 },
      { label: 'Humidity Warning', containerTemp: 5, containerHumidity: 92, mq3: 380, mq6: 350, speed: 60 },
      { label: 'Gas Warning', containerTemp: 5, containerHumidity: 72, mq3: 380, mq6: 730, speed: 60 },
      { label: 'Overspeed', containerTemp: 5, containerHumidity: 72, mq3: 380, mq6: 350, speed: 105 },
      { label: 'Alcohol Detection', containerTemp: 5, containerHumidity: 72, mq3: 65, mq6: 350, speed: 45 },
      { label: 'Normal Recovery', containerTemp: 5, containerHumidity: 72, mq3: 380, mq6: 350, speed: 60 },
    ];

    demoIntervalRef.current = setInterval(() => {
      const scenario = scenarios[step % scenarios.length];
      setControls(prev => ({ ...prev, ...scenario }));
      step++;
    }, 8000);
  }, []);

  const stopDemo = useCallback(() => {
    setDemoMode(false);
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    resetControls();
  }, [resetControls]);

  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, []);

  // Computed MPU6050 simulation values
  const mpuValues = {
    speed: controls.speed ?? 60,
    acceleration: parseFloat((Math.abs(Math.sin(Date.now() / 5000) * 0.2)).toFixed(2)),
    roll: parseFloat((Math.sin(Date.now() / 8000) * 2).toFixed(1)),
    pitch: parseFloat((Math.cos(Date.now() / 7000) * 1.5).toFixed(1)),
    yaw: parseFloat((Math.sin(Date.now() / 10000) * 0.8).toFixed(1)),
    vibration: parseFloat((0.1 + Math.abs(Math.sin(Date.now() / 3000) * 0.15)).toFixed(2)),
  };

  return (
    <SimulationContext.Provider value={{
      controls,
      updateControl,
      resetControls,
      demoMode,
      startDemo,
      stopDemo,
      tamperActive,
      simulateTamper,
      resetTamper,
      mpuSimulated,
      setMpuSimulated,
      mpuValues,
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}

export default SimulationContext;
