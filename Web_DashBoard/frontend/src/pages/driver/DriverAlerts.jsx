import React from 'react';
import { useAlerts } from '../../context/AlertContext';
import { AlertCard } from '../../components/common/AlertCard';
import { BellOff } from 'lucide-react';

export default function DriverAlerts() {
  const { driverAlerts, acknowledgeAlert } = useAlerts();

  return (
    <div>
      <h1 className="page-title mb-24">My Alerts</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {driverAlerts.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <BellOff size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
            <p>No active alerts</p>
          </div>
        ) : (
          driverAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} onAcknowledge={acknowledgeAlert} />
          ))
        )}
      </div>
    </div>
  );
}
