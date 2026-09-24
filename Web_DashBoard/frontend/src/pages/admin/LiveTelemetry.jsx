import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { useTelemetry } from '../../context/TelemetryContext';
import { useAlerts } from '../../context/AlertContext';
import { Thermometer, Droplets, Wind, Activity, Battery, Sun, Zap, Activity as ActivityIcon, CheckCircle, Package, Truck, ShieldAlert, Radio, Wifi, WifiOff } from 'lucide-react';
import { SensorChart } from '../../components/common/SensorChart';

const PulseIndicator = ({ color = 'var(--danger)' }) => (
  <span style={{ 
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '10px', height: '10px', borderRadius: '50%', background: color,
    boxShadow: `0 0 10px ${color}`, animation: 'pulse 2s infinite'
  }}></span>
);

const SensorCard = ({ title, value, unit, icon: Icon, state, allowedText, primary = false }) => (
  <div style={{ 
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${state.color === 'var(--text-tertiary)' ? 'rgba(255,255,255,0.3)' : state.color + '40'}`, 
    borderTop: `4px solid ${state.color}`,
    borderRadius: '20px',
    padding: primary ? '24px' : '16px', 
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default'
  }}
  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)'; }}
  >
    {/* Decorative background icon */}
    <div style={{ position: 'absolute', right: '-5%', bottom: primary ? '-10%' : '-15%', opacity: 0.04, pointerEvents: 'none', transform: 'rotate(-15deg)' }}>
      <Icon size={primary ? 140 : 90} />
    </div>
    
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: primary ? '20px' : '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 700, fontSize: primary ? '0.9rem' : '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <div style={{ padding: '6px', borderRadius: '10px', background: `${state.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={primary ? 20 : 16} style={{ color: state.color }} />
          </div>
          {title}
        </div>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', background: `${state.color}15`, color: state.color, border: `1px solid ${state.color}30`, borderRadius: '8px', letterSpacing: '0.05em' }}>
          {state.badge}
        </div>
      </div>
      
      <div style={{ fontSize: primary ? '3.5rem' : '2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'monospace', marginBottom: '8px', lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        {value != null ? value : '--'} <span style={{ fontSize: primary ? '1.25rem' : '0.875rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{unit}</span>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', background: 'rgba(0,0,0,0.04)', padding: '4px 8px', borderRadius: '6px' }}>
          {allowedText}
        </div>
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, data, dataKey, color, unit, yDomain, icon: Icon }) => (
  <div style={{ 
    background: 'rgba(255, 255, 255, 0.75)', 
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.4)', 
    borderRadius: '20px', 
    padding: '24px', 
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s ease',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <div style={{ background: `${color}15`, padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Icon && <Icon size={20} color={color} />}
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, letterSpacing: '0.02em', color: 'var(--text-primary)' }}>{title}</h3>
    </div>
    <div style={{ height: '280px', width: '100%' }}>
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

  const criticalCount = [tempState, humState, gasState].filter(s => s.badge.includes('CRITICAL')).length;
  const warningCount = [tempState, humState, gasState].filter(s => s.badge.includes('WARNING') || s.badge.includes('ELEVATED')).length;

  let bannerConfig = { color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', icon: CheckCircle, text: 'SYSTEM NORMAL: All environment parameters are within strict bounds.' };
  if (isOffline) {
    bannerConfig = { color: 'var(--text-tertiary)', bg: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.3)', icon: WifiOff, text: 'SYSTEM OFFLINE: Awaiting hardware transmission.' };
  } else if (criticalCount > 0) {
    bannerConfig = { color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', icon: ShieldAlert, text: 'CRITICAL ALERT: Environment parameters breached strict limits.' };
  } else if (warningCount > 0) {
    bannerConfig = { color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', icon: ShieldAlert, text: 'WARNING: Environment parameters are approaching critical thresholds.' };
  }

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '60px' }}>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slideDown 0.4s ease forwards; }
        .grid-5 { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); }
        .grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
        @media (max-width: 1400px) { .grid-5, .grid-4 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 1024px) { .grid-5, .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 768px) { .grid-5, .grid-4 { grid-template-columns: 1fr; } }
      `}</style>

      {/* COMPACT HEADER */}
      <div className="animate-slide-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.75rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', background: 'linear-gradient(90deg, var(--primary-dark), var(--info))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            <Radio size={28} color="var(--primary)" /> Live Telemetry
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 600, marginTop: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.6)', padding: '4px 10px', borderRadius: '12px' }}><Package size={14} /> FT-CNT-001</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.6)', padding: '4px 10px', borderRadius: '12px' }}><Truck size={14} /> FT-TRK-001</span>
            <span style={{ fontStyle: 'italic' }}>Updated: {isOffline ? '>15 sec ago' : 'Just now'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: isOffline ? 'var(--text-tertiary)' : 'var(--success)', fontSize: '0.85rem', padding: '8px 16px', background: 'rgba(255,255,255,0.8)', border: `1px solid ${isOffline ? 'rgba(100, 116, 139, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          {!isOffline && <PulseIndicator color="var(--success)" />} {isOffline ? 'SYSTEM OFFLINE' : 'LIVE CONNECTION'}
        </div>
      </div>

      {/* ALERT BANNER & ACTIVE LOAD */}
      <div className="grid grid-2 gap-16 animate-slide-down" style={{ marginBottom: '24px', animationDelay: '0.1s' }}>
        <div style={{ padding: '16px 20px', background: bannerConfig.bg, color: bannerConfig.color, border: `1px solid ${bannerConfig.border}`, borderRadius: '16px', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '12px', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <bannerConfig.icon size={24} /> {bannerConfig.text}
        </div>
        
        <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '16px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.05)', padding: '6px 12px', borderRadius: '10px' }}>
              <Package size={16} /> ACTIVE PROFILE
            </div>
            {dbProfile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--primary-dark)', fontSize: '1rem' }}>{dbProfile.name.toUpperCase()}</span>
                <span style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}>|</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Thermometer size={14} color="var(--warning)" /> {dbProfile.tempMin}-{dbProfile.tempMax}°C</span>
                <span style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}>|</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Droplets size={14} color="var(--info)" /> {dbProfile.humidityMin}-{dbProfile.humidityMax}%</span>
              </div>
            ) : (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', fontStyle: 'italic', fontWeight: 600 }}>No profile assigned</span>
            )}
          </div>
        </div>
      </div>

      {/* PRIMARY SENSORS ROW (Grid-3) - HIGHLIGHTED */}
      <div className="animate-slide-down" style={{ marginBottom: '20px', animationDelay: '0.2s' }}>
        <div className="grid grid-3 gap-24">
          <SensorCard 
            title="Temperature" value={actualTemp?.toFixed(1)} unit="°C" icon={Thermometer} state={tempState} 
            allowedText={dbProfile ? `LIMITS: ${dbProfile.tempMin}°C TO ${dbProfile.tempMax}°C` : 'UNCONFIGURED'} 
            primary={true}
          />
          <SensorCard 
            title="Relative Humidity" value={actualHum?.toFixed(1)} unit="%" icon={Droplets} state={humState} 
            allowedText={dbProfile ? `LIMITS: ${dbProfile.humidityMin}% TO ${dbProfile.humidityMax}%` : 'UNCONFIGURED'} 
            primary={true}
          />
          <SensorCard 
            title="Volatile Gases" value={actualGas} unit="IDX" icon={Wind} state={gasState} 
            allowedText="NORMAL: 300 TO 400" 
            primary={true}
          />
        </div>
      </div>

      {/* SECONDARY SENSORS ROW (Grid-5) */}
      <div className="animate-slide-down" style={{ marginBottom: '40px', animationDelay: '0.3s' }}>
        <div className="grid-5 gap-20">
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
      <div className="animate-slide-down" style={{ marginBottom: '40px', animationDelay: '0.4s' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          <ActivityIcon size={22} color="var(--primary)" /> Historical Trends
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
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-3 gap-24 animate-slide-down" style={{ animationDelay: '0.5s' }}>
        {/* Environment Alerts Panel ONLY */}
        <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            <div style={{ background: 'var(--danger-bg)', padding: '8px', borderRadius: '12px' }}><ShieldAlert size={18} color="var(--danger)" /></div>
            Recent Environment Alerts
          </h3>
          {recentAlerts.length === 0 ? (
            <div style={{ color: 'var(--success-dark)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px dashed rgba(16, 185, 129, 0.4)', borderRadius: '12px' }}>
              <CheckCircle size={20} /> ALL SYSTEMS NOMINAL - NO CRITICAL ALERTS
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentAlerts.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border)', borderLeft: `4px solid ${a.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)'}`, borderRadius: '12px', transition: 'transform 0.1s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform='scale(1.01)'} onMouseLeave={(e) => e.currentTarget.style.transform='scale(1)'}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                      {a.severity === 'CRITICAL' ? '🔴' : '🟡'} {a.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.description}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'right', fontWeight: 800, background: 'rgba(0,0,0,0.05)', padding: '6px 10px', borderRadius: '8px' }}>
                    {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '12px' }}><Wifi size={18} color="#3B82F6" /></div>
            Gateway Status
          </h3>
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(255,255,255,1), rgba(240,244,248,0.5))', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.8)' }}>
            <div style={{ background: isOffline ? 'var(--danger-bg)' : 'var(--success-bg)', padding: '12px', borderRadius: '12px', color: isOffline ? 'var(--danger)' : 'var(--success)', position: 'relative' }}>
              <ActivityIcon size={24} />
              {!isOffline && <div style={{ position: 'absolute', top: '-2px', right: '-2px' }}><PulseIndicator color="var(--success)" /></div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Node</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.75rem', color: isOffline ? 'var(--danger)' : 'var(--success)', background: isOffline ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                  {isOffline ? '⚫ OFFLINE' : '🟢 ONLINE'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
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
