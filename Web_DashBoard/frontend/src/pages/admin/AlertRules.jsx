import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { Save, RefreshCw } from 'lucide-react';

export default function AlertRules() {
  const [settings, setSettings] = useState({ tempMin: 2, tempMax: 8, humidityMin: 60, humidityMax: 80 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      const result = await res.json();
      if (result.success && result.data) {
        setSettings({
          tempMin: result.data.tempMin || 2,
          tempMax: result.data.tempMax || 8,
          humidityMin: result.data.humidityMin || 60,
          humidityMax: result.data.humidityMax || 80
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: Number(e.target.value) });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const result = await res.json();
      if (result.success) {
        setMessage('Alert thresholds updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update thresholds.');
      }
    } catch (err) {
      setMessage('Error updating thresholds.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading Alert Rules...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Alert Thresholds</h1>
          <p className="page-subtitle">Configure fleet-wide boundaries for automated alerts</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={fetchSettings} disabled={saving}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Rules'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: '12px', background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
          {message}
        </div>
      )}

      <div className="grid grid-2 gap-24">
        {/* Temperature Settings */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Temperature Boundaries</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '24px' }}>Alerts will trigger if container temperature goes outside this range.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Minimum Temperature (°C)</label>
              <input type="number" name="tempMin" value={settings.tempMin} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Maximum Temperature (°C)</label>
              <input type="number" name="tempMax" value={settings.tempMax} onChange={handleChange} className="form-input" />
            </div>
          </div>
        </div>

        {/* Humidity Settings */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Humidity Boundaries</h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '24px' }}>Alerts will trigger if container humidity goes outside this range.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Minimum Humidity (%)</label>
              <input type="number" name="humidityMin" value={settings.humidityMin} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Maximum Humidity (%)</label>
              <input type="number" name="humidityMax" value={settings.humidityMax} onChange={handleChange} className="form-input" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
