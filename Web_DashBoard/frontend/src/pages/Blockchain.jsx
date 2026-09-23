import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { mockBlockchain } from '../mock/data';

const Blockchain = () => {
  const bc = mockBlockchain;
  const isVerified = bc.integrityStatus === 'verified';

  return (
    <div>
      <div className="flex justify-between items-start mb-24">
        <div>
          <h1 className="page-title">Data Integrity</h1>
          <p className="page-subtitle">Cryptographic verification of cold-chain records</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`status-banner ${isVerified ? 'safe' : 'critical'} mb-24`}>
        <div className="status-banner-icon">
          {isVerified ? <CheckCircle size={16} /> : <Shield size={16} />}
        </div>
        <div className="status-banner-text">
          <span className="status-banner-title">
            Integrity Status: {isVerified ? 'VERIFIED' : 'ERROR'}
          </span>
          <span className="status-banner-sub">
            {isVerified
              ? 'All synchronized records have been verified on the blockchain.'
              : 'Some records failed integrity verification.'}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid mb-24">
        <div className="kpi-card">
          <span className="kpi-label">Total Records</span>
          <span className="kpi-value">{bc.totalRecords.toLocaleString()}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Verified</span>
          <span className="kpi-value" style={{ color: 'var(--success)' }}>{bc.verified.toLocaleString()}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pending</span>
          <span className="kpi-value" style={{ color: 'var(--warning)' }}>{bc.pending}</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="card mb-20" style={{ background: 'var(--bg-main)', borderStyle: 'dashed' }}>
        <div className="flex items-start gap-12">
          <Shield size={18} style={{ color: 'var(--text-secondary)', marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 4 }}>How does this work?</div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Every sensor reading is hashed using SHA-256. The hash is anchored to the blockchain
              to provide tamper-proof evidence that the data has not been altered. The raw sensor data
              remains in the database. The blockchain only stores cryptographic proof.
            </p>
          </div>
        </div>
      </div>

      {/* Latest record */}
      <div className="section-title">Latest Verified Record</div>
      <div className="card">
        <div className="grid grid-2 gap-16">
          <RecordField label="Record Number" value="#1042" />
          <RecordField label="Timestamp" value="21 Sep 2026 14:32:18" />
          <RecordField label="Temperature" value="5.8°C" />
          <RecordField label="Humidity" value="82.4%" />
          <RecordField label="Ethylene" value="1.2 ppm" />
          <RecordField label="Verification" value="✓ Verified" color="var(--success)" />
        </div>
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>SHA-256 Hash</div>
          <code style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {bc.latestHash}
          </code>
        </div>
        <div style={{ marginTop: 8, padding: '12px 16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Previous Hash</div>
          <code style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {bc.previousHash}
          </code>
        </div>
      </div>
    </div>
  );
};

const RecordField = ({ label, value, color }) => (
  <div style={{ padding: '6px 0' }}>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</div>
  </div>
);

export default Blockchain;
