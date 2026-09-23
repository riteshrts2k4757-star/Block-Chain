import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { useAlerts } from '../../context/AlertContext';
import { ShieldAlert, Unlock, Camera, Video } from 'lucide-react';

export default function TamperDetection() {
  const { tamperActive, simulateTamper, resetTamper } = useSimulation();
  const { simulateAlert } = useAlerts();

  const handleTriggerTamper = () => {
    simulateTamper();
    simulateAlert('tamper');
  };

  return (
    <div>
      <h1 className="page-title">Tamper Detection</h1>
      <p className="page-subtitle mb-24">Physical security monitoring for containers</p>

      <div className="grid grid-2 gap-24 mb-24">
        <div className="card" style={{ border: tamperActive ? '1px solid var(--danger-border)' : '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.125rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color={tamperActive ? 'var(--danger)' : 'var(--text-secondary)'} /> Physical Tamper Status
            </h2>
            <div style={{ background: tamperActive ? 'var(--danger-bg)' : 'var(--success-bg)', color: tamperActive ? 'var(--danger)' : 'var(--success)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 600 }}>
              {tamperActive ? 'BREACH DETECTED' : 'SECURE'}
            </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Container Door Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 700, color: tamperActive ? 'var(--danger)' : 'var(--text-primary)' }}>
              <Unlock size={24} /> {tamperActive ? 'UNAUTHORIZED OPENING' : 'LOCKED'}
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', borderLeft: tamperActive ? '4px solid var(--danger)' : '4px solid var(--success)' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>Sensor: Container ESP32 limit switch</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Triggers critical alert immediately upon state change. Logs timestamp and hashes the breach event.</div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color="var(--primary)" /> Camera Feed / Evidence
          </h2>
          <div style={{ background: '#000', borderRadius: 'var(--radius-md)', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', border: '1px solid var(--border)' }}>
            <Video size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <span>Camera Feed Offline</span>
            <span style={{ fontSize: '0.75rem', marginTop: '8px' }}>Awaiting hardware module</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Simulation Controls (For Demo)</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-danger" onClick={handleTriggerTamper} disabled={tamperActive}>
            Trigger Tamper Switch
          </button>
          <button className="btn btn-outline" onClick={resetTamper} disabled={!tamperActive}>
            Reset Sensor
          </button>
        </div>
      </div>
    </div>
  );
}
