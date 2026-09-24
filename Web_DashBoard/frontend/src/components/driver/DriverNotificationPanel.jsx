import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle } from 'lucide-react';
import { AlertCard } from '../common/AlertCard';
import { driverPortalService } from '../../services/driverPortal';

export function DriverNotificationPanel({ isOpen, onClose, onCountUpdate }) {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if (isOpen) {
      driverPortalService.getNotifications().then(res => {
        if (res.success) {
          const filtered = res.data.filter(a => !['alcohol_vapour', 'gas_warning'].includes(a.type.toLowerCase()));
          setNotifications(filtered);
          onCountUpdate?.(filtered.length);
        }
      }).catch(console.error);
    }
  }, [isOpen, onCountUpdate]);
  
  // Initial fetch for count
  useEffect(() => {
    driverPortalService.getNotifications().then(res => {
      if (res.success) {
        const filtered = res.data.filter(a => !['alcohol_vapour', 'gas_warning'].includes(a.type.toLowerCase()));
        setNotifications(filtered);
        onCountUpdate?.(filtered.length);
      }
    }).catch(console.error);
  }, []);

  const acknowledgeAlert = (id) => {
    setNotifications(prev => {
      const next = prev.filter(a => a._id !== id);
      onCountUpdate?.(next.length);
      return next;
    });
  };
  
  const markAllRead = () => {
    setNotifications([]);
    onCountUpdate?.(0);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 90 }} 
        onClick={onClose} 
      />
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '400px',
        maxWidth: '100%',
        background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 200ms ease-out',
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} />
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Driver Notifications</h3>
            {notifications.length > 0 && (
              <span style={{ 
                background: 'var(--danger)', color: '#fff', borderRadius: '12px', 
                padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 
              }}>
                {notifications.length}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={markAllRead}
            disabled={notifications.length === 0}
            style={{ 
              background: 'none', border: 'none', color: 'var(--primary)', 
              fontSize: '0.875rem', fontWeight: 500, cursor: notifications.length > 0 ? 'pointer' : 'not-allowed',
              opacity: notifications.length > 0 ? 1 : 0.5,
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <CheckCircle size={16} /> Mark all as read
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>
              <Bell size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>No new notifications</p>
            </div>
          ) : (
            notifications.map(alert => (
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
                  acknowledged: false
                }} 
                onAcknowledge={acknowledgeAlert} 
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
