import React from 'react';
import { ShieldCheck, ShieldAlert, Database, ArrowRight } from 'lucide-react';

export function HashChainBlock({ block, isLast }) {
  const { blockNumber, sequence, timestamp, data, dataHash, previousHash, currentHash, device, verified } = block;

  const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
      {/* Block card */}
      <div className="card" style={{ 
        flex: 1, padding: '20px', border: `1px solid ${verified ? 'var(--success-border)' : 'var(--danger-border)'}`,
        background: verified ? 'var(--success-bg)' : 'var(--danger-bg)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Database size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>Block #{blockNumber}</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Seq: {sequence}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{device} • {timeStr}</div>
          </div>
          <div style={{ color: verified ? 'var(--success)' : 'var(--danger)' }}>
            {verified ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Raw Telemetry</div>
          <div style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{data}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <HashRow label="Data Hash" hash={dataHash} />
          <HashRow label="Previous Hash" hash={previousHash} />
          <HashRow label="Current Block Hash" hash={currentHash} highlight />
        </div>
      </div>

      {/* Link to next block */}
      {!isLast && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '60px' }}>
          <div style={{ width: '2px', flex: 1, background: 'var(--border)' }}></div>
          <div style={{ padding: '8px 0', color: 'var(--border)' }}>
            <ArrowRight size={24} />
          </div>
          <div style={{ width: '2px', flex: 1, background: 'var(--border)' }}></div>
        </div>
      )}
    </div>
  );
}

const HashRow = ({ label, hash, highlight }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ width: '120px', fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: highlight ? 700 : 500 }}>{label}</div>
    <div style={{ 
      flex: 1, fontFamily: 'monospace', fontSize: '0.75rem', background: highlight ? 'rgba(0,0,0,0.05)' : 'transparent', 
      padding: highlight ? '4px 8px' : 0, borderRadius: '4px', border: highlight ? '1px dashed var(--border)' : 'none',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      color: highlight ? 'var(--text-primary)' : 'var(--text-tertiary)'
    }}>
      {hash}
    </div>
  </div>
);

export function HashChainVisualization({ blocks }) {
  if (!blocks || blocks.length === 0) return <div>No blocks generated yet.</div>;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {blocks.map((block, idx) => (
        <HashChainBlock key={block.blockNumber} block={block} isLast={idx === blocks.length - 1} />
      ))}
    </div>
  );
}

export function DataIntegrityBadge({ verified }) {
  return (
    <div style={{ 
      display: 'inline-flex', alignItems: 'center', gap: '6px', 
      background: verified ? 'var(--success-bg)' : 'var(--danger-bg)', 
      color: verified ? 'var(--success)' : 'var(--danger)',
      border: `1px solid ${verified ? 'var(--success-border)' : 'var(--danger-border)'}`,
      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 
    }}>
      {verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
      {verified ? 'VERIFIED' : 'INTEGRITY VIOLATION'}
    </div>
  );
}
