import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Save, Edit2, Trash2, CheckCircle, Package, Thermometer, Droplets, Activity } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const CATEGORIES = [
  { id: 'deep_frozen', label: 'Deep Frozen', tempMin: -25, tempMax: -18, desc: 'Ice cream, frozen food' },
  { id: 'frozen', label: 'Frozen', tempMin: -18, tempMax: -5, desc: 'Frozen meat, vegetables' },
  { id: 'chilled', label: 'Chilled', tempMin: 2, tempMax: 8, desc: 'Vaccines, dairy, medicines' },
  { id: 'cool', label: 'Cool / Refrigerated', tempMin: 2, tempMax: 10, desc: 'Fruits, beverages' },
  { id: 'normal', label: 'Normal', tempMin: 15, tempMax: 30, desc: 'General cargo' },
  { id: 'warm', label: 'Warm', tempMin: 30, tempMax: 40, desc: 'Industrial materials' },
  { id: 'hot', label: 'Hot', tempMin: 40, tempMax: 60, desc: 'Hot materials' },
  { id: 'extra_hot', label: 'Extra Hot', tempMin: 60, tempMax: 80, desc: 'Heat-tolerant materials' },
  { id: 'custom', label: 'Custom', tempMin: 0, tempMax: 0, desc: 'Manually configure limits' }
];

const HUMIDITY_PROFILES = [
  { id: 'very_dry', label: 'Very Dry', min: 10, max: 30 },
  { id: 'dry', label: 'Dry', min: 30, max: 45 },
  { id: 'normal', label: 'Normal', min: 45, max: 65 },
  { id: 'humid', label: 'Humid', min: 65, max: 80 },
  { id: 'very_humid', label: 'Very Humid', min: 80, max: 95 },
  { id: 'custom', label: 'Custom', min: 0, max: 100 }
];

const HANDLING_TYPES = [
  'General Cargo', 'Fragile', 'Vibration Sensitive', 'Shock Sensitive', 'Liquid', 'Electronic Equipment', 'Glass / Ceramic', 'Machinery', 'Custom'
];

export default function LoadConfiguration() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', category: 'normal', tempMin: 15, tempMax: 30,
    humidityMin: 45, humidityMax: 65, handlingType: 'General Cargo'
  });
  
  const [isEditingId, setIsEditingId] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/load-profiles`);
      const result = await res.json();
      if (result.success) setProfiles(result.data);
    } catch (err) {
      console.error(err);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const cat = CATEGORIES.find(c => c.id === e.target.value);
    if (cat && cat.id !== 'custom') {
      setFormData({ ...formData, category: cat.id, tempMin: cat.tempMin, tempMax: cat.tempMax });
    } else {
      setFormData({ ...formData, category: e.target.value });
    }
  };

  const handleHumidityChange = (e) => {
    const prof = HUMIDITY_PROFILES.find(p => p.id === e.target.value);
    if (prof && prof.id !== 'custom') {
      setFormData({ ...formData, humidityMin: prof.min, humidityMax: prof.max });
    }
  };

  const validate = () => {
    if (!formData.name) return 'Product name is required';
    if (formData.tempMin >= formData.tempMax) return 'Max temperature must be greater than Min temperature';
    if (formData.humidityMin >= formData.humidityMax) return 'Max humidity must be greater than Min humidity';
    if (formData.humidityMin < 0 || formData.humidityMax > 100) return 'Humidity must be between 0 and 100';
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');

    try {
      const url = isEditingId ? `${API_BASE_URL}/api/load-profiles/${isEditingId}` : `${API_BASE_URL}/api/load-profiles`;
      const method = isEditingId ? 'PUT' : 'POST';
      
      const payload = { ...formData };
      if (!isEditingId && profiles.length === 0) {
        payload.isActive = true; // Auto-activate the first profile
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        fetchProfiles();
        setStep(1);
        setIsEditingId(null);
        setFormData({ name: '', category: 'normal', tempMin: 15, tempMax: 30, humidityMin: 45, humidityMax: 65, handlingType: 'General Cargo' });
      } else {
        setError(result.error?.message || 'Failed to save');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleSetActive = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/load-profiles/${id}/active`, { method: 'PUT' });
      const result = await res.json();
      if (result.success) {
        // Successfully activated, redirect to live testing
        navigate('/admin/live-testing');
      }
    } catch (err) {
      console.error('Failed to set active load:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await fetch(`${API_BASE_URL}/api/load-profiles/${id}`, { method: 'DELETE' });
        fetchProfiles();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const startEdit = (profile) => {
    setIsEditingId(profile._id);
    setFormData({
      name: profile.name, category: profile.category, tempMin: profile.tempMin, tempMax: profile.tempMax,
      humidityMin: profile.humidityMin, humidityMax: profile.humidityMax, handlingType: profile.handlingType
    });
    setStep(1);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Load Configuration</h1>
        <p className="page-subtitle">Configure monitoring boundaries based on product types</p>
      </div>

      <div className="grid grid-2 gap-24">
        {/* Wizard Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="var(--primary)" />
            {isEditingId ? 'Edit Configuration' : 'Create New Profile'}
          </h2>

          {error && (
            <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', borderRadius: '6px', marginBottom: '16px' }}>
              ⚠ {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Step 1: What are you transporting?</h3>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Product / Load Name</label>
              <input 
                type="text" className="form-input" placeholder="e.g. Fresh Vegetables" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => setStep(2)}>Next</button>
            </div>
          )}

          {/* Step 2 & 3 */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Step 2 & 3: Temperature Configuration</h3>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Select Load Category (Preset)</label>
              <select className="form-input" value={formData.category} onChange={handleCategoryChange} style={{ marginBottom: '16px', padding: '10px' }}>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label} ({c.id !== 'custom' ? `${c.tempMin}°C to ${c.tempMax}°C` : 'Manual'}) - {c.desc}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Minimum (°C)</label>
                  <input type="number" className="form-input" value={formData.tempMin} onChange={e => setFormData({...formData, tempMin: Number(e.target.value)})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Maximum (°C)</label>
                  <input type="number" className="form-input" value={formData.tempMax} onChange={e => setFormData({...formData, tempMax: Number(e.target.value)})} />
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '12px' }}>
                Note: These ranges are monitoring thresholds. Always use manufacturer guidelines for actual storage conditions.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Next</button>
              </div>
            </div>
          )}

          {/* Step 4 & 5 */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Step 4 & 5: Environment & Handling</h3>
              
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Humidity Preset</label>
              <select className="form-input" onChange={handleHumidityChange} style={{ marginBottom: '16px', padding: '10px' }}>
                {HUMIDITY_PROFILES.map(h => <option key={h.id} value={h.id}>{h.label} ({h.min}% - {h.max}%)</option>)}
              </select>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Min Humidity (%)</label>
                  <input type="number" className="form-input" value={formData.humidityMin} onChange={e => setFormData({...formData, humidityMin: Number(e.target.value)})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Max Humidity (%)</label>
                  <input type="number" className="form-input" value={formData.humidityMax} onChange={e => setFormData({...formData, humidityMax: Number(e.target.value)})} />
                </div>
              </div>

              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Load Handling Type</label>
              <select className="form-input" value={formData.handlingType} onChange={e => setFormData({...formData, handlingType: e.target.value})} style={{ padding: '10px' }}>
                {HANDLING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(4)}>Review</button>
              </div>
            </div>
          )}

          {/* Step 6 */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Step 6: Review & Save</h3>
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--primary)' }}>Your Monitoring Profile</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
                  <div><strong>Product:</strong> {formData.name}</div>
                  <div><strong>Category:</strong> {CATEGORIES.find(c => c.id === formData.category)?.label || formData.category}</div>
                  <div><strong>Temperature:</strong> {formData.tempMin}°C to {formData.tempMax}°C</div>
                  <div><strong>Humidity:</strong> {formData.humidityMin}% to {formData.humidityMax}%</div>
                  <div><strong>Handling:</strong> {formData.handlingType}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="btn btn-outline" onClick={() => setStep(3)}>Back</button>
                <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} /> Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Saved Profiles */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="var(--primary)" />
            Saved Profiles
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {profiles.length === 0 && !loading && <div style={{ color: 'var(--text-tertiary)' }}>No profiles saved yet.</div>}
            {profiles.map(p => (
              <div key={p._id} style={{ 
                border: `1px solid ${p.isActive ? 'var(--primary)' : 'var(--border)'}`, 
                borderRadius: '8px', padding: '16px',
                background: p.isActive ? 'var(--primary-light)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => {
                if (p.isActive) {
                  navigate('/admin/live-testing');
                }
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {p.name}
                      {p.isActive && <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>ACTIVE</span>}
                    </h4>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{p.category} | {p.handlingType}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                    {p.isActive ? (
                      <button onClick={() => navigate('/admin/live-testing')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>View Dashboard</button>
                    ) : (
                      <button onClick={() => handleSetActive(p._id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Use Profile</button>
                    )}
                    <button onClick={() => startEdit(p)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Thermometer size={14} color="var(--warning)" /> {p.tempMin}°C to {p.tempMax}°C</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Droplets size={14} color="var(--info)" /> {p.humidityMin}% to {p.humidityMax}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
