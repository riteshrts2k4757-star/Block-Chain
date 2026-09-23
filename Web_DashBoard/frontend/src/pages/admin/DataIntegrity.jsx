import React, { useState, useEffect } from 'react';
import { HashChainVisualization, DataIntegrityBadge } from '../../components/integrity/HashChainBlock';
import { generateHashChain } from '../../data/fleet';
import { Database, ShieldCheck, RefreshCw } from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import { useSimulation } from '../../context/SimulationContext';

export default function DataIntegrity() {
  const [blocks, setBlocks] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const { containerData } = useTelemetry();
  const { tamperActive } = useSimulation();

  useEffect(() => {
    // Generate initial hash chain
    setBlocks(generateHashChain(8));
  }, []);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => setIsVerifying(false), 1500);
  };

  const isVerified = !tamperActive;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Data Integrity</h1>
          <p className="page-subtitle">Cryptographic verification of telemetry records</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <DataIntegrityBadge verified={isVerified} />
          <button className="btn btn-outline" onClick={handleVerify} disabled={isVerifying}>
            <RefreshCw size={16} className={isVerifying ? 'spin' : ''} />
            {isVerifying ? 'Verifying...' : 'Verify Chain'}
          </button>
        </div>
      </div>

      <div className="grid grid-3 gap-24 mb-24">
        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Blockchain Nodes</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>2</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Central DB + Backup Node</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Current Sequence</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{containerData?.sequence || 482}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>FT-CNT-001</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Verified Blocks</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            48,291 <ShieldCheck size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Since 18 Sep 2026</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.125rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} color="var(--primary)" /> Cryptographic Hash Chain
        </h2>
        <HashChainVisualization blocks={blocks} />
      </div>
    </div>
  );
}
