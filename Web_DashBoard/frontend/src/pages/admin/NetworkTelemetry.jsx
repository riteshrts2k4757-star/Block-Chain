import React from 'react';
import { useTelemetry } from '../../context/TelemetryContext';
import { NetworkDiagram } from '../../components/network/NetworkDiagram';
import { Server, Activity, ArrowDownToLine, Signal, Network } from 'lucide-react';

export default function NetworkTelemetry() {
  const { mqttStatus, lastDriverPacketAt, lastContainerPacketAt, packetsReceived, dataSource } = useTelemetry();

  const isSimulated = dataSource === 'SIMULATION';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="animate-slide-down" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.75rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em', background: 'linear-gradient(90deg, var(--primary-dark), var(--info))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            <Network size={28} color="var(--primary)" /> Network Telemetry
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '8px', margin: '8px 0 0 0' }}>
            Live IoT network architecture and connection health
          </p>
        </div>
      </div>

      <div className="animate-slide-down" style={{ marginBottom: '40px', animationDelay: '0.1s' }}>
        <NetworkDiagram 
          driverStatus={isSimulated ? 'simulated' : (Date.now() - new Date(lastDriverPacketAt).getTime() < 10000 ? 'online' : 'offline')}
          containerStatus={isSimulated ? 'simulated' : (Date.now() - new Date(lastContainerPacketAt).getTime() < 10000 ? 'online' : 'offline')}
          mqttStatus={mqttStatus}
        />
      </div>

      <div className="grid grid-4 gap-24 animate-slide-down" style={{ animationDelay: '0.2s' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', padding: '24px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
        }} onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: '12px' }}><Server size={20} /></div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>MQTT Broker</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>EMQX Cloud</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '8px', fontWeight: 700, background: 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '8px', display: 'inline-block' }}>broker.emqx.io / WSS</div>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.4)', borderRadius: '20px', padding: '24px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
        }} onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: '12px' }}><ArrowDownToLine size={20} /></div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>Total Packets</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{packetsReceived.driver + packetsReceived.container}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '8px', fontWeight: 700 }}>Session Total</div>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(59,130,246,0.3)', borderTop: '4px solid var(--info)', borderRadius: '20px', padding: '24px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
        }} onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--info)', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '8px', borderRadius: '12px' }}><Activity size={20} /></div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>Driver Node</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--info)', fontFamily: 'monospace' }}>{packetsReceived.driver}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '8px', fontWeight: 700, background: 'rgba(59,130,246,0.1)', padding: '4px 8px', borderRadius: '8px', display: 'inline-block' }}>farmtrace/driver/data</div>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(16,185,129,0.3)', borderTop: '4px solid var(--primary)', borderRadius: '20px', padding: '24px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', transition: 'transform 0.2s'
        }} onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '12px' }}><Activity size={20} /></div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase' }}>Container Node</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'monospace' }}>{packetsReceived.container}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '8px', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '8px', display: 'inline-block' }}>farmtrace/container/data</div>
        </div>
      </div>
    </div>
  );
}
