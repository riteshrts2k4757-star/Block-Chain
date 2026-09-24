import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { TelemetryCard } from '../../components/common/TelemetryCard';
import { Thermometer, Droplets, Battery, AlertCircle, ShieldAlert, Navigation } from 'lucide-react';

export default function DriverTelemetry() {
  const { driverData, containerData, mqttStatus } = useTelemetry();

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 className="page-title">Live Telemetry</h1>
      <p className="page-subtitle mb-24">Real-time vehicle and load sensor data</p>

      {mqttStatus !== 'connected' && (
        <div style={{ padding: '16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <AlertCircle size={20} />
          Telemetry Connection Lost
        </div>
      )}

      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert size={20} color="var(--primary)" /> Load Environment
      </h2>
      <div className="grid grid-2 gap-16 mb-24">
        <TelemetryCard 
          title="Container Temperature" 
          value={containerData?.temperature} 
          unit="°C" 
          icon={Thermometer} 
        />
        <TelemetryCard 
          title="Container Humidity" 
          value={containerData?.humidity} 
          unit="%" 
          icon={Droplets} 
        />
        <TelemetryCard 
          title="Container Gas" 
          value={containerData?.gas} 
          unit=" ppm" 
          icon={ShieldAlert} 
        />
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Navigation size={20} color="var(--info)" /> Vehicle Diagnostics
      </h2>
      <div className="grid grid-2 gap-16">
        <TelemetryCard 
          title="Vehicle Battery" 
          value={driverData?.battery} 
          unit="%" 
          icon={Battery} 
        />
        <TelemetryCard 
          title="Current Speed" 
          value={driverData?.speed} 
          unit=" km/h" 
          icon={Navigation} 
        />
      </div>
    </div>
  );
}
