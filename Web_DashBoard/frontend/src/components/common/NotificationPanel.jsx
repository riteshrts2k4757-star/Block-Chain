import React from 'react';
import { X, Bell, CheckCircle } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { AlertCard } from './AlertCard';

export function NotificationPanel({ isOpen, onClose }) {
  const { activeAlerts, markAllRead, acknowledgeAlert } = useAlerts();

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
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Notifications</h3>
            {activeAlerts.length > 0 && (
              <span style={{ 
                background: 'var(--danger)', color: '#fff', borderRadius: '12px', 
                padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 
              }}>
                {activeAlerts.length}
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
            disabled={activeAlerts.length === 0}
            style={{ 
              background: 'none', border: 'none', color: 'var(--primary)', 
              fontSize: '0.875rem', fontWeight: 500, cursor: activeAlerts.length > 0 ? 'pointer' : 'not-allowed',
              opacity: activeAlerts.length > 0 ? 1 : 0.5,
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            <CheckCircle size={16} /> Mark all as read
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>
              <Bell size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>No new notifications</p>
            </div>
          ) : (
            activeAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onAcknowledge={acknowledgeAlert} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
