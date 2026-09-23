import React from 'react';
import { StatusBadge } from './StatusBadge';

export function TelemetryCard({ title, value, unit, icon: Icon, status, trend }) {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          {Icon && <Icon size={20} />}
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{title}</span>
        </div>
        {status && <StatusBadge status={status.toLowerCase()} />}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {value != null ? value : '--'}
        </span>
        {unit && <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>{unit}</span>}
      </div>

      {trend && (
        <div style={{ 
          marginTop: '12px', 
          fontSize: '0.75rem', 
          color: trend > 0 ? 'var(--success)' : trend < 0 ? 'var(--danger)' : 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
          {Math.abs(trend)}% from last hour
        </div>
      )}
    </div>
  );
}
