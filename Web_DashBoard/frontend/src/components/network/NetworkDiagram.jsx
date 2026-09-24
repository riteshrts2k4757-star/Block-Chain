import React from 'react';
import { Wifi, Server, Cpu, Activity, ShieldCheck, AlertCircle } from 'lucide-react';

export function NetworkDiagram({ driverStatus = 'online', containerStatus = 'online', mqttStatus = 'connected' }) {
  const isDriverOnline = driverStatus === 'online';
  const isContainerOnline = containerStatus === 'online';
  const isMqttConnected = mqttStatus === 'connected';

  const Node = ({ title, icon: Icon, active, color }) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      padding: '16px 12px', background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: `2px solid ${active ? color : 'rgba(0,0,0,0.05)'}`,
      borderRadius: '20px', boxShadow: active ? `0 8px 20px -8px ${color}40` : '0 8px 20px -5px rgba(0,0,0,0.05)',
      width: '160px', zIndex: 2, position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = active ? `0 16px 40px -10px ${color}60` : '0 16px 30px -5px rgba(0,0,0,0.1)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = active ? `0 12px 30px -10px ${color}40` : '0 10px 25px -5px rgba(0,0,0,0.05)'; }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: '16px',
        background: active ? `${color}15` : 'rgba(0,0,0,0.05)',
        color: active ? color : 'var(--text-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: active ? `inset 0 0 0 2px ${color}30` : 'none',
        transition: 'all 0.3s'
      }}>
        <Icon size={24} />
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: 800, textAlign: 'center', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{title}</div>
      <div style={{ fontSize: '0.65rem', color: active ? 'var(--success)' : 'var(--danger)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', background: active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'var(--success)' : 'var(--danger)', boxShadow: active ? '0 0 8px var(--success)' : '0 0 8px var(--danger)' }} />
        {active ? 'ONLINE' : 'OFFLINE'}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px', background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.05)' }}>
      {/* Top row: Devices */}
      <div style={{ display: 'flex', gap: '80px', width: '100%', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <Node title="Driver Node (ESP8266)" icon={Cpu} active={isDriverOnline} color="var(--info)" />
        <Node title="Container Node (ESP32)" icon={Cpu} active={isContainerOnline} color="var(--info)" />
      </div>

      {/* Middle row: Broker */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
        <Node title="Cloud MQTT Broker" icon={Server} active={isMqttConnected} color="var(--primary)" />
        
        {/* SVG Connection Lines for Devices -> Broker */}
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '240px', height: '50px', zIndex: 1, pointerEvents: 'none' }}>
           <svg width="100%" height="100%" viewBox="0 0 240 50" preserveAspectRatio="none">
             <path d="M 0,0 C 0,25 120,20 120,50" fill="none" stroke={isDriverOnline && isMqttConnected ? "var(--info)" : "rgba(0,0,0,0.1)"} strokeWidth="3" strokeDasharray="8 8" className={isDriverOnline && isMqttConnected ? "data-flow-svg" : ""} />
             <path d="M 240,0 C 240,25 120,20 120,50" fill="none" stroke={isContainerOnline && isMqttConnected ? "var(--info)" : "rgba(0,0,0,0.1)"} strokeWidth="3" strokeDasharray="8 8" className={isContainerOnline && isMqttConnected ? "data-flow-svg" : ""} />
           </svg>
        </div>
      </div>

      {/* Bottom row: Backend */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
        <Node title="FarmTrace Backend" icon={ShieldCheck} active={true} color="var(--primary-dark)" />
        
        {/* SVG Connection Line for Broker -> Backend */}
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '50px', zIndex: 1, pointerEvents: 'none' }}>
           <svg width="100%" height="100%" viewBox="0 0 20 50">
             <line x1="10" y1="0" x2="10" y2="50" stroke="var(--primary)" strokeWidth="3" strokeDasharray="8 8" className="data-flow-svg-vert" />
           </svg>
        </div>
      </div>

      <style>{`
        @keyframes svgDashFlow { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
        .data-flow-svg { animation: svgDashFlow 1.2s linear infinite; stroke-linecap: round; opacity: 0.8; }
        .data-flow-svg-vert { animation: svgDashFlow 1s linear infinite; stroke-linecap: round; opacity: 0.8; }
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
