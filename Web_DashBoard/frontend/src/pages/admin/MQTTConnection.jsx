import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { MQTTActivityStream } from '../../components/network/NetworkDiagram';
import { Link2, Clock, Zap } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export default function MQTTConnection() {
  const { mqttStatus, mqttLog, packetsReceived, lastDriverPacketAt, lastContainerPacketAt } = useTelemetry();

  return (
    <div>
      <h1 className="page-title">MQTT Connection</h1>
      <p className="page-subtitle mb-24">Live broker status and activity stream</p>

      <div className="grid grid-2 gap-24 mb-24">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.125rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link2 size={20} color="var(--primary)" /> Connection Details
            </h2>
            <StatusBadge status={mqttStatus} size="lg" />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <DetailRow label="Broker URL" value="mqtt://localhost" />
            <DetailRow label="MQTT Port" value="1883" />
            <DetailRow label="WebSocket Port" value="3000" />
            <DetailRow label="Client ID" value="FarmTrace_Dashboard_Web" />
            <DetailRow label="Total Packets" value={packetsReceived.driver + packetsReceived.container} highlight />
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--info)" /> Topic Activity
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>farmtrace/driver/data</span>
                <span style={{ color: 'var(--text-tertiary)' }}>{packetsReceived.driver} packets</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Last packet: {lastDriverPacketAt ? new Date(lastDriverPacketAt).toLocaleTimeString() : 'Never'}
              </div>
            </div>
            
            <div style={{ height: '1px', background: 'var(--border)' }} />
            
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>farmtrace/container/data</span>
                <span style={{ color: 'var(--text-tertiary)' }}>{packetsReceived.container} packets</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Last packet: {lastContainerPacketAt ? new Date(lastContainerPacketAt).toLocaleTimeString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
          <h2 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="var(--warning)" /> Live Activity Stream
          </h2>
        </div>
        <MQTTActivityStream logs={mqttLog} />
      </div>
    </div>
  );
}

const DetailRow = ({ label, value, highlight }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
    <span style={{ fontSize: '0.9375rem', fontWeight: highlight ? 700 : 500, color: highlight ? 'var(--primary)' : 'var(--text-primary)', fontFamily: 'monospace' }}>{value}</span>
  </div>
);
