import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { Thermometer, Droplets, Wind, Activity, Save, RefreshCw, AlertTriangle, CheckCircle, Info, Wifi, WifiOff, Beaker } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

// Visual Range Bar Component
const RangeBar = ({ min, max, current, absoluteMin, absoluteMax, margin, label }) => {
  const range = absoluteMax - absoluteMin;
  const currentPct = Math.max(0, Math.min(100, ((current - absoluteMin) / range) * 100));
  const minPct = Math.max(0, Math.min(100, ((min - absoluteMin) / range) * 100));
  const maxPct = Math.max(0, Math.min(100, ((max - absoluteMin) / range) * 100));

  const span = max - min;
  const warnMargin = span * (margin / 100);
  const warnMinPct = Math.max(0, Math.min(100, (((min + warnMargin) - absoluteMin) / range) * 100));
  const warnMaxPct = Math.max(0, Math.min(100, (((max - warnMargin) - absoluteMin) / range) * 100));

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
        <span>{absoluteMin}{label}</span>
        <span>{absoluteMax}{label}</span>
      </div>
      <div style={{ position: 'relative', height: '12px', background: 'var(--danger-bg)', borderRadius: '6px', overflow: 'hidden' }}>
        {/* Warning Zones */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${minPct}%`, width: `${maxPct - minPct}%`, background: 'var(--warning-bg)' }} />
        {/* Safe Zone */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${warnMinPct}%`, width: `${warnMaxPct - warnMinPct}%`, background: 'var(--success-bg)' }} />
      </div>
      {/* Current Marker */}
      <div style={{ position: 'relative', height: '24px', marginTop: '-18px' }}>
        <div style={{
          position: 'absolute', left: `calc(${currentPct}% - 6px)`,
          width: '12px', height: '12px', background: 'var(--text-primary)',
          borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transition: 'left 0.3s ease-out'
        }} />
        <div style={{
          position: 'absolute', left: `calc(${currentPct}% - 20px)`, top: '16px',
          fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)',
          width: '40px', textAlign: 'center'
        }}>{current.toFixed(1)}</div>
      </div>
    </div>
  );
};

export default function LiveLoadTesting() {
  const navigate = useNavigate();
  const { containerData, driverData } = useTelemetry();

  const [dbProfile, setDbProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Thresholds
  const [limits, setLimits] = useState({
    tempMin: 0, tempMax: 0, humidityMin: 0, humidityMax: 0, margin: 10
  });

  // Force Test Mode
  const [testMode, setTestMode] = useState(false);
  const [testValues, setTestValues] = useState({ temp: null, humidity: null, gas: null });

  // Local Alert History (Debounced)
  const [alertHistory, setAlertHistory] = useState([]);

  // Modern Modal State
  const [modalConfig, setModalConfig] = useState(null);

  // Hardware Connection Tracking
  const [lastSeen, setLastSeen] = useState(Date.now());
  const [isOffline, setIsOffline] = useState(false);

  // Fetch Load Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/load-profiles/active`);
        const result = await res.json();
        if (result.success && result.data) {
          setDbProfile(result.data);
          setLimits({
            tempMin: result.data.tempMin,
            tempMax: result.data.tempMax,
            humidityMin: result.data.humidityMin,
            humidityMax: result.data.humidityMax,
            margin: 10
          });
        }
      } catch (err) {
        console.error('Failed to fetch active load', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Track Hardware Connection
  useEffect(() => {
    if (containerData?.timestamp) {
      setLastSeen(Date.now());
      setIsOffline(false);
    }
  }, [containerData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastSeen > 15000) {
        setIsOffline(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSeen]);

  // Alert State Evaluation Engine
  const evaluateState = (current, min, max, marginPct) => {
    if (current == null) return { status: 'OFFLINE', color: 'var(--text-tertiary)', type: 'offline' };
    const span = max - min;
    const margin = span * (marginPct / 100);

    if (current > max) return { status: 'TOO HIGH', color: 'var(--danger)', type: 'high' };
    if (current < min) return { status: 'TOO LOW', color: 'var(--danger)', type: 'low' };
    if (current > max - margin) return { status: 'WARNING HIGH', color: 'var(--warning)', type: 'warning_high' };
    if (current < min + margin) return { status: 'WARNING LOW', color: 'var(--warning)', type: 'warning_low' };
    return { status: 'NORMAL', color: 'var(--success)', type: 'normal' };
  };

  // Specific logic for MQ6 Gas
  const evaluateMQ6 = (current) => {
    if (current == null) return { status: 'OFFLINE', color: 'var(--text-tertiary)', type: 'offline' };
    if (current >= 651) return { status: 'CRITICAL', color: 'var(--danger)', type: 'high' };
    if (current >= 501) return { status: 'WARNING', color: 'var(--warning)', type: 'warning_high' }; // Orange warning
    if (current >= 401) return { status: 'ELEVATED', color: 'var(--warning)', type: 'warning_low' }; // Yellow warning
    return { status: 'NORMAL', color: 'var(--success)', type: 'normal' }; // 300-400
  };

  const actualTemp = containerData?.temperature ?? null;
  const actualHum = containerData?.humidity ?? null;
  const actualGas = containerData?.mq6 ?? null;
  const actualVib = driverData?.motion?.z ?? null;

  const currentTemp = testMode && testValues.temp !== null ? testValues.temp : actualTemp;
  const currentHum = testMode && testValues.humidity !== null ? testValues.humidity : actualHum;
  const currentGas = testMode && testValues.gas !== null ? testValues.gas : actualGas;
  const currentVib = actualVib; // No test mode for vibration yet

  const tempState = evaluateState(currentTemp, limits.tempMin, limits.tempMax, limits.margin);
  const humState = evaluateState(currentHum, limits.humidityMin, limits.humidityMax, limits.margin);
  const gasState = evaluateMQ6(currentGas);
  
  let vibState = { status: 'NORMAL', color: 'var(--success)', type: 'normal' };
  if (actualVib == null) {
    vibState = { status: 'OFFLINE', color: 'var(--text-tertiary)', type: 'offline' };
  } else if (dbProfile?.handlingType?.toLowerCase()?.includes('sensitive') || dbProfile?.handlingType?.toLowerCase()?.includes('fragile')) {
    if (actualVib > 1.5) vibState = { status: 'CRITICAL', color: 'var(--danger)', type: 'high' };
    else if (actualVib > 1.2) vibState = { status: 'WARNING', color: 'var(--warning)', type: 'warning_high' };
  } else {
    if (actualVib > 2.0) vibState = { status: 'WARNING', color: 'var(--warning)', type: 'warning_high' };
  }

  // Debounced History Logging
  useEffect(() => {
    if (loading) return;

    const logAlert = (sensor, state, currentVal, limitVal) => {
      if (state.type === 'normal' || state.type === 'offline') return;

      setAlertHistory(prev => {
        const last = prev[0];
        // If the same alert type is already active, don't duplicate it. Just let it be.
        if (last && last.sensor === sensor && last.status === state.status && last.active) {
          return prev;
        }

        // If returning to normal or changing status, mark previous of this sensor as resolved
        const updated = prev.map(a => a.sensor === sensor && a.active ? { ...a, active: false } : a);

        const newAlert = {
          id: Date.now(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sensor,
          value: currentVal,
          limit: limitVal,
          status: state.status,
          active: true
        };
        return [newAlert, ...updated].slice(0, 50);
      });
    };

    logAlert('Temperature', tempState, currentTemp, tempState.type === 'high' ? limits.tempMax : limits.tempMin);
    logAlert('Humidity', humState, currentHum, humState.type === 'high' ? limits.humidityMax : limits.humidityMin);
    logAlert('Container Gas', gasState, currentGas, '400');

    // Resolve if normal
    setAlertHistory(prev => {
      let changed = false;
      const updated = prev.map(a => {
        if (a.active && a.sensor === 'Temperature' && tempState.type === 'normal') {
          changed = true; return { ...a, active: false, resolvedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        }
        if (a.active && a.sensor === 'Humidity' && humState.type === 'normal') {
          changed = true; return { ...a, active: false, resolvedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        }
        if (a.active && a.sensor === 'Container Gas' && gasState.type === 'normal') {
          changed = true; return { ...a, active: false, resolvedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        }
        return a;
      });
      return changed ? updated : prev;
    });

  }, [tempState.status, humState.status, gasState.status, loading]);

  // Overall Status
  const criticalCount = [tempState, humState, gasState, vibState].filter(s => s.type === 'high' || s.type === 'low').length;
  let overallStatus = '🟢 ALL CONDITIONS NORMAL';
  if (criticalCount > 1) overallStatus = '🔴 MULTIPLE ALERTS';
  else if (tempState.type === 'high' || tempState.type === 'low') overallStatus = '🔴 TEMPERATURE ALERT';
  else if (humState.type === 'high' || humState.type === 'low') overallStatus = '🔴 HUMIDITY ALERT';
  else if (gasState.type === 'high') overallStatus = '🔴 GAS ALERT';
  else if (vibState.type === 'high') overallStatus = '🔴 VIBRATION ALERT';
  else if ([tempState, humState, gasState, vibState].some(s => s.type?.includes('warning'))) overallStatus = '🟡 ATTENTION REQUIRED';

  // Save to DB (using modern modal)
  const saveLimits = () => {
    setModalConfig({
      type: 'confirm',
      message: 'Save these new monitoring limits? (Gas limits are fixed by the hardware prototype rules.)',
      onConfirm: async () => {
        setModalConfig(null);
        try {
          await fetch(`${API_BASE_URL}/api/load-profiles/${dbProfile._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...dbProfile, tempMin: limits.tempMin, tempMax: limits.tempMax, humidityMin: limits.humidityMin, humidityMax: limits.humidityMax })
          });
          setModalConfig({ type: 'success', message: 'Limits successfully saved to the backend.' });
        } catch (err) {
          console.error(err);
          setModalConfig({ type: 'error', message: 'Network error saving limits. Make sure the server is running.' });
        }
      }
    });
  };

  const resetLimits = () => {
    setLimits({
      tempMin: dbProfile.tempMin, tempMax: dbProfile.tempMax,
      humidityMin: dbProfile.humidityMin, humidityMax: dbProfile.humidityMax,
      margin: 10
    });
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading testing environment...</div>;

  if (!dbProfile) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>No Active Load Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You must configure a load before accessing the Live Load Testing dashboard.</p>
        <button className="btn btn-primary" onClick={() => navigate('/admin/load-config')}>Configure Load</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Live Load Testing</h1>
          <p className="page-subtitle">Dynamically adjust limits and test real hardware alerts</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: isOffline ? 'var(--danger-bg)' : 'var(--success-bg)', color: isOffline ? 'var(--danger)' : 'var(--success)', borderRadius: '20px', fontWeight: 600, fontSize: '0.875rem' }}>
          {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
          {isOffline ? 'Hardware Offline' : 'Hardware Connected'}
        </div>
      </div>

      {testMode && (
        <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', color: 'var(--warning)', padding: '12px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <Beaker size={20} /> 🧪 TEST MODE ACTIVE - Displaying simulated values
        </div>
      )}

      <div className="grid grid-3 gap-24">

        {/* LEFT COLUMN: Data & Visualization */}
        <div style={{ gridColumn: 'span 2' }}>

          {/* Section 1: Active Load */}
          <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Active Load</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>{dbProfile.name}</h2>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Category: {dbProfile.category.replace('_', ' ').toUpperCase()} | Handling: {dbProfile.handlingType}</div>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('/admin/load-config')}>Edit Load</button>
          </div>

          {/* Section 2: Live Hardware Data */}
          <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Live Hardware Data</h3>
          <div className="grid grid-3 gap-16" style={{ marginBottom: '24px' }}>
            {/* Temp Card */}
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '8px', border: `2px solid ${tempState.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 600 }}>
                <Thermometer size={16} /> Temperature
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: tempState.color, marginBottom: '8px' }}>
                {currentTemp != null ? `${currentTemp.toFixed(1)} °C` : '-- °C'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                Allowed: {limits.tempMin}°C – {limits.tempMax}°C
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: tempState.color, padding: '4px 8px', background: `${tempState.color}20`, borderRadius: '4px', display: 'inline-block' }}>
                {tempState.status}
              </div>
              {testMode && (
                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Actual Hardware: {actualTemp != null ? `${actualTemp}°C` : 'Offline'}
                </div>
              )}
            </div>

            {/* Hum Card */}
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '8px', border: `2px solid ${humState.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 600 }}>
                <Droplets size={16} /> Humidity
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: humState.color, marginBottom: '8px' }}>
                {currentHum != null ? `${currentHum.toFixed(1)} %` : '-- %'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                Allowed: {limits.humidityMin}% – {limits.humidityMax}%
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: humState.color, padding: '4px 8px', background: `${humState.color}20`, borderRadius: '4px', display: 'inline-block' }}>
                {humState.status}
              </div>
            </div>

            {/* Gas Card */}
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '8px', border: `2px solid ${gasState.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 600 }}>
                <Wind size={16} /> Gas Sensor Index
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: gasState.color, marginBottom: '8px' }}>
                {currentGas != null ? `${currentGas.toFixed(0)}` : '--'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                Normal Range: 300 - 400
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: gasState.color, padding: '4px 8px', background: `${gasState.color}20`, borderRadius: '4px', display: 'inline-block' }}>
                {gasState.status}
              </div>
            </div>
          </div>

          {/* Section 9: Live Range Visualization */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Live Range Visualization</h3>

            {currentTemp != null && (
              <RangeBar min={limits.tempMin} max={limits.tempMax} current={currentTemp} absoluteMin={-50} absoluteMax={100} margin={limits.margin} label="°C" />
            )}

            {currentHum != null && (
              <RangeBar min={limits.humidityMin} max={limits.humidityMax} current={currentHum} absoluteMin={0} absoluteMax={100} margin={limits.margin} label="%" />
            )}
          </div>

          {/* Section 8: Alert History */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Alert History</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-tertiary)', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Time</th>
                  <th style={{ padding: '8px' }}>Sensor</th>
                  <th style={{ padding: '8px' }}>Value</th>
                  <th style={{ padding: '8px' }}>Limit</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {alertHistory.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No alerts recorded in this session.</td></tr>
                )}
                {alertHistory.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border)', background: a.active ? 'var(--danger-bg)' : 'transparent', color: a.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    <td style={{ padding: '8px' }}>{a.time}</td>
                    <td style={{ padding: '8px' }}>{a.sensor}</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{a.value}</td>
                    <td style={{ padding: '8px' }}>{a.limit}</td>
                    <td style={{ padding: '8px' }}>
                      {a.active ? <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{a.status}</span> : <span style={{ color: 'var(--success)' }}>Resolved at {a.resolvedTime}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* RIGHT COLUMN: Controls & Status */}
        <div>

          {/* Section 7: Alert Status Panel */}
          <div className="card" style={{ marginBottom: '24px', background: criticalCount > 0 ? 'var(--danger-bg)' : 'var(--success-bg)', border: `1px solid ${criticalCount > 0 ? 'var(--danger)' : 'var(--success)'}` }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: criticalCount > 0 ? 'var(--danger)' : 'var(--success)', marginBottom: '16px' }}>
              {overallStatus}
            </h2>
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Temperature:</span>
                <span style={{ fontWeight: 700, color: tempState.color }}>{tempState.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Humidity:</span>
                <span style={{ fontWeight: 700, color: humState.color }}>{humState.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Gas Sensor Index:</span>
                <span style={{ fontWeight: 700, color: gasState.color }}>{gasState.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Vibration:</span>
                <span style={{ fontWeight: 700, color: vibState.color }}>{vibState.status}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Live Test Controls */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Live Test Controls</h3>

            {/* Temp Controls */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Temperature Range (°C)</h4>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', width: '40px' }}>Min</span>
                <input type="range" min="-50" max="100" value={limits.tempMin} onChange={e => setLimits({ ...limits, tempMin: Number(e.target.value) })} style={{ flex: 1 }} />
                <input type="number" className="form-input" style={{ width: '80px', padding: '4px' }} value={limits.tempMin} onChange={e => setLimits({ ...limits, tempMin: Number(e.target.value) })} />
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', width: '40px' }}>Max</span>
                <input type="range" min="-50" max="100" value={limits.tempMax} onChange={e => setLimits({ ...limits, tempMax: Number(e.target.value) })} style={{ flex: 1 }} />
                <input type="number" className="form-input" style={{ width: '80px', padding: '4px' }} value={limits.tempMax} onChange={e => setLimits({ ...limits, tempMax: Number(e.target.value) })} />
              </div>
            </div>

            {/* Hum Controls */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Humidity Range (% RH)</h4>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', width: '40px' }}>Min</span>
                <input type="range" min="0" max="100" value={limits.humidityMin} onChange={e => setLimits({ ...limits, humidityMin: Number(e.target.value) })} style={{ flex: 1 }} />
                <input type="number" className="form-input" style={{ width: '80px', padding: '4px' }} value={limits.humidityMin} onChange={e => setLimits({ ...limits, humidityMin: Number(e.target.value) })} />
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', width: '40px' }}>Max</span>
                <input type="range" min="0" max="100" value={limits.humidityMax} onChange={e => setLimits({ ...limits, humidityMax: Number(e.target.value) })} style={{ flex: 1 }} />
                <input type="number" className="form-input" style={{ width: '80px', padding: '4px' }} value={limits.humidityMax} onChange={e => setLimits({ ...limits, humidityMax: Number(e.target.value) })} />
              </div>
            </div>

            {/* Section 4: Warning Margin */}
            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-main)', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Early Warning Margin (%)</h4>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input type="range" min="0" max="50" value={limits.margin} onChange={e => setLimits({ ...limits, margin: Number(e.target.value) })} style={{ flex: 1 }} />
                <input type="number" className="form-input" style={{ width: '80px', padding: '4px' }} value={limits.margin} onChange={e => setLimits({ ...limits, margin: Number(e.target.value) })} />
              </div>
            </div>

            {/* Section 10: Reset Controls */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={resetLimits}>
                <RefreshCw size={14} /> Reset
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveLimits}>
                <Save size={14} /> Save Limits
              </button>
            </div>
          </div>

          {/* Section 6: Force Test Mode */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Force Test Mode</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Simulate extreme values without affecting the real hardware.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '8px' }} onClick={() => { setTestMode(true); setTestValues({ ...testValues, temp: limits.tempMin - 10 }); }}>Test Temp Low</button>
              <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '8px' }} onClick={() => { setTestMode(true); setTestValues({ ...testValues, temp: limits.tempMax + 10 }); }}>Test Temp High</button>
              <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '8px' }} onClick={() => { setTestMode(true); setTestValues({ ...testValues, humidity: limits.humidityMin - 20 }); }}>Test Hum Low</button>
              <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '8px' }} onClick={() => { setTestMode(true); setTestValues({ ...testValues, humidity: limits.humidityMax + 20 }); }}>Test Hum High</button>
              <button className="btn btn-outline" style={{ gridColumn: 'span 2', fontSize: '0.75rem', padding: '8px' }} onClick={() => { setTestMode(true); setTestValues({ ...testValues, gas: 700 }); }}>Test Gas High (Critical)</button>
            </div>

            <button className="btn" style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }} onClick={() => { setTestMode(false); setTestValues({ temp: null, humidity: null, gas: null }); }}>
              Clear Test & Return to Live Data
            </button>
          </div>

          {/* Vibration Indicator Bottom */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Hardware Sensors</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-main)', border: `1px solid ${vibState.color}`, borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <Activity size={16} /> Vibration (Motion Z)
              </div>
              <div style={{ fontWeight: 700, color: vibState.color }}>
                {currentVib != null ? `${currentVib.toFixed(2)} G` : '--'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modern Alert/Confirm Modal Overlay */}
      {modalConfig && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              {modalConfig.type === 'confirm' && <Info size={28} color="var(--primary)" />}
              {modalConfig.type === 'success' && <CheckCircle size={28} color="var(--success)" />}
              {modalConfig.type === 'error' && <AlertTriangle size={28} color="var(--danger)" />}
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {modalConfig.type === 'confirm' ? 'Confirm Save' : modalConfig.type === 'success' ? 'Success' : 'Error'}
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6, fontSize: '0.875rem' }}>
              {modalConfig.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              {modalConfig.type === 'confirm' ? (
                <>
                  <button className="btn btn-outline" onClick={() => setModalConfig(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={modalConfig.onConfirm}>Confirm & Save</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setModalConfig(null)}>Acknowledge</button>
              )}
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          `}</style>
        </div>
      )}

    </div>
  );
}
