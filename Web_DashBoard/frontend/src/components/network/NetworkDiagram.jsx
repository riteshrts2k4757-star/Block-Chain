import React from 'react';
import { Wifi, Server, Cpu, Activity, ShieldCheck, AlertCircle } from 'lucide-react';

export function NetworkDiagram({ driverStatus = 'online', containerStatus = 'online', mqttStatus = 'connected' }) {
  const isDriverOnline = driverStatus === 'online';
  const isContainerOnline = containerStatus === 'online';
  const isMqttConnected = mqttStatus === 'connected';

  const Node = ({ title, icon: Icon, active, color }) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      padding: '20px 16px', background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${active ? color : 'rgba(255,255,255,0.4)'}`,
      borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
      width: '180px', zIndex: 2, position: 'relative',
      transition: 'transform 0.2s', cursor: 'default'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        width: 56, height: 56, borderRadius: '16px',
        background: active ? `${color}15` : 'rgba(0,0,0,0.05)',
        color: active ? color : 'var(--text-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: active ? `inset 0 0 10px ${color}30` : 'none'
      }}>
        <Icon size={28} />
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: 800, textAlign: 'center', color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: active ? 'var(--success)' : 'var(--danger)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', background: active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: active ? 'var(--success)' : 'var(--danger)', boxShadow: active ? '0 0 8px var(--success)' : '0 0 8px var(--danger)' }} />
        {active ? 'ONLINE' : 'OFFLINE'}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '60px', background: 'rgba(255,255,255,0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}>
      {/* Top row: Devices */}
      <div style={{ display: 'flex', gap: '120px', width: '100%', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <Node title="Driver Node (ESP8266)" icon={Cpu} active={isDriverOnline} color="var(--info)" />
        <Node title="Container Node (ESP32)" icon={Cpu} active={isContainerOnline} color="var(--info)" />
      </div>

      {/* Middle row: Broker */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
        <Node title="Cloud MQTT Broker" icon={Server} active={isMqttConnected} color="var(--primary)" />
        
        {/* CSS Connection Lines */}
        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '60px', zIndex: 1, pointerEvents: 'none' }}>
           {/* Left Line (Driver to Broker) */}
           <div className={isDriverOnline && isMqttConnected ? 'anim-flow-border' : ''} style={{ position: 'absolute', bottom: '0', left: '0', width: '50%', height: '100%', borderLeft: `2px dashed ${isDriverOnline && isMqttConnected ? 'var(--info)' : 'rgba(0,0,0,0.1)'}`, borderBottom: `2px dashed ${isDriverOnline && isMqttConnected ? 'var(--info)' : 'rgba(0,0,0,0.1)'}`, borderBottomLeftRadius: '24px' }}></div>
           {/* Right Line (Container to Broker) */}
           <div className={isContainerOnline && isMqttConnected ? 'anim-flow-border-reverse' : ''} style={{ position: 'absolute', bottom: '0', right: '0', width: '50%', height: '100%', borderRight: `2px dashed ${isContainerOnline && isMqttConnected ? 'var(--info)' : 'rgba(0,0,0,0.1)'}`, borderBottom: `2px dashed ${isContainerOnline && isMqttConnected ? 'var(--info)' : 'rgba(0,0,0,0.1)'}`, borderBottomRightRadius: '24px' }}></div>
        </div>
      </div>

      {/* Bottom row: Backend */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
        <Node title="FarmTrace Backend" icon={ShieldCheck} active={true} color="var(--primary-dark)" />
        <div className="anim-flow-border-vertical" style={{ position: 'absolute', top: '-60px', left: '50%', width: '2px', height: '60px', borderLeft: '2px dashed var(--primary)', zIndex: 1 }}></div>
      </div>

      <style>{`
        @keyframes flowBorder { 0% { border-color: rgba(59, 130, 246, 0.2); } 50% { border-color: rgba(59, 130, 246, 1); } 100% { border-color: rgba(59, 130, 246, 0.2); } }
        @keyframes flowBorderVert { 0% { border-color: rgba(16, 185, 129, 0.2); } 50% { border-color: rgba(16, 185, 129, 1); } 100% { border-color: rgba(16, 185, 129, 0.2); } }
        .anim-flow-border { animation: flowBorder 2s ease-in-out infinite; }
        .anim-flow-border-reverse { animation: flowBorder 2s ease-in-out infinite 1s; }
        .anim-flow-border-vertical { animation: flowBorderVert 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export function MQTTActivityStream({ logs }) {
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E8F0', borderRadius: '20px', padding: '24px', fontFamily: 'monospace', height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#475569', marginTop: '40px', fontWeight: 600 }}>Waiting for secure cloud connection...</div>
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
            <div key={log.id} style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#64748B', flexShrink: 0, fontWeight: 700 }}>[{log.time}]</span>
              <span style={{ color, wordBreak: 'break-all', fontWeight: 500 }}>{log.message}</span>
            </div>
          );
        })
      )}
    </div>
  );
}
