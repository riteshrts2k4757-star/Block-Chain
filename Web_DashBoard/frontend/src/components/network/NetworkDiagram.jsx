import React from 'react';
import { Wifi, Server, Cpu, Activity, ShieldCheck, AlertCircle } from 'lucide-react';

export function NetworkDiagram({ driverStatus = 'online', containerStatus = 'online', mqttStatus = 'connected' }) {
  const isDriverOnline = driverStatus === 'online';
  const isContainerOnline = containerStatus === 'online';
  const isMqttConnected = mqttStatus === 'connected';

  const Node = ({ title, icon: Icon, active, color }) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      padding: '16px', background: 'var(--bg-card)', border: `1px solid ${active ? color : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
      width: '140px', zIndex: 2
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: active ? `${color}15` : 'var(--bg-hover)',
        color: active ? color : 'var(--text-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={24} />
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>{title}</div>
      <div style={{ fontSize: '0.6875rem', color: active ? 'var(--success)' : 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'var(--success)' : 'var(--danger)' }} />
        {active ? 'ONLINE' : 'OFFLINE'}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
      {/* Top row: Devices */}
      <div style={{ display: 'flex', gap: '80px', width: '100%', justifyContent: 'center', position: 'relative' }}>
        <Node title="Driver Node (ESP8266)" icon={Cpu} active={isDriverOnline} color="var(--info)" />
        <Node title="Container Node (ESP32)" icon={Cpu} active={isContainerOnline} color="var(--info)" />
      </div>

      {/* Middle row: Broker */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
        <Node title="MQTT Broker (Aedes)" icon={Server} active={isMqttConnected} color="var(--primary)" />
        
        {/* Connection lines using absolute SVG */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: -75, left: 0, width: '100%', height: 100, zIndex: 1, pointerEvents: 'none' }}>
          {/* Driver to Broker */}
          <path d="M 30 0 Q 30 50, 50 80" fill="none" stroke={isDriverOnline && isMqttConnected ? 'var(--info)' : 'var(--border)'} strokeWidth="2" strokeDasharray={isDriverOnline && isMqttConnected ? '4 4' : 'none'} className={isDriverOnline && isMqttConnected ? 'anim-dash' : ''} />
          {/* Container to Broker */}
          <path d="M 70 0 Q 70 50, 50 80" fill="none" stroke={isContainerOnline && isMqttConnected ? 'var(--info)' : 'var(--border)'} strokeWidth="2" strokeDasharray={isContainerOnline && isMqttConnected ? '4 4' : 'none'} className={isContainerOnline && isMqttConnected ? 'anim-dash-reverse' : ''} />
        </svg>
      </div>

      {/* Bottom row: Backend */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
        <Node title="FarmTrace Backend" icon={ShieldCheck} active={true} color="var(--primary-dark)" />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: -75, left: 0, width: '100%', height: 100, zIndex: 1, pointerEvents: 'none' }}>
          <path d="M 50 0 L 50 80" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4" className="anim-dash" />
        </svg>
      </div>

      <style>{`
        @keyframes dash { to { stroke-dashoffset: -20; } }
        @keyframes dash-reverse { to { stroke-dashoffset: 20; } }
        .anim-dash { animation: dash 1s linear infinite; }
        .anim-dash-reverse { animation: dash-reverse 1s linear infinite; }
      `}</style>
    </div>
  );
}

export function MQTTActivityStream({ logs }) {
  return (
    <div style={{ background: '#0F172A', color: '#E2E8F0', borderRadius: 'var(--radius-lg)', padding: '16px', fontFamily: 'monospace', height: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#475569', marginTop: '40px' }}>Waiting for MQTT activity...</div>
      ) : (
        logs.map(log => {
          let color = '#94A3B8';
          if (log.type === 'success') color = '#34D399';
          if (log.type === 'error') color = '#F87171';
          if (log.type === 'warning') color = '#FBBF24';
          if (log.type === 'driver') color = '#60A5FA';
          if (log.type === 'container') color = '#A78BFA';
          if (log.type === 'system') color = '#CBD5E1';

          return (
            <div key={log.id} style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
              <span style={{ color: '#475569', flexShrink: 0 }}>[{log.time}]</span>
              <span style={{ color, wordBreak: 'break-all' }}>{log.message}</span>
            </div>
          );
        })
      )}
    </div>
  );
}
