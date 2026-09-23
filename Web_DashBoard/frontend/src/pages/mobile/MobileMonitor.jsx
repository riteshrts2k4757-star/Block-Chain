import React from 'react';
import './mobile.css';
import { mockSensors } from '../../mock/data';

const sensors = [
  { label: 'Temperature', value: `${mockSensors.temperature.value}${mockSensors.temperature.unit}`, min: `${mockSensors.temperature.min}°`, max: `${mockSensors.temperature.max}°`, status: 'Normal' },
  { label: 'Humidity', value: `${mockSensors.humidity.value}${mockSensors.humidity.unit}`, min: `${mockSensors.humidity.min}%`, max: `${mockSensors.humidity.max}%`, status: 'Normal' },
  { label: 'Ethylene', value: `${mockSensors.ethylene.value} ppm`, min: null, max: null, status: 'Normal' },
  { label: 'Battery', value: `${mockSensors.battery.value}%`, min: null, max: null, status: 'Good' },
  { label: 'Vibration', value: `${mockSensors.vibration.value} g`, min: null, max: null, status: 'Normal' },
];

const MobileMonitor = () => (
  <div className="m-page">
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
      <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--success)' }} />
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Live · Updated 4s ago</span>
    </div>

    {sensors.map((s, i) => (
      <div className="m-card" key={i} style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="m-sensor-label">{s.label}</div>
            <div className="m-sensor-value">{s.value}</div>
          </div>
          <span className="m-badge success">● {s.status}</span>
        </div>
        {(s.min || s.max) && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-light)', fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
            <span>Min: {s.min}</span>
            <span>Max: {s.max}</span>
          </div>
        )}
      </div>
    ))}
  </div>
);

export default MobileMonitor;
