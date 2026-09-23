import React from 'react';
import { AlertTriangle, Info, ShieldAlert, Check } from 'lucide-react';

export function AlertCard({ alert, onAcknowledge }) {
  const { severity, title, description, device, truck, container, timestamp, acknowledged } = alert;
  
  let Icon = Info;
  let bg = 'var(--info-bg)';
  let border = 'var(--info-border)';
  let color = 'var(--info)';
  
  if (severity === 'CRITICAL') {
    Icon = ShieldAlert;
    bg = 'var(--danger-bg)';
    border = 'var(--danger-border)';
    color = 'var(--danger)';
  } else if (severity === 'WARNING') {
    Icon = AlertTriangle;
    bg = 'var(--warning-bg)';
    border = 'var(--warning-border)';
    color = 'var(--warning)';
  }

  const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      background: acknowledged ? 'var(--bg-main)' : bg,
      border: `1px solid ${acknowledged ? 'var(--border)' : border}`,
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      display: 'flex',
      gap: '12px',
      opacity: acknowledged ? 0.7 : 1,
      transition: 'var(--transition-fast)',
    }}>
      <div style={{ color: acknowledged ? 'var(--text-tertiary)' : color, flexShrink: 0, marginTop: '2px' }}>
        <Icon size={20} />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{timeStr}</span>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
          {description}
        </p>
        
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          {truck && <span>🚛 {truck}</span>}
          {container && <span>📦 {container}</span>}
          {device && <span>💻 {device}</span>}
        </div>
      </div>
      
      {!acknowledged && onAcknowledge && (
        <button 
          onClick={() => onAcknowledge(alert.id)}
          style={{
            background: 'transparent',
            border: `1px solid ${color}`,
            color,
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            height: 'fit-content',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Check size={14} /> Acknowledge
        </button>
      )}
    </div>
  );
}
