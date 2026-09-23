import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { Thermometer, Droplets, Battery, Navigation, Activity } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export function TruckCard({ truck, telemetry, onClick }) {
  const { driver, route, status, plate } = truck;
  const { classifyTemp, classifyHumidity } = useSettings();
  
  const tempClass = classifyTemp(telemetry?.temperature);
  const humClass = classifyHumidity(telemetry?.humidity);

  return (
    <div className="card hover-effect" onClick={onClick} style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{truck.truckId}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{plate}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
            {driver.avatar}
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{driver.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{driver.phone}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', fontSize: '0.75rem' }}>
          <span style={{ background: 'var(--bg-hover)', padding: '4px 8px', borderRadius: '4px', flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Navigation size={12} /> {route.origin} → {route.destination}
          </span>
        </div>

        <div className="grid grid-3 gap-8">
          <div style={{ background: 'var(--bg-hover)', padding: '8px', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Thermometer size={10} /> Temp
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: tempClass.color }}>
              {telemetry?.temperature != null ? `${telemetry.temperature}°C` : '--'}
            </div>
          </div>
          
          <div style={{ background: 'var(--bg-hover)', padding: '8px', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Droplets size={10} /> Hum
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: humClass.color }}>
              {telemetry?.humidity != null ? `${telemetry.humidity}%` : '--'}
            </div>
          </div>
          
          <div style={{ background: 'var(--bg-hover)', padding: '8px', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Battery size={10} /> Bat
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: (telemetry?.battery < 20) ? 'var(--danger)' : 'var(--success)' }}>
              {telemetry?.battery != null ? `${telemetry.battery}%` : '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
