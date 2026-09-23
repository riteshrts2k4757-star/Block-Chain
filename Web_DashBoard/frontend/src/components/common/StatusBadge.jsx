import React from 'react';

export function StatusBadge({ status, size = 'sm' }) {
  const styles = {
    'online': { bg: '#065F46', color: '#34D399', label: 'Online' },
    'connected': { bg: '#065F46', color: '#34D399', label: 'Connected' },
    'active': { bg: '#065F46', color: '#34D399', label: 'Active' },
    'live': { bg: '#065F46', color: '#34D399', label: 'Live' },
    'offline': { bg: '#7F1D1D', color: '#FCA5A5', label: 'Offline' },
    'disconnected': { bg: '#7F1D1D', color: '#FCA5A5', label: 'Disconnected' },
    'error': { bg: '#7F1D1D', color: '#FCA5A5', label: 'Error' },
    'warning': { bg: '#78350F', color: '#FCD34D', label: 'Warning' },
    'simulated': { bg: '#713F12', color: '#FDE047', label: 'Simulated' },
    'en-route': { bg: '#1E3A5F', color: '#93C5FD', label: 'En Route' },
    'completed': { bg: '#1C1917', color: '#A8A29E', label: 'Completed' },
    'tampered': { bg: '#7F1D1D', color: '#FCA5A5', label: 'Tampered' },
  };
  const s = styles[status] || styles.offline;
  const padding = size === 'lg' ? '6px 14px' : '3px 10px';
  const fontSize = size === 'lg' ? '0.8125rem' : '0.6875rem';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding, fontSize, fontWeight: 600, borderRadius: 20,
      background: s.bg, color: s.color, letterSpacing: '0.02em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
      {s.label}
    </span>
  );
}

export function DataSourceIndicator({ source }) {
  const isLive = source === 'LIVE_HARDWARE';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
      background: isLive ? 'rgba(16,185,129,0.15)' : 'rgba(250,204,21,0.15)',
      color: isLive ? '#10B981' : '#FBBF24',
      border: `1px solid ${isLive ? 'rgba(16,185,129,0.3)' : 'rgba(250,204,21,0.3)'}`,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: isLive ? '#10B981' : '#FBBF24',
        animation: 'pulse 2s ease-in-out infinite',
        boxShadow: `0 0 8px ${isLive ? '#10B981' : '#FBBF24'}`,
      }} />
      {isLive ? '🟢 LIVE HARDWARE' : '🟡 SIMULATION'}
    </div>
  );
}

export function LiveIndicator({ active = true }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%',
      background: active ? '#10B981' : '#EF4444',
      display: 'inline-block',
      animation: active ? 'pulse 2s ease-in-out infinite' : 'none',
      boxShadow: active ? '0 0 8px #10B981' : '0 0 4px #EF4444',
    }} />
  );
}

export function InfoTooltip({ text }) {
  const [show, setShow] = React.useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', cursor: 'help' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span style={{
        width: 16, height: 16, borderRadius: '50%', fontSize: '0.625rem',
        background: 'rgba(148,163,184,0.2)', color: '#94A3B8',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700,
      }}>i</span>
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: '#1E293B', color: '#E2E8F0', padding: '8px 12px', borderRadius: 8,
          fontSize: '0.6875rem', lineHeight: 1.5, width: 240, zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', marginBottom: 6,
          pointerEvents: 'none',
        }}>
          {text}
        </div>
      )}
    </span>
  );
}
