import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, Route, User, Loader, AlertCircle, Save, MapPin, CheckSquare, List, Coffee, PowerOff, Truck } from 'lucide-react';
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
  const [updating, setUpdating] = useState(false);

  const fetchTrip = () => {
    setLoading(true);
    driverPortalService.getCurrentTrip()
      .then(res => {
        if (res.success) setTrip(res.data);
      })
      .catch(err => setError(err.response?.data?.message || err.message || 'Failed to load trip'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrip();
  }, []);

  const handleUpdateTrip = async (newStatus, confirmMessage) => {
    if (updating) return;
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    
    try {
      setUpdating(true);
      const res = await driverPortalService.updateTripStatus(trip.shipmentId, newStatus);
      if (res.success) {
        setTrip(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to update trip status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingState message="Loading current trip details..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 className="page-title">My Trip</h1>
      <p className="page-subtitle mb-24">Manage your current active shipment</p>
      
      {!trip ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <Route size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
          <h3>No Active Trip</h3>
          <p>You currently do not have an active trip assigned.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Trip {trip.shipmentId}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Vehicle / Container: {trip.containerId}</div>
            </div>
            <div style={{ 
              background: trip.status === 'active' ? 'var(--success-bg)' : trip.status === 'delivered' ? 'var(--info-bg)' : 'var(--warning-bg)', 
              color: trip.status === 'active' ? 'var(--success)' : trip.status === 'delivered' ? 'var(--info)' : 'var(--warning)', 
              padding: '8px 16px', borderRadius: '16px', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase' 
            }}>
              {trip.status === 'active' ? '🟢 IN TRANSIT' : trip.status === 'delivered' ? '🔵 COMPLETED' : '🟡 ASSIGNED'}
            </div>
          </div>
          
          <div className="grid grid-2 gap-16 mb-24">
            <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '8px' }}><MapPin size={18} /> Origin</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{trip.origin}</div>
              {trip.startTime && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Departed: {new Date(trip.startTime).toLocaleString()}</div>}
            </div>
            <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--info)', marginBottom: '8px' }}><MapPin size={18} /> Destination</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{trip.destination}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                 {trip.status === 'delivered' ? `Arrived: ${new Date(trip.actualArrival).toLocaleString()}` : `ETA: ${trip.estimatedArrival ? new Date(trip.estimatedArrival).toLocaleString() : '--'}`}
              </div>
            </div>
          </div>

          <div style={{ padding: '24px', background: 'var(--bg-hover)', borderRadius: '12px', textAlign: 'center' }}>
             <h3 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Trip Actions</h3>
             
             {trip.status === 'scheduled' && (
                <button 
                  className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.125rem' }} 
                  onClick={() => handleUpdateTrip('active', 'Start this trip? Make sure you have completed vehicle inspections.')}
                  disabled={updating}
                >
                   {updating ? 'Updating...' : 'Start Trip'}
                </button>
             )}
             
             {trip.status === 'active' && (
                <button 
                  className="btn" style={{ padding: '16px 32px', fontSize: '1.125rem', background: 'var(--info)', color: 'white' }} 
                  onClick={() => handleUpdateTrip('delivered', 'Are you sure you want to mark this trip as completed/arrived?')}
                  disabled={updating}
                >
                   {updating ? 'Updating...' : 'Complete Trip (Mark Arrived)'}
                </button>
             )}

             {trip.status === 'delivered' && (
                <div style={{ color: 'var(--info)', fontWeight: 600, fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                   <CheckCircle size={24} /> Trip successfully completed
                </div>
             )}
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
    <div style={{ paddingBottom: '40px' }}>
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
          
          <div className="form-group mb-16">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Full Name</label>
            <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="form-group mb-16">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Phone Number</label>
            <input type="tel" className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
          </div>
          <div className="form-group mb-16">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
            <input type="email" className="form-input" value={profile.email} disabled style={{ background: 'var(--bg-hover)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Email cannot be changed here.</span>
          </div>
          <div className="form-group mb-24">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>License Number</label>
            <input type="text" className="form-input" value={profile.licenseNumber} disabled style={{ background: 'var(--bg-hover)' }} />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
            {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />} 
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
  
  // Daily Summary Stats
  const [summary, setSummary] = useState({ DRIVING: 0, ON_DUTY: 0, BREAK: 0, OFF_DUTY: 0 });

  useEffect(() => {
    driverPortalService.getLogbook()
      .then(res => {
        if (res.success) {
           setLogs(res.data);
           
           // Calculate today's summary
           const today = new Date();
           today.setHours(0,0,0,0);
           
           const newSummary = { DRIVING: 0, ON_DUTY: 0, BREAK: 0, OFF_DUTY: 0 };
           res.data.forEach(log => {
              const logStart = new Date(log.startTime);
              if (logStart >= today && log.duration && newSummary[log.eventType] !== undefined) {
                 newSummary[log.eventType] += log.duration;
              }
           });
           setSummary(newSummary);
        }
      })
      .catch(err => setError(err.response?.data?.message || err.message || 'Failed to load logbook'))
      .finally(() => setLoading(false));
  }, []);

  const formatDuration = (mins) => {
    if (!mins) return '0h 0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'DRIVING': return <Truck size={18} color="var(--success)" />;
      case 'ON_DUTY': return <CheckSquare size={18} color="var(--info)" />;
      case 'BREAK': return <Coffee size={18} color="var(--warning)" />;
      case 'OFF_DUTY': return <PowerOff size={18} color="var(--text-tertiary)" />;
      default: return <List size={18} color="var(--primary)" />;
    }
  };

  if (loading) return <LoadingState message="Loading electronic logbook..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 className="page-title">Electronic Logbook</h1>
      <p className="page-subtitle mb-24">Hours of Service (HOS) and duty status records</p>

      {/* Today's Summary */}
      <div className="card mb-24" style={{ padding: '24px' }}>
         <h2 style={{ fontSize: '1.125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <Clock size={20} color="var(--primary)" /> Today's Summary
         </h2>
         <div className="grid grid-4 gap-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            <div style={{ background: 'var(--success-bg)', padding: '16px', borderRadius: '12px' }}>
               <div style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600, marginBottom: '4px' }}>Driving</div>
               <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>{formatDuration(summary.DRIVING)}</div>
            </div>
            <div style={{ background: 'var(--info-bg)', padding: '16px', borderRadius: '12px' }}>
               <div style={{ fontSize: '0.875rem', color: 'var(--info)', fontWeight: 600, marginBottom: '4px' }}>On Duty</div>
               <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--info)' }}>{formatDuration(summary.ON_DUTY)}</div>
            </div>
            <div style={{ background: 'var(--warning-bg)', padding: '16px', borderRadius: '12px' }}>
               <div style={{ fontSize: '0.875rem', color: 'var(--warning)', fontWeight: 600, marginBottom: '4px' }}>Break</div>
               <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--warning)' }}>{formatDuration(summary.BREAK)}</div>
            </div>
            <div style={{ background: 'var(--bg-hover)', padding: '16px', borderRadius: '12px' }}>
               <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Off Duty</div>
               <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatDuration(summary.OFF_DUTY)}</div>
            </div>
         </div>
      </div>

      <h2 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>Activity History</h2>
      {logs.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <List size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
          <h3>No Records Found</h3>
          <p>Your duty status history will appear here.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {logs.map((entry, idx) => (
            <div key={entry._id} style={{ 
              padding: '20px', 
              borderBottom: idx < logs.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', gap: '16px', alignItems: 'center'
            }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', width: '70px', flexShrink: 0 }}>
                {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getLogIcon(entry.eventType)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {entry.eventType.replace('_', ' ')}
                </div>
                {entry.endTime && (
                   <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                     Ended at: {new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Duration: <strong>{formatDuration(entry.duration)}</strong>
                   </div>
                )}
                {!entry.endTime && (
                   <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                     CURRENT STATUS
                   </div>
                )}
                {entry.tripId && (
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                     Trip: {entry.tripId}
                   </div>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                {new Date(entry.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
