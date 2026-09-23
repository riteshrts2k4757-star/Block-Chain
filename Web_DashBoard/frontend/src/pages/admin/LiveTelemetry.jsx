import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAlerts } from '../../context/AlertContext';
import { Thermometer, Droplets, Wind, Activity, Battery, Sun, Zap, Activity as ActivityIcon, CheckCircle, Package, Truck, ShieldAlert, Radio, Wifi, WifiOff } from 'lucide-react';
import { SensorChart } from '../../components/common/SensorChart';

const PulseIndicator = () => (
  <span style={{ 
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)',
    boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)', animation: 'pulse 2s infinite'
  }}></span>
);

// Prevents React from unmounting and remounting
const SensorCard = ({ title, value, unit, icon: Icon, state, allowedText, primary = false }) => (
  <div style={{ 
    background: 'var(--bg-card)', 
    border: `1px solid ${state.color === 'var(--text-tertiary)' ? 'var(--border)' : state.color + '40'}`, 
    borderLeft: `4px solid ${state.color}`,
    borderRadius: '2px',
    padding: primary ? '20px' : '14px', 
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Decorative background icon */}
    <div style={{ position: 'absolute', right: '-10%', bottom: '-20%', opacity: 0.03, pointerEvents: 'none' }}>
      <Icon size={primary ? 120 : 80} />
    </div>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: primary ? '16px' : '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 700, fontSize: primary ? '0.875rem' : '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Icon size={primary ? 18 : 14} style={{ color: state.color }} /> {title}
        </div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', background: `${state.color}15`, color: state.color, border: `1px solid ${state.color}40`, borderRadius: '2px' }}>
          {state.badge}
        </div>
      </div>
      <div style={{ fontSize: primary ? '2.75rem' : '1.75rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'monospace', marginBottom: '8px', lineHeight: 1 }}>
        {value != null ? value : '--'} <span style={{ fontSize: primary ? '1rem' : '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
          {allowedText}
        </div>
      </div>
    </div>
  </div>
);

// Prevents React from unmounting and remounting
const ChartCard = ({ title, data, dataKey, color, unit, yDomain, icon: Icon }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2px', padding: '20px', borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      {Icon && <Icon size={18} color={color} />}
      <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>{title}</h3>
    </div>
    <div style={{ height: '280px' }}>
      <SensorChart data={data} dataKey={dataKey} color={color} name={title} unit={unit} yDomain={yDomain} />
    </div>
  </div>
);

export default function LiveTelemetry() {
  const navigate = useNavigate();
  const { containerData, driverData, containerHistory, driverHistory } = useTelemetry();
  const { alerts } = useAlerts();

  const [dbProfile, setDbProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [lastSeen, setLastSeen] = useState(Date.now());
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/load-profiles/active`);
        const result = await res.json();
        if (result.success && result.data) setDbProfile(result.data);
      } catch (err) {
        console.error('Failed to fetch active load', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (containerData?.timestamp) {
      setLastSeen(Date.now());
      setIsOffline(false);
    }
  }, [containerData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastSeen > 15000) setIsOffline(true);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSeen]);

  // Filter alerts: only show Temp, Humidity, and Container Gas
  const recentAlerts = alerts.filter(a => 
    a.title.toLowerCase().includes('temperature') || 
    a.title.toLowerCase().includes('humidity') || 
    a.title.toLowerCase().includes('gas')
  ).slice(0, 5);

  const evaluateState = (current, min, max, isOfflineFlag) => {
    if (isOfflineFlag || current == null) return { status: 'OFFLINE', color: 'var(--text-tertiary)', badge: 'OFFLINE' };
    if (!min && !max) return { status: 'NORMAL', color: 'var(--success)', badge: 'NORMAL' };
    const span = max - min;
    const margin = span * 0.1; 
    if (current > max) return { status: 'TOO HIGH', color: 'var(--danger)', badge: 'CRITICAL' };
    if (current < min) return { status: 'TOO LOW', color: 'var(--danger)', badge: 'CRITICAL' };
    if (current > max - margin || current < min + margin) return { status: 'WARNING', color: 'var(--warning)', badge: 'WARNING' };
    return { status: 'NORMAL', color: 'var(--success)', badge: 'NORMAL' };
  };

  const evaluateMQ3 = (current, isOfflineFlag) => {
    if (isOfflineFlag || current == null) return { status: 'OFFLINE', color: 'var(--text-tertiary)', badge: 'OFFLINE' };
    if (current <= 79) return { status: 'CRITICAL', color: 'var(--danger)', badge: 'CRITICAL' };
    if (current <= 199) return { status: 'HIGH RISK', color: 'var(--warning)', badge: 'HIGH RISK' };
    if (current <= 299) return { status: 'SUSPICIOUS', color: 'var(--warning)', badge: 'SUSPICIOUS' };
    return { status: 'NORMAL', color: 'var(--success)', badge: 'NORMAL' }; 
  };

  const evaluateMQ6 = (current, isOfflineFlag) => {
    if (isOfflineFlag || current == null) return { status: 'OFFLINE', color: 'var(--text-tertiary)', badge: 'OFFLINE' };
    if (current >= 651) return { status: 'CRITICAL', color: 'var(--danger)', badge: 'CRITICAL' };
    if (current >= 501) return { status: 'WARNING', color: 'var(--warning)', badge: 'WARNING' };
    if (current >= 401) return { status: 'ELEVATED', color: 'var(--warning)', badge: 'ELEVATED' };
    return { status: 'NORMAL', color: 'var(--success)', badge: 'NORMAL' }; 
  };

  const actualTemp = containerData?.temperature ?? null;
  const actualHum = containerData?.humidity ?? null;
  const actualGas = containerData?.mq6 ?? null;
  const actualVib = driverData?.motion?.z ?? null;
  const driverAlc = driverData?.mq3 ?? null;
  const contBat = containerData?.battery ?? null;
  const contSol = containerData?.solar ?? null;
  const drivBat = driverData?.battery ?? null;

  const tempState = evaluateState(actualTemp, dbProfile?.tempMin, dbProfile?.tempMax, isOffline);
  const humState = evaluateState(actualHum, dbProfile?.humidityMin, dbProfile?.humidityMax, isOffline);
  const gasState = evaluateMQ6(actualGas, isOffline);
  const vibState = evaluateState(actualVib, null, dbProfile?.handlingType?.toLowerCase().includes('sensitive') ? 1.5 : 2.0, isOffline);
  const alcState = evaluateMQ3(driverAlc, isOffline);

  // Banner logic restricted to Temp, Hum, and Gas ONLY
  const criticalCount = [tempState, humState, gasState].filter(s => s.badge.includes('CRITICAL')).length;
  const warningCount = [tempState, humState, gasState].filter(s => s.badge.includes('WARNING') || s.badge.includes('ELEVATED')).length;

  let bannerConfig = { color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)', border: 'var(--success)', icon: CheckCircle, text: 'SYSTEM NORMAL: Temperature, Humidity, and Gas are within strict bounds.' };
  if (isOffline) {
    bannerConfig = { color: 'var(--text-tertiary)', bg: 'var(--bg-main)', border: 'var(--text-tertiary)', icon: WifiOff, text: 'SYSTEM OFFLINE: Awaiting hardware transmission.' };
  } else if (criticalCount > 0) {
    bannerConfig = { color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', border: 'var(--danger)', icon: ShieldAlert, text: 'CRITICAL ALERT: Environment parameters (Temp/Hum/Gas) breached limits.' };
  } else if (warningCount > 0) {
    bannerConfig = { color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)', border: 'var(--warning)', icon: ShieldAlert, text: 'WARNING: Environment parameters (Temp/Hum/Gas) are approaching thresholds.' };
  }

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '40px' }}>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .grid-5 { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); }
        .grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
        @media (max-width: 1400px) { .grid-5, .grid-4 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 1024px) { .grid-5, .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      `}</style>

      {/* COMPACT HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Radio size={24} color="var(--primary)" /> Live Telemetry
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, marginTop: '4px' }}>
            <Package size={12} /> FT-CNT-001 | <Truck size={12} /> FT-TRK-001 | Updated: {isOffline ? '>15 sec ago' : 'Just now'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: isOffline ? 'var(--text-tertiary)' : 'var(--success)', fontSize: '0.75rem', padding: '4px 8px', border: `1px solid ${isOffline ? 'var(--text-tertiary)' : 'var(--success)'}`, borderRadius: '2px' }}>
          {!isOffline && <PulseIndicator />} {isOffline ? 'SYSTEM OFFLINE' : 'SYSTEM ONLINE'}
        </div>
      </div>

      {/* ALERT BANNER & ACTIVE LOAD */}
      <div className="grid grid-2 gap-16" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '12px 16px', background: bannerConfig.bg, color: bannerConfig.color, border: `1px solid ${bannerConfig.border}`, borderRadius: '2px', fontWeight: 700, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <bannerConfig.icon size={18} /> {bannerConfig.text}
        </div>
        
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
              <Package size={14} /> ACTIVE LOAD
            </div>
            {dbProfile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--primary)' }}>{dbProfile.name.toUpperCase()}</span>
                <span style={{ color: 'var(--text-tertiary)' }}>|</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Thermometer size={12} /> {dbProfile.tempMin}-{dbProfile.tempMax}°C</span>
                <span style={{ color: 'var(--text-tertiary)' }}>|</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Droplets size={12} /> {dbProfile.humidityMin}-{dbProfile.humidityMax}%</span>
              </div>
            ) : (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>UNCONFIGURED</span>
            )}
          </div>
        </div>
      </div>

      {/* PRIMARY SENSORS ROW (Grid-3) - HIGHLIGHTED */}
      <div style={{ marginBottom: '16px' }}>
        <div className="grid grid-3 gap-16">
          <SensorCard 
            title="Temperature" value={actualTemp?.toFixed(1)} unit="°C" icon={Thermometer} state={tempState} 
            allowedText={dbProfile ? `LIMITS: ${dbProfile.tempMin}°C TO ${dbProfile.tempMax}°C` : 'UNCONFIGURED'} 
            primary={true}
          />
          <SensorCard 
            title="Humidity" value={actualHum?.toFixed(1)} unit="% RH" icon={Droplets} state={humState} 
            allowedText={dbProfile ? `LIMITS: ${dbProfile.humidityMin}% TO ${dbProfile.humidityMax}%` : 'UNCONFIGURED'} 
            primary={true}
          />
          <SensorCard 
            title="Gas Sensor Index" value={actualGas} unit="IDX" icon={Wind} state={gasState} 
            allowedText="NORMAL: 300 TO 400" 
            primary={true}
          />
        </div>
      </div>

      {/* SECONDARY SENSORS ROW (Grid-5) */}
      <div style={{ marginBottom: '32px' }}>
        <div className="grid-5 gap-16">
          <SensorCard 
            title="Vibration (Z)" value={actualVib?.toFixed(2)} unit="G" icon={Activity} state={vibState} 
            allowedText={dbProfile?.handlingType?.toLowerCase().includes('sensitive') ? 'MAX: 1.5 G' : 'MAX: 2.0 G'} 
          />
          <SensorCard 
            title="Driver Alcohol" value={driverAlc} unit="IDX" icon={Zap} state={alcState} 
            allowedText="NORMAL: 300 TO 450" 
          />
          <SensorCard 
            title="Cont. Battery" value={contBat} unit="%" icon={Battery} state={evaluateState(contBat, 20, 100, isOffline)} 
            allowedText="MIN: 20%" 
          />
          <SensorCard 
            title="Cont. Solar" value={contSol?.toFixed(2)} unit="V" icon={Sun} state={evaluateState(contSol, 3.0, 6.0, isOffline)} 
            allowedText="MIN: 3.0 V" 
          />
          <SensorCard 
            title="Driver Battery" value={drivBat} unit="%" icon={Battery} state={evaluateState(drivBat, 20, 100, isOffline)} 
            allowedText="MIN: 20%" 
          />
        </div>
      </div>

      {/* CHARTS (All Sensors - Expanded for readability) */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          <ActivityIcon size={18} /> Historical Telemetry
        </h3>
        
        <div className="grid grid-2 gap-24" style={{ marginBottom: '24px' }}>
          <ChartCard title="Temperature History" data={containerHistory} dataKey="temperature" color="#F59E0B" unit="°C" yDomain={['auto', 'auto']} icon={Thermometer} />
          <ChartCard title="Humidity History" data={containerHistory} dataKey="humidity" color="#3B82F6" unit="%" yDomain={[0, 100]} icon={Droplets} />
        </div>
        
        <div className="grid grid-2 gap-24" style={{ marginBottom: '24px' }}>
          <ChartCard title="Gas Sensor History" data={containerHistory} dataKey="mq6" color="#8B5CF6" unit="ppm" yDomain={['auto', 'auto']} icon={Wind} />
          <ChartCard title="Vibration (Motion Z)" data={driverHistory} dataKey="motion.z" color="#EF4444" unit="g" yDomain={['auto', 'auto']} icon={Activity} />
        </div>
        
        <div className="grid grid-2 gap-24" style={{ marginBottom: '24px' }}>
          <ChartCard title="Driver Alcohol (MQ3)" data={driverHistory} dataKey="mq3" color="#10B981" unit="ppm" yDomain={['auto', 'auto']} icon={Zap} />
          <ChartCard title="Container Battery" data={containerHistory} dataKey="battery" color="#6366F1" unit="%" yDomain={[0, 100]} icon={Battery} />
        </div>
        
        <div className="grid grid-2 gap-24">
          <ChartCard title="Container Solar" data={containerHistory} dataKey="solar" color="#F59E0B" unit="V" yDomain={[0, 7]} icon={Sun} />
          <ChartCard title="Driver Battery" data={driverHistory} dataKey="battery" color="#EC4899" unit="%" yDomain={[0, 100]} icon={Battery} />
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-3 gap-16">
        {/* Environment Alerts Panel ONLY */}
        <div style={{ gridColumn: 'span 2', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase' }}>
            <ShieldAlert size={16} /> Recent Environment Alerts
          </h3>
          {recentAlerts.length === 0 ? (
            <div style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', padding: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle size={16} /> NO CRITICAL ENVIRONMENT ALERTS
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentAlerts.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderLeft: `3px solid ${a.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)'}` }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      {a.severity === 'CRITICAL' ? '🔴' : '🟡'} {a.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{a.description}</div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textAlign: 'right', fontWeight: 700 }}>
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase' }}>
            <Wifi size={16} /> Gateway Connection
          </h3>
          <div style={{ padding: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '4px', color: 'var(--primary)' }}>
              <ActivityIcon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Primary Node</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.65rem', color: isOffline ? 'var(--danger)' : 'var(--success)' }}>
                  {isOffline ? '⚫ OFFLINE' : '🟢 ONLINE'}
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                  {isOffline ? '> 15s' : '2s ago'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
