import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAlerts } from '../../context/AlertContext';
import { useSettings } from '../../context/SettingsContext';
import { TelemetryCard } from '../../components/common/TelemetryCard';
import { TruckCard } from '../../components/fleet/TruckCard';
import { SensorChart } from '../../components/common/SensorChart';
import { fleet } from '../../data/fleet';

export default function AdminDashboard() {
  const { driverData, containerData, containerHistory } = useTelemetry();
  const { criticalAlerts, activeAlerts } = useAlerts();
  const { classifyMQ3 } = useSettings();
  const navigate = useNavigate();

  const mq3Class = classifyMQ3(driverData?.mq3);

  return (
    <div>
      {/* Hero Section */}
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: 'white', padding: '32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Real-Time Cold Chain Intelligence</h1>
          <p style={{ fontSize: '1rem', opacity: 0.9, margin: 0 }}>Live telemetry powered by ESP32 + ESP8266 + MQTT</p>
        </div>
        <div style={{ display: 'none', gap: '16px', background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(8px)' }} ref={el => { if (el) el.style.display = window.innerWidth > 768 ? 'flex' : 'none'; }}>
          <div style={{ textAlign: 'center', padding: '0 16px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{containerData?.temperature ?? '--'}°C</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase' }}>Avg Temp</div>
          </div>
          <div style={{ textAlign: 'center', padding: '0 16px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{activeAlerts.length}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase' }}>Active Alerts</div>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-4 gap-16 mb-24">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ background: 'var(--info-bg)', color: 'var(--info)', padding: '12px', borderRadius: '12px' }}><Truck size={24} /></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>4</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Trucks</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ background: 'var(--info-bg)', color: 'var(--info)', padding: '12px', borderRadius: '12px' }}><Activity size={24} /></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>4</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Containers</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '12px', borderRadius: '12px' }}><Cpu size={24} /></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>8</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Online Devices</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: criticalAlerts.length > 0 ? '1px solid var(--danger-border)' : 'none' }}>
          <div style={{ background: criticalAlerts.length > 0 ? 'var(--danger-bg)' : 'var(--bg-hover)', color: criticalAlerts.length > 0 ? 'var(--danger)' : 'var(--text-secondary)', padding: '12px', borderRadius: '12px' }}><ShieldAlert size={24} /></div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: criticalAlerts.length > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{criticalAlerts.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Critical Alerts</div>
          </div>
        </div>
      </div>

      <div className="grid gap-24" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Fleet Overview */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Fleet Overview</h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/fleet')}>View All</button>
          </div>
          <div className="grid grid-4 gap-16">
            {fleet.map((truck, idx) => (
              <TruckCard 
                key={truck.truckId} 
                truck={truck} 
                telemetry={idx === 0 ? containerData : null} // Demo: first truck gets live data
                onClick={() => navigate('/admin/fleet')}
              />
            ))}
          </div>
        </div>

        {/* Live Container Temperature */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '16px' }}>Container Temperature (FT-CNT-001)</h2>
          <SensorChart 
            data={containerHistory} 
            dataKey="temperature" 
            color="#2563EB" 
            name="Temperature" 
            unit="°C" 
            yDomain={[0, 15]} 
          />
        </div>

        {/* Driver Status */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '16px' }}>Driver Safety (FT-TRK-001)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Alcohol Risk Index</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: mq3Class.color }}>{driverData?.mq3 ?? '--'}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: mq3Class.color, background: `${mq3Class.color}15`, padding: '4px 12px', borderRadius: '20px' }}>{mq3Class.status}</span>
              </div>
            </div>
            
            <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Vehicle Motion (MPU6050)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--info)' }}>{driverData?.speed ?? '--'} <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>km/h</span></span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)' }}>ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
