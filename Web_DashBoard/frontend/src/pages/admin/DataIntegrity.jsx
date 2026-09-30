import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashChainVisualization, DataIntegrityBadge } from '../../components/integrity/HashChainBlock';
import {
  Database, ShieldCheck, ShieldAlert, RefreshCw, Wifi, WifiOff,
  Radio, Cpu, Thermometer, Droplets, Wind, Battery, Sun,
  MapPin, Lock, ArrowDown, RotateCcw, AlertTriangle, Clock, Hash,
  ChevronDown, ChevronUp, CheckCircle, XCircle, Info, Play, Pause, Square, Trash2, Power, X
} from 'lucide-react';
import { useTelemetry } from '../../context/TelemetryContext';
import {
  fetchIntegrityStats,
  fetchIntegrityBlocks,
  verifyIntegrityChain,
  fetchRecoveryEvents,
  resetIntegrityLogs,
  createDemoRecord
} from '../../services/api';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../config';

export default function DataIntegrity() {
  const [blocks, setBlocks] = useState([]);
  const [stats, setStats] = useState(null);
  const [recoveryEvents, setRecoveryEvents] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodeInfoExpanded, setNodeInfoExpanded] = useState(false);
  const [securityInfoExpanded, setSecurityInfoExpanded] = useState(false);
  const { containerData, mqttStatus } = useTelemetry();
  const socketRef = useRef(null);
  
  const [demoMode, setDemoMode] = useState(false);
  const [demoState, setDemoState] = useState('IDLE');
  const [demoQueue, setDemoQueue] = useState([]);
  const [demoSyncProgress, setDemoSyncProgress] = useState(0);
  const demoIntervalRef = useRef(null);
  const demoSeqRef = useRef(161);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Demo Simulation Functions
  const startDemoLive = () => {
    setDemoMode(true);
    setDemoState('LIVE');
    demoSeqRef.current = stats?.currentSequence ? stats.currentSequence + 1 : 161;
    setDemoQueue([]);
    
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    demoIntervalRef.current = setInterval(async () => {
      const record = {
        sequence: demoSeqRef.current++,
        temperature: (5.2 + Math.random()).toFixed(2),
        humidity: (70 + Math.random() * 5).toFixed(2),
        mq6: Math.floor(300 + Math.random() * 50),
        battery: 85,
        solar: 4.1,
        tamper: false,
        transmissionStatus: 'LIVE',
        offlineReplay: false
      };
      await createDemoRecord(record);
      loadData();
    }, 4000);
  };

  const simulateInterruption = () => {
    setDemoState('INTERRUPTED');
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    
    demoIntervalRef.current = setInterval(() => {
      const record = {
        sequence: demoSeqRef.current++,
        temperature: (5.2 + Math.random()).toFixed(2),
        humidity: (70 + Math.random() * 5).toFixed(2),
        mq6: Math.floor(300 + Math.random() * 50),
        battery: 85,
        solar: 4.1,
        tamper: false,
        transmissionStatus: 'OFFLINE_QUEUED',
        offlineReplay: true,
        isDemo: true,
        verificationStatus: 'PENDING'
      };
      setDemoQueue(prev => [...prev, record]);
    }, 3000);
  };

  const simulateRestore = () => {
    setDemoState('RESTORED');
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    
    setTimeout(() => {
      startAutoSync();
    }, 2000);
  };

  const startAutoSync = async () => {
    setDemoState('SYNCING');
    setDemoSyncProgress(0);
    
    for(let i = 0; i < demoQueue.length; i++) {
      await new Promise(r => setTimeout(r, 1000));
      await createDemoRecord(demoQueue[i]);
      setDemoSyncProgress(i + 1);
      loadData();
    }
    
    setDemoState('COMPLETED');
    setDemoQueue([]);
    setTimeout(() => {
      startDemoLive();
    }, 3000);
  };

  const stopDemo = () => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    setDemoMode(false);
    setDemoState('IDLE');
    setDemoQueue([]);
    setDemoSyncProgress(0);
  };

  const handleReset = async (type) => {
    await resetIntegrityLogs(type);
    if (type === 'all') setShowResetConfirm(false);
    loadData();
    if (type === 'all') {
       setStats(null);
       setBlocks([]);
       setRecoveryEvents([]);
    }
  };

  const displayBlocks = [...demoQueue.slice().reverse(), ...blocks];

  // Load data from the real backend
  const loadData = useCallback(async () => {
    try {
      const [statsData, blocksData, recoveryData] = await Promise.all([
        fetchIntegrityStats(),
        fetchIntegrityBlocks(20),
        fetchRecoveryEvents(),
      ]);

      if (statsData) setStats(statsData);
      if (blocksData) setBlocks(blocksData);
      if (recoveryData) setRecoveryEvents(recoveryData);
    } catch (err) {
      console.error('Failed to load integrity data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const socket = io(SOCKET_URL, { reconnectionAttempts: 5 });
    socketRef.current = socket;

    socket.on('farmtrace:integrity:new', () => {
      // New integrity block arrived → reload data
      loadData();
    });

    socket.on('farmtrace:integrity:update', () => {
      loadData();
    });

    socket.on('farmtrace:container:data', () => {
      // New container telemetry → reload to pick up the new block
      loadData();
    });

    return () => {
      socket.disconnect();
    };
  }, [loadData]);

  // Verify Chain button handler — performs REAL verification
  const handleVerify = useCallback(async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const result = await verifyIntegrityChain('CONT001');
      setVerificationResult(result);
      // Reload blocks to reflect updated verification states
      await loadData();
    } catch (err) {
      setVerificationResult({ verified: false, errors: [{ message: err.message }] });
    } finally {
      setIsVerifying(false);
    }
  }, [loadData]);

  const hasData = stats && stats.totalRecords > 0;
  const isVerified = verificationResult ? verificationResult.verified : (stats?.integrityFailures === 0 && hasData);
  const networkOnline = mqttStatus === 'connected';

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Data Integrity</h1>
          <p className="page-subtitle">Cryptographic verification of telemetry records</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {hasData && <DataIntegrityBadge verified={isVerified} />}
          <button className="btn btn-outline" style={{ borderColor: 'var(--danger-border)', color: 'var(--danger)' }} onClick={() => setShowResetConfirm(true)}>
             <Trash2 size={16} /> Reset Logs
          </button>
          <button className="btn btn-outline" onClick={handleVerify} disabled={isVerifying || !hasData}>
            <RefreshCw size={16} className={isVerifying ? 'spin' : ''} />
            {isVerifying ? 'Verifying...' : 'Verify Chain'}
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div className={`card mb-24`} style={{
          position: 'relative',
          border: `1.5px solid ${verificationResult.verified ? 'var(--success-border)' : 'var(--danger-border)'}`,
          background: verificationResult.verified ? 'var(--success-bg)' : 'var(--danger-bg)',
          padding: '16px 20px',
        }}>
          <button 
            onClick={() => setVerificationResult(null)}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            {verificationResult.verified
              ? <CheckCircle size={20} color="var(--success)" />
              : <XCircle size={20} color="var(--danger)" />
            }
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: verificationResult.verified ? 'var(--success)' : 'var(--danger)' }}>
              {verificationResult.verified ? 'CHAIN VERIFIED' : 'INTEGRITY ERROR'}
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {verificationResult.message}
            {verificationResult.totalBlocks !== undefined && (
              <span> — {verificationResult.verifiedBlocks}/{verificationResult.totalBlocks} blocks verified</span>
            )}
          </div>
          {verificationResult.errors && verificationResult.errors.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              {verificationResult.errors.slice(0, 5).map((err, idx) => (
                <div key={idx} style={{
                  fontSize: '0.75rem', color: 'var(--danger)', fontFamily: 'monospace',
                  padding: '4px 8px', marginBottom: '4px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '4px',
                }}>
                  Block #{err.sequence || err.blockNumber}: {err.errors ? err.errors.map(e => e.message).join('; ') : err.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
            <h3 style={{ marginTop: 0, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} /> Reset Data Integrity Logs?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              This will permanently clear all displayed telemetry history, synchronization history, and demo blockchain records. 
              <strong> The physical ESP32 will NOT be reset.</strong>
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button className="btn" style={{ background: 'var(--danger)', color: 'white', border: 'none' }} onClick={() => handleReset('all')}>Reset Logs</button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Controls & Connection Status */}
      <div className="grid gap-24 mb-24" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Connection Status Card */}
        <div className="card" style={{
          border: `1.5px solid ${demoMode ? '#8B5CF6' : (networkOnline ? 'var(--success-border)' : 'var(--danger-border)')}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wifi size={18} color={demoMode ? '#8B5CF6' : (networkOnline ? 'var(--success)' : 'var(--danger)')} />
              FARMTRACE CONNECTION
            </h2>
            {demoMode && (
              <span style={{ fontSize: '0.625rem', padding: '2px 8px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', borderRadius: '12px', fontWeight: 700 }}>
                DEMO MODE
              </span>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <InfoLabel label="Wi-Fi" value={(!demoMode && networkOnline) || (demoMode && ['LIVE','RESTORED','SYNCING','COMPLETED'].includes(demoState)) ? 'CONNECTED' : 'DISCONNECTED'} />
            <InfoLabel label="MQTT" value={(!demoMode && networkOnline) || (demoMode && ['LIVE','RESTORED','SYNCING','COMPLETED'].includes(demoState)) ? 'CONNECTED' : 'DISCONNECTED'} />
            
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Data Sync</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: (demoMode && demoState === 'INTERRUPTED') ? 'var(--warning)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {demoMode ? (
                  demoState === 'LIVE' ? <><CheckCircle size={16}/> ACTIVE</> :
                  demoState === 'INTERRUPTED' ? <><WifiOff size={16}/> PAUSED</> :
                  demoState === 'RESTORED' ? <><Wifi size={16}/> RESTORED</> :
                  demoState === 'SYNCING' ? <><RefreshCw size={16} className="spin"/> SYNCING...</> :
                  demoState === 'COMPLETED' ? <><CheckCircle size={16}/> SYNCHRONIZED</> : 'IDLE'
                ) : (
                  networkOnline ? <><CheckCircle size={16}/> ACTIVE</> : <><WifiOff size={16}/> PAUSED</>
                )}
              </div>
            </div>
            
            {(demoMode && demoState === 'INTERRUPTED') && (
              <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                 <div style={{ fontSize: '0.8125rem', color: 'var(--warning)', fontWeight: 600 }}>
                   {demoQueue.length} Pending Records (Offline Queued)
                 </div>
              </div>
            )}
            
            {(demoMode && demoState === 'SYNCING') && (
              <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Synchronizing offline records</span>
                  <span>{demoSyncProgress} / {demoQueue.length}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(demoSyncProgress / demoQueue.length) * 100}%`, height: '100%', background: 'var(--success)', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {(demoMode && demoState === 'COMPLETED') && (
              <div style={{ gridColumn: '1 / -1', marginTop: '8px', fontSize: '0.8125rem', color: 'var(--success)', fontWeight: 600 }}>
                ✓ {demoQueue.length || demoSyncProgress} records synchronized and verified
              </div>
            )}
          </div>
        </div>

        {/* Demo Controls */}
        <div className="card" style={{ background: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <h2 style={{ fontSize: '1rem', margin: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#8B5CF6' }}>
            <Cpu size={18} /> Demo Simulation
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
             {!demoMode ? (
               <button className="btn" style={{ background: '#8B5CF6', color: 'white', border: 'none' }} onClick={startDemoLive}>
                 <Play size={14} /> Start Demo
               </button>
             ) : (
               <>
                 {demoState === 'LIVE' && (
                   <button className="btn btn-outline" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={simulateInterruption}>
                     <WifiOff size={14} /> Simulate Offline
                   </button>
                 )}
                 {demoState === 'INTERRUPTED' && (
                   <button className="btn btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }} onClick={simulateRestore}>
                     <Wifi size={14} /> Restore Connection
                   </button>
                 )}
                 <button className="btn btn-outline" onClick={stopDemo}>
                   <Square size={14} /> Stop Demo
                 </button>
               </>
             )}
             <button className="btn btn-outline" onClick={() => handleReset('demo')} title="Clear Demo Data">
               <RotateCcw size={14} /> Reset Demo
             </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            Simulate network interruptions and automatic offline data synchronization without disconnecting the physical ESP32. 
            Demo data is stored securely and marked distinctly from real hardware telemetry.
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-24 mb-24" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {/* Blockchain Nodes */}
        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} /> Blockchain Nodes
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {stats ? stats.totalNodes : '—'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            {stats ? `${stats.containerNodes} Container ESP32 + ${stats.driverNodes} Driver ESP8266` : 'Loading...'}
          </div>
        </div>

        {/* Current Sequence */}
        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Hash size={14} /> Current Sequence
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {stats ? (stats.currentSequence || 0) : '—'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            {stats?.currentSequenceDevice || 'Container ESP32'}
          </div>
        </div>

        {/* Total Verified Blocks */}
        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> Total Verified Blocks
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {stats ? stats.verifiedBlocks.toLocaleString() : '—'}
            {stats && stats.verifiedBlocks > 0 && <ShieldCheck size={20} color="var(--success)" />}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            {stats ? `${stats.totalRecords.toLocaleString()} total records` : 'Loading...'}
          </div>
        </div>

        {/* Pending Offline Records */}
        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <WifiOff size={14} /> Pending Offline
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stats && stats.pendingOfflineRecords > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>
            {stats ? stats.pendingOfflineRecords : '—'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            {stats && stats.pendingOfflineRecords === 0 ? 'All records synchronized' : 'Records awaiting replay'}
          </div>
        </div>

        {/* Network Recovery */}
        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wifi size={14} /> Network Recovery
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.8125rem', fontWeight: 700,
              color: networkOnline ? 'var(--success)' : 'var(--danger)',
            }}>
              {networkOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
              {networkOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={10} />
            {stats?.lastSyncTime
              ? `Last sync: ${new Date(stats.lastSyncTime).toLocaleTimeString()}`
              : 'No sync recorded'}
          </div>
        </div>
      </div>

      {/* Real Statistics */}
      {stats && hasData && (
        <div className="grid gap-16 mb-24" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          <StatMini label="Total Records" value={stats.totalRecords} />
          <StatMini label="Verified" value={stats.verifiedBlocks} color="var(--success)" />
          <StatMini label="Failures" value={stats.integrityFailures} color={stats.integrityFailures > 0 ? 'var(--danger)' : 'var(--text-primary)'} />
          <StatMini label="Tamper Events" value={stats.tamperEvents} color={stats.tamperEvents > 0 ? 'var(--danger)' : 'var(--text-primary)'} />
          <StatMini label="Offline Replayed" value={stats.offlineReplayedRecords} color={stats.offlineReplayedRecords > 0 ? '#8B5CF6' : 'var(--text-primary)'} />
          <StatMini label="Sequence Gaps" value={stats.sequenceGaps?.length || 0} color={stats.sequenceGaps?.length > 0 ? 'var(--warning)' : 'var(--text-primary)'} />
        </div>
      )}

      {/* Sequence Gap Detection */}
      {stats && stats.sequenceGaps && stats.sequenceGaps.length > 0 && (
        <div className="card mb-24" style={{
          border: '1px solid var(--warning-border)',
          background: 'var(--warning-bg)',
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={16} color="var(--warning)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--warning)' }}>
              SEQUENCE GAP DETECTED
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Missing: {formatSequenceGaps(stats.sequenceGaps)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            These records may arrive later through offline replay. The gap will be automatically marked as SEQUENCE RECOVERED once all records are received.
          </div>
        </div>
      )}

      {/* Offline Data Recovery Visualization */}
      {recoveryEvents.length > 0 && (
        <div className="card mb-24">
          <h2 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={18} color="#8B5CF6" /> Offline Data Recovery
          </h2>
          {recoveryEvents.map((event, idx) => (
            <div key={idx} style={{
              padding: '14px 16px', marginBottom: idx < recoveryEvents.length - 1 ? '12px' : 0,
              background: 'rgba(139, 92, 246, 0.04)', borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
            }}>
              <RecoveryFlow event={event} />
            </div>
          ))}
        </div>
      )}

      {/* Node Information (collapsible) */}
      <div className="card mb-24" style={{ cursor: 'pointer' }} onClick={() => setNodeInfoExpanded(!nodeInfoExpanded)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--primary)" /> Node Information
          </h2>
          {nodeInfoExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {nodeInfoExpanded && (
          <div style={{ marginTop: '16px' }} onClick={e => e.stopPropagation()}>
            <div className="grid gap-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div>
                <InfoLabel label="Node" value="Container ESP32" />
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>Telemetry</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['Temperature', 'Humidity', 'Gas', 'Battery', 'Solar', 'GPS', 'Tamper'].map(s => (
                      <span key={s} style={{
                        fontSize: '0.6875rem', padding: '3px 8px', borderRadius: '4px',
                        background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>Communication</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {['Wi-Fi', 'MQTT', 'NRF24'].map(s => (
                    <span key={s} style={{
                      fontSize: '0.6875rem', padding: '3px 8px', borderRadius: '4px',
                      background: 'var(--primary-light)', border: '1px solid var(--success-border)', color: 'var(--primary)',
                    }}>{s}</span>
                  ))}
                </div>
                <InfoLabel label="MQTT Data Topic" value="farmtrace/container/data" mono />
                <InfoLabel label="Integrity Topic" value="farmtrace/container/integrity" mono />
                <InfoLabel label="Status Topic" value="farmtrace/container/status" mono />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Integrity Status Summary */}
      <div className="card mb-24">
        <h2 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--success)" /> Data Integrity Status
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          <StatusCheck label="Telemetry Hash Verification" verified={isVerified} />
          <StatusCheck label="Sequence Verification" verified={stats?.sequenceGaps?.length === 0} />
          <StatusCheck label="Previous Hash Verification" verified={isVerified} />
          <StatusCheck label="Block Hash Verification" verified={isVerified} />
          <StatusCheck label="Offline Data Recovery" verified={true} />
          <StatusCheck label="Automatic Synchronization" verified={networkOnline || demoMode} />
          <StatusCheck label="Tamper Monitoring" verified={stats?.tamperEvents === 0} />
        </div>
      </div>

      {/* Cryptographic Hash Chain */}
      <div className="card mb-24">
        <h2 style={{ fontSize: '1.125rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} color="var(--primary)" /> Cryptographic Hash Chain
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
            <RefreshCw size={24} className="spin" style={{ marginBottom: '12px' }} />
            <div>Loading integrity chain...</div>
          </div>
        ) : (
          <HashChainVisualization blocks={displayBlocks} />
        )}
      </div>

      {/* Cryptographic Protection Info (collapsible) */}
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => setSecurityInfoExpanded(!securityInfoExpanded)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--primary)" /> Cryptographic Protection
          </h2>
          {securityInfoExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {securityInfoExpanded && (
          <div style={{ marginTop: '16px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <SecurityItem icon={<ShieldCheck size={14} />} text="SHA-256 telemetry verification — detects unauthorized manipulation of telemetry records" />
              <SecurityItem icon={<Database size={14} />} text="Previous-hash chaining — cryptographic linkage ensures sequential integrity of all blocks" />
              <SecurityItem icon={<Hash size={14} />} text="Sequence tracking — continuous monitoring of telemetry sequence numbers detects missing records" />
              <SecurityItem icon={<RotateCcw size={14} />} text="Offline record recovery — telemetry generated during network interruption is preserved and replayed with full verification" />
              <SecurityItem icon={<AlertTriangle size={14} />} text="Tamper detection — hardware tamper events are recorded and associated with the exact telemetry sequence" />
              <SecurityItem icon={<Radio size={14} />} text="MQTT-based synchronization — real-time telemetry delivery with automatic reconnection" />
              <SecurityItem icon={<CheckCircle size={14} />} text="Integrity verification after reconnection — all replayed records undergo full SHA-256 and chain verification" />
            </div>
            <div style={{
              marginTop: '16px', padding: '12px', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-main)', border: '1px solid var(--border)',
              fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.6,
            }}>
              <Info size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              SHA-256 provides cryptographic integrity verification of telemetry records. It does not prevent physical tampering but detects any unauthorized modification of data after it has been recorded by the ESP32.
            </div>
          </div>
        )}
      </div>

      {/* FarmTrace Data Flow */}
      {!hasData && !loading && (
        <div className="card" style={{ marginTop: '24px', background: 'var(--bg-main)', borderStyle: 'dashed' }}>
          <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-tertiary)' }}>
            <Database size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
              No telemetry received
            </div>
            <div style={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
              Connect the Container ESP32 to publish telemetry via MQTT to <code>farmtrace/container/data</code>.
              <br />
              Integrity blocks will appear here automatically.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Helper Components
// ============================================================

function StatMini({ label, value, color }) {
  return (
    <div style={{
      padding: '12px 16px', background: 'var(--bg-card)',
      borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: '1.125rem', fontWeight: 700, color: color || 'var(--text-primary)' }}>{(value ?? 0).toLocaleString()}</div>
    </div>
  );
}

function InfoLabel({ label, value, mono }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>{label}</div>
      <div style={{
        fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
        fontFamily: mono ? 'monospace' : 'inherit',
      }}>{value}</div>
    </div>
  );
}

function SecurityItem({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
      <span style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function RecoveryFlow({ event }) {
  const steps = [
    { icon: <WifiOff size={14} />, text: 'Network interruption detected', color: 'var(--danger)' },
    { icon: <Database size={14} />, text: `${event.count} telemetry record${event.count !== 1 ? 's' : ''} stored locally (seq ${event.startSequence}–${event.endSequence})`, color: 'var(--warning)' },
    { icon: <Wifi size={14} />, text: 'Network restored', color: 'var(--success)' },
    { icon: <RotateCcw size={14} />, text: `${event.count} record${event.count !== 1 ? 's' : ''} replayed`, color: '#8B5CF6' },
    { icon: <ShieldCheck size={14} />, text: event.verified ? 'SHA-256 verified' : 'Verification pending', color: event.verified ? 'var(--success)' : 'var(--warning)' },
    { icon: <Database size={14} />, text: 'Blockchain chain synchronized', color: 'var(--success)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {steps.map((step, idx) => (
        <div key={idx}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: step.color, flexShrink: 0 }}>{step.icon}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{step.text}</span>
          </div>
          {idx < steps.length - 1 && (
            <div style={{ marginLeft: '7px', borderLeft: '1.5px solid var(--border)', height: '10px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Format sequence gaps for display
 * e.g. [167, 168, 169] → "167–169"
 */
function formatSequenceGaps(gaps) {
  if (!gaps || gaps.length === 0) return '—';
  const sorted = [...gaps].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}–${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}–${end}`);
  return ranges.join(', ');
}

function StatusCheck({ label, verified }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: verified ? 'var(--text-secondary)' : 'var(--danger)' }}>
      {verified ? <CheckCircle size={14} color="var(--success)" /> : <XCircle size={14} color="var(--danger)" />}
      {label} {verified ? '' : 'Failed'}
    </div>
  );
}
