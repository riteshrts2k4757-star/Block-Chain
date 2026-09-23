import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { NetworkDiagram } from '../../components/network/NetworkDiagram';
import { Server, Activity, ArrowDownToLine, Signal } from 'lucide-react';

export default function NetworkTelemetry() {
  const { mqttStatus, lastDriverPacketAt, lastContainerPacketAt, packetsReceived, dataSource } = useTelemetry();

  const isSimulated = dataSource === 'SIMULATION';

  return (
    <div>
      <h1 className="page-title">Network Telemetry</h1>
      <p className="page-subtitle mb-24">Live IoT network architecture and connection health</p>

      <div className="mb-24">
        <NetworkDiagram 
          driverStatus={isSimulated ? 'simulated' : (Date.now() - new Date(lastDriverPacketAt).getTime() < 10000 ? 'online' : 'offline')}
          containerStatus={isSimulated ? 'simulated' : (Date.now() - new Date(lastContainerPacketAt).getTime() < 10000 ? 'online' : 'offline')}
          mqttStatus={mqttStatus}
        />
      </div>

      <div className="grid grid-4 gap-16">
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            <Server size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>MQTT Broker</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Aedes Node.js</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>localhost:3000 / 1883</div>
        </div>
        
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            <ArrowDownToLine size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Packets Received</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{packetsReceived.driver + packetsReceived.container}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Session Total</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--info)', marginBottom: '12px' }}>
            <Activity size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Driver Packets</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--info)' }}>{packetsReceived.driver}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>farmtrace/driver/data</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '12px' }}>
            <Activity size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Container Packets</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{packetsReceived.container}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>farmtrace/container/data</div>
        </div>
      </div>
    </div>
  );
}
