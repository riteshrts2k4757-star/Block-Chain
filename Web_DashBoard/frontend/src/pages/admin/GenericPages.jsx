import React from 'react';

const GenericPage = ({ title, subtitle }) => (
  <div>
    <h1 className="page-title">{title}</h1>
    <p className="page-subtitle mb-24">{subtitle}</p>
    <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      Content for {title} will be implemented here.
    </div>
  </div>
);

export const TelemetryTable = () => <GenericPage title="Telemetry Data" subtitle="Tabular view of all historical sensor readings" />;
export const Logbook = () => <GenericPage title="Driver Logbook" subtitle="Hours of service and checkpoint records" />;
export const Devices = () => <GenericPage title="IoT Devices" subtitle="Manage registered ESP32 and ESP8266 nodes" />;
export const Profile = () => <GenericPage title="User Profile" subtitle="Account settings and preferences" />;
