import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAuth } from '../../context/AuthContext';
import { TelemetryCard } from '../../components/common/TelemetryCard';
import { Navigation, Thermometer, Droplets, Battery } from 'lucide-react';

export default function DriverDashboard() {
  const { driverData, containerData } = useTelemetry();
  const { user } = useAuth();

  return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--info-dark), var(--info))', color: 'white', padding: '24px', marginBottom: '24px', borderRadius: 'var(--radius-lg)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0' }}>Welcome, {user?.name}</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Trip FT-2026-001 • {user?.truckId}</p>
      </div>

      <div className="grid grid-2 gap-16 mb-24">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ background: 'var(--bg-hover)', padding: '12px', borderRadius: '12px' }}><Navigation size={24} color="var(--info)" /></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{driverData?.speed ?? '--'} <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>km/h</span></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current Speed</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ background: 'var(--bg-hover)', padding: '12px', borderRadius: '12px' }}><Battery size={24} color={driverData?.battery < 20 ? 'var(--danger)' : 'var(--success)'} /></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: driverData?.battery < 20 ? 'var(--danger)' : 'inherit' }}>{driverData?.battery ?? '--'}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Truck Node Battery</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Container Status</h2>
      <div className="grid grid-2 gap-16">
        <TelemetryCard 
          title="Temperature" 
          value={containerData?.temperature} 
          unit="°C" 
          icon={Thermometer} 
        />
        <TelemetryCard 
          title="Humidity" 
          value={containerData?.humidity} 
          unit="%" 
          icon={Droplets} 
        />
      </div>

      <div className="card" style={{ marginTop: '24px', padding: '20px' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Next Checkpoint</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>Ranchi Distribution Center</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>ETA: 2h 45m • 155 km remaining</div>
          </div>
          <button className="btn btn-primary">Navigate</button>
        </div>
      </div>
    </div>
  );
}
