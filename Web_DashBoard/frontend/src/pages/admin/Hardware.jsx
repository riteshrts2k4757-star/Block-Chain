import React from 'react';
import { Cpu, Wind, Thermometer, Battery, Activity } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export default function Hardware() {
  const { dataSource } = useTelemetry();
  const isSimulated = dataSource === 'SIMULATION';

  return (
    <div>
      <h1 className="page-title">Hardware Architecture</h1>
      <p className="page-subtitle mb-24">Physical device topology and sensor connections</p>

      <div className="grid grid-2 gap-24">
        {/* Driver Unit */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={24} color="var(--info)" /> Driver Unit
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', background: isSimulated ? 'var(--warning-bg)' : 'var(--success-bg)', color: isSimulated ? 'var(--warning)' : 'var(--success)' }}>
              {isSimulated ? 'SIMULATED' : 'ONLINE'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>ESP8266 Microcontroller</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Handles driver cabin sensors and connects directly to the FarmTrace MQTT Broker via WiFi.</div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.875rem', marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connected Sensors</h3>
              <div className="grid grid-2 gap-12">
                <SensorTag icon={Wind} label="MQ3 Alcohol Sensor" />
                <SensorTag icon={Activity} label="MPU6050 Motion" />
                <SensorTag icon={Thermometer} label="Cabin Temperature" />
                <SensorTag icon={Battery} label="Power Module" />
              </div>
            </div>
          </div>
        </div>

        {/* Container Unit */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={24} color="var(--primary)" /> Container Unit
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', background: isSimulated ? 'var(--warning-bg)' : 'var(--success-bg)', color: isSimulated ? 'var(--warning)' : 'var(--success)' }}>
              {isSimulated ? 'SIMULATED' : 'ONLINE'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>ESP32 Microcontroller</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Monitors cold chain environment and securely transmits sequenced data to the MQTT Broker.</div>
            </div>

            <div>
              <h3 style={{ fontSize: '0.875rem', marginBottom: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connected Sensors</h3>
              <div className="grid grid-2 gap-12">
                <SensorTag icon={Thermometer} label="DHT Temp & Hum" />
                <SensorTag icon={Wind} label="MQ6 Gas Sensor" />
                <SensorTag icon={Battery} label="Solar & Battery" />
                <SensorTag icon={Activity} label="Tamper Switch" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SensorTag = ({ icon: Icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
    <Icon size={16} color="var(--text-tertiary)" />
    <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{label}</span>
  </div>
);
