import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { useAlerts } from '../../context/AlertContext';
import { PlayCircle, StopCircle, Sliders, AlertTriangle } from 'lucide-react';

export default function Simulation() {
  const { controls, updateControl, resetControls, demoMode, startDemo, stopDemo } = useSimulation();
  const { simulateAlert } = useAlerts();

  const handleSlider = (key, e) => {
    updateControl(key, parseFloat(e.target.value));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Simulation Controls</h1>
          <p className="page-subtitle">Inject mock data and trigger test alerts for demo purposes</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {demoMode ? (
            <button className="btn btn-danger" onClick={stopDemo}>
              <StopCircle size={18} /> Stop Auto-Demo
            </button>
          ) : (
            <button className="btn" style={{ background: 'var(--success)', color: 'white' }} onClick={startDemo}>
              <PlayCircle size={18} /> Start Auto-Demo Scenario
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-2 gap-24 mb-24">
        {/* Manual Overrides */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="var(--primary)" /> Manual Data Overrides
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <SliderControl label="Temperature (°C)" value={controls.containerTemp ?? 5} min={-10} max={40} step={0.5} onChange={(e) => handleSlider('containerTemp', e)} />
            <SliderControl label="Humidity (%)" value={controls.containerHumidity ?? 72} min={0} max={100} step={1} onChange={(e) => handleSlider('containerHumidity', e)} />
            <SliderControl label="Alcohol Risk Index (MQ3)" value={controls.mq3 ?? 350} min={0} max={1023} step={10} onChange={(e) => handleSlider('mq3', e)} />
            <SliderControl label="Gas Index (MQ6)" value={controls.mq6 ?? 350} min={0} max={1023} step={10} onChange={(e) => handleSlider('mq6', e)} />
            <SliderControl label="Speed (km/h)" value={controls.speed ?? 60} min={0} max={140} step={5} onChange={(e) => handleSlider('speed', e)} />
            
            <button className="btn btn-outline" onClick={resetControls} style={{ marginTop: '12px' }}>
              Reset to Auto-Simulation
            </button>
          </div>
        </div>

        {/* Instant Alerts */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="var(--warning)" /> Trigger Demo Alerts
          </h2>

          <div className="grid grid-2 gap-12">
            <button className="btn btn-outline" onClick={() => simulateAlert('high_temp')}>High Temperature</button>
            <button className="btn btn-outline" onClick={() => simulateAlert('low_temp')}>Low Temperature</button>
            <button className="btn btn-outline" onClick={() => simulateAlert('high_humidity')}>High Humidity</button>
            <button className="btn btn-outline" onClick={() => simulateAlert('gas_warning')}>Gas Leak / Spoilage</button>
            <button className="btn btn-outline" onClick={() => simulateAlert('alcohol')}>Alcohol Vapour (Driver)</button>
            <button className="btn btn-outline" onClick={() => simulateAlert('overspeed')}>Overspeed</button>
            <button className="btn btn-outline" onClick={() => simulateAlert('vibration')}>Harsh Vibration</button>
            <button className="btn btn-outline" onClick={() => simulateAlert('low_battery')}>Low Battery</button>
            <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => simulateAlert('tamper')}>Tamper Detected</button>
            <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => simulateAlert('integrity')}>Integrity Violation</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const SliderControl = ({ label, value, min, max, step, onChange }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
      <span>{label}</span>
      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      onChange={onChange}
      style={{ width: '100%', cursor: 'pointer' }}
    />
  </div>
);
