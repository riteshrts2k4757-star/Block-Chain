import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, Route, User, Loader, AlertCircle, Save } from 'lucide-react';
import { driverPortalService } from '../../services/driverPortal';

const LoadingState = ({ message }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
    <Loader size={40} className="animate-spin mb-16" />
    <p>{message}</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--danger)', border: '1px solid var(--danger-border)', background: 'var(--danger-bg)' }}>
    <AlertCircle size={40} style={{ margin: '0 auto 16px auto' }} />
    <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Error</h2>
    <p>{message}</p>
  </div>
);

export const DriverTrip = () => {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    driverPortalService.getCurrentTrip()
      .then(res => {
        if (res.success) setTrip(res.data);
      })
      .catch(err => setError(err.response?.data?.message || err.message || 'Failed to load trip'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading current trip details..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="page-title">Current Trip</h1>
      <p className="page-subtitle mb-24">Navigation and route details</p>
      
      {!trip ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <Route size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
          <h3>No Active Trip</h3>
          <p>You currently do not have an active trip assigned.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Trip {trip.shipmentId}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Container: {trip.containerId}</div>
            </div>
            <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '6px 12px', borderRadius: '16px', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {trip.status}
            </div>
          </div>
          
          <div className="grid grid-2 gap-16">
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Origin</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{trip.origin}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Destination</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{trip.destination}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Start Time</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{trip.startTime ? new Date(trip.startTime).toLocaleString() : 'Not started'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Estimated Arrival</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{trip.estimatedArrival ? new Date(trip.estimatedArrival).toLocaleString() : 'Calculating...'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DriverProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '' });

  useEffect(() => {
    driverPortalService.getProfile()
      .then(res => {
        if (res.success) {
          setProfile(res.data);
          setFormData({ name: res.data.name, phone: res.data.phone });
        }
      })
      .catch(err => setError(err.response?.data?.message || err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setError(null);
    try {
      const res = await driverPortalService.updateProfile(formData);
      if (res.success) {
        setSuccessMsg('Profile updated successfully.');
        setProfile({ ...profile, ...formData });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading your profile..." />;
  
  return (
    <div>
      <h1 className="page-title">My Profile</h1>
      <p className="page-subtitle mb-24">Driver details and vehicle assignment</p>
      
      {error && <div style={{ color: 'var(--danger)', background: 'var(--danger-bg)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
      {successMsg && <div style={{ color: 'var(--success)', background: 'var(--success-bg)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{successMsg}</div>}
      
      {profile && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
              {profile.name?.charAt(0) || <User />}
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{profile.name}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Status: {profile.status}</div>
            </div>
          </div>
          
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="input" value={profile.email} disabled style={{ background: 'var(--bg-hover)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Email cannot be changed here.</span>
          </div>
          <div className="form-group">
            <label>License Number</label>
            <input type="text" className="input" value={profile.licenseNumber} disabled style={{ background: 'var(--bg-hover)' }} />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} 
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
};

export const DriverLogbook = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    driverPortalService.getLogbook()
      .then(res => {
        if (res.success) setLogs(res.data);
      })
      .catch(err => setError(err.response?.data?.message || err.message || 'Failed to load logbook'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading logbook history..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="page-title">My Logbook</h1>
      <p className="page-subtitle mb-24">Hours of Service (HOS) and activity history</p>

      {logs.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <Clock size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
          <h3>No Trip History</h3>
          <p>You have no recorded logbook entries yet.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {logs.map((entry, idx) => (
            <div key={entry._id} style={{ 
              padding: '16px 20px', 
              borderBottom: idx < logs.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', gap: '16px', alignItems: 'flex-start'
            }}>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '4px', width: '65px', flexShrink: 0 }}>
                {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ color: entry.eventType === 'checkpoint' ? 'var(--success)' : 'var(--primary)', marginTop: '2px' }}>
                {entry.eventType === 'checkpoint' ? <CheckCircle size={20} /> : <Clock size={20} />}
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {entry.eventType}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Trip: {entry.tripId} {entry.duration ? ` • ${entry.duration} mins` : ''}
                </div>
                {entry.notes && <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '4px', fontStyle: 'italic' }}>"{entry.notes}"</div>}
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {new Date(entry.startTime).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
