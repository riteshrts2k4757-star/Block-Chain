import React, { useEffect, useState } from 'react';
import { AlertCard } from '../../components/common/AlertCard';
import { BellOff, Loader, AlertCircle } from 'lucide-react';
import { driverPortalService } from '../../services/driverPortal';

export default function DriverAlerts() {
  const [driverAlerts, setDriverAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    driverPortalService.getAlerts()
      .then(res => {
        if (res.success) {
          // Filter driver alerts (hide sensitive gas/alcohol alerts like in original context)
          const filtered = res.data.filter(a => !['alcohol_vapour', 'gas_warning'].includes(a.type.toLowerCase()));
          setDriverAlerts(filtered);
        }
      })
      .catch(err => setError(err.response?.data?.message || err.message || 'Failed to load alerts'))
      .finally(() => setLoading(false));
  }, []);

  const acknowledgeAlert = async (id) => {
    try {
      const res = await driverPortalService.acknowledgeAlert(id);
      if (res.success) {
        setDriverAlerts(prev => prev.map(a => a._id === id ? { ...a, acknowledged: true } : a));
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
        <Loader size={40} className="animate-spin mb-16" />
        <p>Loading alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--danger)', border: '1px solid var(--danger-border)', background: 'var(--danger-bg)' }}>
        <AlertCircle size={40} style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const activeAlerts = driverAlerts.filter(a => !a.acknowledged);

  return (
    <div>
      <h1 className="page-title mb-24">My Alerts</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activeAlerts.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <BellOff size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
            <p>No active alerts</p>
          </div>
        ) : (
          activeAlerts.map(alert => (
            <AlertCard 
              key={alert._id} 
              alert={{
                id: alert._id,
                type: alert.type.toLowerCase(),
                severity: alert.severity.toUpperCase(),
                title: alert.type.replace('_', ' '),
                description: alert.message,
                device: alert.deviceId,
                truck: 'My Truck',
                container: alert.containerId,
                timestamp: alert.timestamp,
                status: alert.status,
                acknowledged: alert.acknowledged
              }} 
              onAcknowledge={acknowledgeAlert} 
            />
          ))
        )}
      </div>
    </div>
  );
}
