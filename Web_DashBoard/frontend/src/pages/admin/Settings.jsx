import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    alert('Settings saved successfully!');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure thresholds and classification rules</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => { resetSettings(); setLocalSettings(settings); }}>Reset to Defaults</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>

      <div className="grid grid-2 gap-24">
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '20px' }}>Container Temperature (°C)</h2>
          <div className="grid grid-2 gap-16">
            <InputGroup label="Minimum (Low Alert)" name="tempMin" value={localSettings.tempMin} onChange={handleChange} />
            <InputGroup label="Maximum (High Alert)" name="tempMax" value={localSettings.tempMax} onChange={handleChange} />
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '20px' }}>Container Humidity (%)</h2>
          <div className="grid grid-2 gap-16">
            <InputGroup label="Minimum (Low Alert)" name="humidityMin" value={localSettings.humidityMin} onChange={handleChange} />
            <InputGroup label="Maximum (High Alert)" name="humidityMax" value={localSettings.humidityMax} onChange={handleChange} />
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '20px' }}>MQ3 Alcohol Index (Driver)</h2>
          <div className="grid grid-2 gap-16">
            <InputGroup label="Suspicious Threshold" name="mq3Suspicious" value={localSettings.mq3Suspicious} onChange={handleChange} />
            <InputGroup label="High Risk Threshold" name="mq3HighRisk" value={localSettings.mq3HighRisk} onChange={handleChange} />
            <InputGroup label="Critical Threshold" name="mq3Critical" value={localSettings.mq3Critical} onChange={handleChange} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '16px' }}>Note: MQ3 readings are inverted (lower value = higher gas concentration).</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '20px' }}>MQ6 Gas Index (Container)</h2>
          <div className="grid grid-2 gap-16">
            <InputGroup label="Elevated Threshold" name="mq6Elevated" value={localSettings.mq6Elevated} onChange={handleChange} />
            <InputGroup label="Warning Threshold" name="mq6Warning" value={localSettings.mq6Warning} onChange={handleChange} />
            <InputGroup label="Critical Threshold" name="mq6Critical" value={localSettings.mq6Critical} onChange={handleChange} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '16px' }}>Note: MQ6 readings are direct (higher value = higher gas concentration).</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: '20px' }}>Vehicle & Power</h2>
          <div className="grid grid-2 gap-16">
            <InputGroup label="Overspeed Limit (km/h)" name="overspeedThreshold" value={localSettings.overspeedThreshold} onChange={handleChange} />
            <InputGroup label="Battery Warning (%)" name="batteryWarning" value={localSettings.batteryWarning} onChange={handleChange} />
            <InputGroup label="Solar Warning (V)" name="solarWarning" value={localSettings.solarWarning} onChange={handleChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

const InputGroup = ({ label, name, value, onChange }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
      {label}
    </label>
    <input 
      type="number" 
      name={name} 
      value={value} 
      onChange={onChange} 
      className="form-input" 
    />
  </div>
);
