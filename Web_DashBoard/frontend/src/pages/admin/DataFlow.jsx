import React from 'react';
import { Database, Server, Cpu, Wifi, ShieldCheck, Activity, LineChart, FileText } from 'lucide-react';

export default function DataFlow() {
  return (
    <div>
      <h1 className="page-title">Data Flow Architecture</h1>
      <p className="page-subtitle mb-24">End-to-end data pipeline from physical sensors to the dashboard</p>

      <div className="card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <FlowStep 
            icon={Cpu} 
            title="1. Sensor Data Acquisition" 
            desc="Physical sensors (MQ3, MQ6, DHT, MPU6050) read analog and digital signals. The ESP32 and ESP8266 microcontrollers process these raw voltages into engineering units."
          />
          <FlowStep 
            icon={Wifi} 
            title="2. Wireless Transmission" 
            desc="The microcontrollers connect to a local WiFi hotspot. They format the data as JSON payloads and transmit them via the MQTT protocol."
          />
          <FlowStep 
            icon={Server} 
            title="3. MQTT Broker (Aedes)" 
            desc="The local Node.js server running Aedes receives the data on specific topics (farmtrace/driver/data and farmtrace/container/data)."
          />
          <FlowStep 
            icon={Activity} 
            title="4. Centralized Telemetry Context" 
            desc="The React dashboard connects to the server via Socket.IO. The TelemetryContext manages state, maintains history buffers, and seamlessly handles hardware/simulation switching."
          />
          <FlowStep 
            icon={ShieldCheck} 
            title="5. Validation & Integrity" 
            desc="The Alert Engine evaluates telemetry against configured thresholds. For container data, sequence numbers are verified and cryptographic hashes are generated."
          />
          <FlowStep 
            icon={Database} 
            title="6. Data Storage" 
            desc="Verified records are persisted to MongoDB along with their SHA-256 hashes for long-term auditability."
          />
          <FlowStep 
            icon={LineChart} 
            title="7. Dashboard Visualization" 
            desc="Processed data is rendered on the UI as live charts, fleet overviews, and role-based views for Admin and Driver users."
          />
        </div>
      </div>
    </div>
  );
}

const FlowStep = ({ icon: Icon, title, desc }) => (
  <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
    <div style={{ 
      width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', 
      color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
    }}>
      <Icon size={24} />
    </div>
    <div>
      <h3 style={{ fontSize: '1.125rem', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{desc}</p>
    </div>
  </div>
);
