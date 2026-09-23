import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { Package, Thermometer, Droplets, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';

export function EnvironmentMonitor() {
  const { containerData, driverData } = useTelemetry();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchActiveProfile();
  }, []);

  const fetchActiveProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/load-profiles/active`);
      const result = await res.json();
      if (result.success && result.data) {
        setProfile(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch active profile', err);
    }
  };

  if (!profile) {
    return <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '24px' }}>Loading active load profile...</div>;
  }

  const temp = containerData?.temperature;
  const hum = containerData?.humidity;
  const vib = driverData?.motion?.z || 0;

  // Temperature Status
  let tempStatus = 'UNKNOWN';
  let tempColor = 'var(--text-tertiary)';
  if (temp != null) {
    const margin = (profile.tempMax - profile.tempMin) * 0.1;
    if (temp > profile.tempMax) { tempStatus = 'TOO HIGH'; tempColor = 'var(--danger)'; }
    else if (temp < profile.tempMin) { tempStatus = 'TOO LOW'; tempColor = 'var(--danger)'; }
    else if (temp > profile.tempMax - margin || temp < profile.tempMin + margin) { tempStatus = 'WARNING'; tempColor = 'var(--warning)'; }
    else { tempStatus = 'NORMAL'; tempColor = 'var(--success)'; }
  }

  // Humidity Status
  let humStatus = 'UNKNOWN';
  let humColor = 'var(--text-tertiary)';
  if (hum != null) {
    const margin = (profile.humidityMax - profile.humidityMin) * 0.1;
    if (hum > profile.humidityMax) { humStatus = 'TOO HIGH'; humColor = 'var(--danger)'; }
    else if (hum < profile.humidityMin) { humStatus = 'TOO LOW'; humColor = 'var(--danger)'; }
    else if (hum > profile.humidityMax - margin || hum < profile.humidityMin + margin) { humStatus = 'WARNING'; humColor = 'var(--warning)'; }
    else { humStatus = 'NORMAL'; humColor = 'var(--success)'; }
  }

  // Vibration Status
  let vibStatus = 'NORMAL';
  let vibColor = 'var(--success)';
  if (profile.handlingType.toLowerCase().includes('sensitive') || profile.handlingType.toLowerCase().includes('fragile')) {
    if (vib > 1.5) { vibStatus = 'CRITICAL'; vibColor = 'var(--danger)'; }
    else if (vib > 1.2) { vibStatus = 'WARNING'; vibColor = 'var(--warning)'; }
  } else {
    if (vib > 2.0) { vibStatus = 'WARNING'; vibColor = 'var(--warning)'; }
  }

  const isCritical = tempStatus.includes('TOO') || humStatus.includes('TOO') || vibStatus === 'CRITICAL';
  const isWarning = tempStatus === 'WARNING' || humStatus === 'WARNING' || vibStatus === 'WARNING';
  
  let overallStatus = 'LOAD CONDITIONS NORMAL';
  let overallColor = 'var(--success)';
  let overallBg = 'var(--success-bg)';
  let Icon = CheckCircle;

  if (isCritical) {
    overallStatus = 'ENVIRONMENTAL ALERT';
    overallColor = 'var(--danger)';
    overallBg = 'var(--danger-bg)';
    Icon = AlertTriangle;
  } else if (isWarning) {
    overallStatus = 'ATTENTION REQUIRED';
    overallColor = 'var(--warning)';
    overallBg = 'rgba(245, 158, 11, 0.1)';
    Icon = AlertTriangle;
  }

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '24px' }}>
      <div style={{ background: overallBg, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: overallColor, fontWeight: 800, letterSpacing: '0.05em' }}>
          <Icon size={24} />
          {overallStatus}
        </div>
        <div style={{ display: 'flex', gap: '24px', fontSize: '0.875rem' }}>
          <div><span style={{ color: 'var(--text-secondary)' }}>Product:</span> <strong>{profile.name}</strong></div>
          <div><span style={{ color: 'var(--text-secondary)' }}>Category:</span> <strong>{profile.category.replace('_', ' ').toUpperCase()}</strong></div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '24px' }}>
        
        {/* Temp Card */}
        <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '8px', border: `1px solid ${tempColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 600 }}>
            <Thermometer size={16} /> Temperature
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: tempColor, marginBottom: '8px' }}>
            {temp != null ? `${temp}°C` : '-- °C'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            Allowed: {profile.tempMin}°C to {profile.tempMax}°C
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: tempColor, padding: '4px 8px', background: `${tempColor}20`, borderRadius: '4px', display: 'inline-block' }}>
            {tempStatus}
          </div>
        </div>

        {/* Humidity Card */}
        <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '8px', border: `1px solid ${humColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 600 }}>
            <Droplets size={16} /> Humidity
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: humColor, marginBottom: '8px' }}>
            {hum != null ? `${hum}% RH` : '-- % RH'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            Allowed: {profile.humidityMin}% to {profile.humidityMax}%
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: humColor, padding: '4px 8px', background: `${humColor}20`, borderRadius: '4px', display: 'inline-block' }}>
            {humStatus}
          </div>
        </div>

        {/* Handling Card */}
        <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '8px', border: `1px solid ${vibColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '0.875rem', fontWeight: 600 }}>
            <Activity size={16} /> Handling / Vibration
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: vibColor, marginBottom: '8px' }}>
            {vib != null ? `${vib}G` : '-- G'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            Type: {profile.handlingType}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: vibColor, padding: '4px 8px', background: `${vibColor}20`, borderRadius: '4px', display: 'inline-block' }}>
            {vibStatus}
          </div>
        </div>

      </div>
    </div>
  );
}
