import React from 'react';
import './mobile.css';
import { mockTrip, mockSensors, mockSync, mockConnectivity, mockDriver } from '../../mock/data';

const MobileHome = () => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="m-page">
      {/* Greeting */}
      <h1 className="m-greeting">{greeting}, {mockDriver.name.split(' ')[0]}</h1>
      <p className="m-subtitle">Trip {mockTrip.id} · {mockTrip.origin} → {mockTrip.destination}</p>

      {/* Status Banner */}
      <div className="m-status-banner safe">
        <div className="m-status-dot" />
        <div>
          <div className="m-status-title">Container Status: SAFE</div>
          <div className="m-status-sub">Last synchronized {mockSync.lastSync}</div>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="m-section-label">LIVE SENSOR READINGS</div>
      <div className="m-sensor-grid">
        <SensorCard label="Temperature" value={`${mockSensors.temperature.value}${mockSensors.temperature.unit}`} status="Normal" />
        <SensorCard label="Humidity" value={`${mockSensors.humidity.value}${mockSensors.humidity.unit}`} status="Normal" />
        <SensorCard label="Ethylene" value={`${mockSensors.ethylene.value} ppm`} status="Normal" />
        <SensorCard label="Battery" value={`${mockSensors.battery.value}%`} status="Good" />
      </div>

      {/* Driver Status */}
      <div className="m-section-label">DRIVER STATUS</div>
      <div className="m-row">
        <div className="m-card m-flex-1">
          <div className="m-card-label">Driving</div>
          <div className="m-card-value">{mockTrip.drivingTime}</div>
        </div>
        <div className="m-card m-flex-1">
          <div className="m-card-label">Rest</div>
          <div className="m-card-value muted">{mockTrip.restTime}</div>
        </div>
      </div>

      <div className="m-row">
        <button className="m-btn-primary m-flex-1">Start Rest</button>
        <button className="m-btn-outline m-flex-1">Add Event</button>
      </div>

      {/* Connectivity */}
      <div className="m-section-label">CONNECTIVITY</div>
      <div className="m-card">
        {Object.entries(mockConnectivity).map(([key, val], i, arr) => (
          <div key={key} className={`m-conn-row ${i < arr.length - 1 ? 'bordered' : ''}`}>
            <span className="m-conn-label">{key}</span>
            <span className={`m-badge ${val.status === 'connected' ? 'success' : 'danger'}`}>
              ● {val.status === 'connected' ? 'Connected' : 'Offline'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SensorCard = ({ label, value, status }) => (
  <div className="m-sensor-card">
    <div className="m-sensor-label">{label}</div>
    <div className="m-sensor-value">{value}</div>
    <div className="m-sensor-status">● {status}</div>
  </div>
);

export default MobileHome;
