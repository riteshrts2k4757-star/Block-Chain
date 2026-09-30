import React from 'react';
import {
  ShieldCheck, ShieldAlert, Database, ArrowDown,
  Wifi, WifiOff, RotateCcw, AlertTriangle, Radio, Clock
} from 'lucide-react';

/**
 * Transmission status badge
 */
function TransmissionBadge({ status, offlineReplay, tamper }) {
  if (tamper) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        background: 'var(--danger-bg)', color: 'var(--danger)',
        border: '1px solid var(--danger-border)',
        padding: '3px 10px', borderRadius: '12px', fontSize: '0.6875rem', fontWeight: 700,
      }}>
        <AlertTriangle size={12} /> TAMPER DETECTED
      </span>
    );
  }

  const configs = {
    LIVE: { bg: 'var(--success-bg)', color: 'var(--success)', border: 'var(--success-border)', icon: <Wifi size={12} />, label: 'LIVE' },
    OFFLINE_QUEUED: { bg: 'var(--warning-bg)', color: 'var(--warning)', border: 'var(--warning-border)', icon: <WifiOff size={12} />, label: 'OFFLINE QUEUED' },
    OFFLINE_REPLAYED: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', border: 'rgba(139, 92, 246, 0.3)', icon: <RotateCcw size={12} />, label: 'OFFLINE REPLAYED' },
    VERIFIED: { bg: 'var(--success-bg)', color: 'var(--success)', border: 'var(--success-border)', icon: <ShieldCheck size={12} />, label: 'VERIFIED' },
    INTEGRITY_ERROR: { bg: 'var(--danger-bg)', color: 'var(--danger)', border: 'var(--danger-border)', icon: <ShieldAlert size={12} />, label: 'INTEGRITY ERROR' },
  };

  const cfg = configs[status] || configs.LIVE;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      padding: '3px 10px', borderRadius: '12px', fontSize: '0.6875rem', fontWeight: 700,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

/**
 * Verification status badge
 */
function VerificationBadge({ status }) {
  const configs = {
    PENDING: { bg: 'var(--warning-bg)', color: 'var(--warning)', border: 'var(--warning-border)', label: 'PENDING' },
    VERIFIED: { bg: 'var(--success-bg)', color: 'var(--success)', border: 'var(--success-border)', label: 'SHA-256 VERIFIED' },
    HASH_MISMATCH: { bg: 'var(--danger-bg)', color: 'var(--danger)', border: 'var(--danger-border)', label: 'HASH MISMATCH' },
    CHAIN_BREAK: { bg: 'var(--danger-bg)', color: 'var(--danger)', border: 'var(--danger-border)', label: 'CHAIN BREAK' },
    INTEGRITY_ERROR: { bg: 'var(--danger-bg)', color: 'var(--danger)', border: 'var(--danger-border)', label: 'INTEGRITY ERROR' },
  };

  const cfg = configs[status] || configs.PENDING;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      padding: '3px 10px', borderRadius: '12px', fontSize: '0.6875rem', fontWeight: 700,
    }}>
      {status === 'VERIFIED' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
      {cfg.label}
    </span>
  );
}

/**
 * Single hash chain block — displays full integrity info per requirements
 */
export function HashChainBlock({ block, isLast }) {
  const {
    blockNumber, sequence, timestamp, device,
    temperature, humidity, mq6, battery, solar, gps, tamper,
    rawPayload, dataHash, previousHash, blockHash,
    transmissionStatus, offlineReplay, verificationStatus,
    isDemo,
  } = block;

  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';
  const dateStr = timestamp
    ? new Date(timestamp).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  const isVerified = verificationStatus === 'VERIFIED';
  const isError = verificationStatus === 'HASH_MISMATCH' || verificationStatus === 'INTEGRITY_ERROR' || verificationStatus === 'CHAIN_BREAK';
  const isTampered = tamper === true;

  // Build raw telemetry display string
  const rawDisplay = rawPayload
    ? rawPayload
    : `seq:${sequence} | temperature:${temperature ?? '—'} | humidity:${humidity ?? '—'} | mq6:${mq6 ?? '—'} | battery:${battery ?? '—'} | solar:${solar ?? '—'}`;

  // Determine card border color
  let borderColor = 'var(--border)';
  let bgColor = 'var(--bg-card)';
  if (isTampered) {
    borderColor = 'var(--danger-border)';
    bgColor = 'var(--danger-bg)';
  } else if (isError) {
    borderColor = 'var(--danger-border)';
    bgColor = 'var(--danger-bg)';
  } else if (offlineReplay) {
    borderColor = 'rgba(139, 92, 246, 0.3)';
    bgColor = 'rgba(139, 92, 246, 0.05)';
  } else if (isVerified) {
    borderColor = 'var(--success-border)';
    bgColor = 'var(--success-bg)';
  }

  return (
    <div>
      {/* Block Card */}
      <div className="card" style={{
        padding: '20px',
        border: `1.5px solid ${borderColor}`,
        background: bgColor,
        position: 'relative',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <Database size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>Block #{blockNumber}</span>
              <span style={{
                fontSize: '0.6875rem', background: 'rgba(0,0,0,0.07)', padding: '2px 8px',
                borderRadius: '4px', fontFamily: 'monospace', fontWeight: 600,
              }}>Seq: {sequence}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={12} />
              {device || 'Container ESP32'} • {timeStr}
              {dateStr && <span style={{ color: 'var(--text-tertiary)' }}>({dateStr})</span>}
              <span style={{
                fontSize: '0.625rem', padding: '1px 6px', borderRadius: '8px', fontWeight: 700,
                background: isDemo ? 'rgba(239, 130, 34, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                color: isDemo ? '#d97706' : 'var(--success)', border: `1px solid ${isDemo ? 'rgba(217, 119, 6, 0.3)' : 'var(--success-border)'}`
              }}>
                {isDemo ? 'DEMO' : 'LIVE'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <TransmissionBadge status={transmissionStatus} offlineReplay={offlineReplay} tamper={isTampered} />
            {offlineReplay && !isTampered && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '2px 8px', borderRadius: '10px', fontSize: '0.625rem', fontWeight: 600,
              }}>
                <RotateCcw size={10} /> OFFLINE REPLAY
              </span>
            )}
          </div>
        </div>

        {/* Raw Telemetry */}
        <div style={{
          background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-md)',
          marginBottom: '12px', border: '1px solid var(--border)',
        }}>
          <div style={{
            fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '4px',
            textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
          }}>Raw Telemetry</div>
          <div style={{
            fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)',
            wordBreak: 'break-all', lineHeight: 1.5,
          }}>{rawDisplay}</div>
        </div>

        {/* Tamper State */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
          padding: '8px 12px', borderRadius: 'var(--radius-sm)',
          background: isTampered ? 'var(--danger-bg)' : 'var(--bg-main)',
          border: `1px solid ${isTampered ? 'var(--danger-border)' : 'var(--border)'}`,
        }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 600, minWidth: '60px' }}>Tamper</span>
          <span style={{
            fontSize: '0.75rem', fontWeight: 700,
            color: isTampered ? 'var(--danger)' : 'var(--success)',
          }}>
            {isTampered ? '⚠ DETECTED' : '✓ SECURE'}
          </span>
        </div>

        {/* Hash chain data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <HashRow label="Data Hash" hash={dataHash || '—'} />
          <HashRow label="Previous Hash" hash={previousHash || '—'} />
          <HashRow label="Current Block Hash" hash={blockHash || '—'} highlight />
        </div>

        {/* Verification status */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Integrity</span>
          <VerificationBadge status={verificationStatus} />
        </div>
      </div>

      {/* Chain arrow connector */}
      {!isLast && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '4px 0', color: 'var(--text-tertiary)',
        }}>
          <div style={{ width: '2px', height: '16px', background: 'var(--border)' }} />
          <ArrowDown size={18} />
          <div style={{ width: '2px', height: '16px', background: 'var(--border)' }} />
        </div>
      )}
    </div>
  );
}

const HashRow = ({ label, hash, highlight }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{
      width: '130px', fontSize: '0.6875rem', color: 'var(--text-secondary)',
      fontWeight: highlight ? 700 : 500, flexShrink: 0,
    }}>{label}</div>
    <div style={{
      flex: 1, fontFamily: 'monospace', fontSize: '0.6875rem',
      background: highlight ? 'rgba(0,0,0,0.05)' : 'transparent',
      padding: highlight ? '4px 8px' : 0, borderRadius: '4px',
      border: highlight ? '1px dashed var(--border)' : 'none',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      color: highlight ? 'var(--text-primary)' : 'var(--text-tertiary)',
      letterSpacing: '0.02em',
    }}>
      {hash}
    </div>
  </div>
);

export function HashChainVisualization({ blocks }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '48px 20px',
        color: 'var(--text-tertiary)', fontSize: '0.875rem',
      }}>
        <Database size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
        <div>No telemetry received</div>
        <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
          Blocks will appear here when the Container ESP32 sends telemetry via MQTT
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {blocks.map((block, idx) => (
        <HashChainBlock key={block.sequence || block.blockNumber} block={block} isLast={idx === blocks.length - 1} />
      ))}
    </div>
  );
}

export function DataIntegrityBadge({ verified, label }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: verified ? 'var(--success-bg)' : 'var(--danger-bg)',
      color: verified ? 'var(--success)' : 'var(--danger)',
      border: `1px solid ${verified ? 'var(--success-border)' : 'var(--danger-border)'}`,
      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
    }}>
      {verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
      {label || (verified ? 'VERIFIED' : 'INTEGRITY VIOLATION')}
    </div>
  );
}
