import React from 'react';
import { useAlerts } from '../../context/AlertContext';
import { AlertCard } from '../../components/common/AlertCard';
import { BellOff } from 'lucide-react';

export default function Alerts() {
  const { alerts, clearAlerts, acknowledgeAlert } = useAlerts();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">System Alerts</h1>
          <p className="page-subtitle">Complete history of all generated alerts</p>
        </div>
        <button className="btn btn-outline" onClick={clearAlerts} disabled={alerts.length === 0}>
          Clear History
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <BellOff size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
            <p>No alerts recorded</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {alerts.map((alert, index) => (
              <div key={alert.id} style={{ 
                padding: '16px 20px', 
                borderBottom: index < alerts.length - 1 ? '1px solid var(--border)' : 'none',
                background: alert.acknowledged ? 'var(--bg-main)' : 'var(--bg-card)'
              }}>
                <AlertCard alert={alert} onAcknowledge={acknowledgeAlert} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
