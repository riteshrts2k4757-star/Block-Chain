import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { Activity, Server, Cpu, Database } from 'lucide-react';

export default function IoTDevices() {
  const { driverData, containerData, mqttStatus, dataSource, packetsReceived } = useTelemetry();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>IoT Devices</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Live Raw JSON Data from Connected Hardware Nodes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>MQTT Status</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: mqttStatus === 'connected' ? 'var(--success)' : 'var(--danger)' }}>
              {mqttStatus.charAt(0).toUpperCase() + mqttStatus.slice(1)}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Data Source</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {dataSource === 'LIVE_HARDWARE' ? 'Live Hardware' : 'Simulation'}
            </div>
          </div>
        </div>
        
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Packets Received</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {packetsReceived.driver + packetsReceived.container}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Container Node Data */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <Cpu size={24} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Container Node (ESP32)</h3>
          </div>
          
          <div style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: '20px', 
            borderRadius: 'var(--radius-md)', 
            overflowX: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            maxHeight: '450px',
            overflowY: 'auto',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
          }}>
            {dataSource === 'LIVE_HARDWARE' && containerData ? (
              <pre style={{ margin: 0 }}>
                {JSON.stringify(containerData, null, 2)}
              </pre>
            ) : (
              <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                Hardware disconnected. Waiting for live telemetry...
              </div>
            )}
          </div>
        </div>

        {/* Driver Gateway Data */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <Cpu size={24} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Driver Gateway (ESP32)</h3>
          </div>
          
          <div style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: '20px', 
            borderRadius: 'var(--radius-md)', 
            overflowX: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            maxHeight: '450px',
            overflowY: 'auto',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
          }}>
            {dataSource === 'LIVE_HARDWARE' && driverData ? (
              <pre style={{ margin: 0 }}>
                {JSON.stringify(driverData, null, 2)}
              </pre>
            ) : (
              <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                Hardware disconnected. Waiting for live telemetry...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
