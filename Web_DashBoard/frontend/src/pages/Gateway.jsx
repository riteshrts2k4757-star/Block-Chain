import React from 'react';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { mockConnectivity, mockSync } from '../mock/data';

const Gateway = () => {
  const gw = mockConnectivity.gateway;
  const isConnected = gw.status === 'connected';

  return (
    <div>
      <div className="flex justify-between items-start mb-24">
        <div>
          <h1 className="page-title">Gateway Connection</h1>
          <p className="page-subtitle">Connect your phone to the FarmTrace gateway</p>
        </div>
        <span className={`badge badge-${isConnected ? 'success' : 'danger'}`} style={{ fontSize: '0.8125rem', padding: '6px 14px' }}>
          ● {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Connection Steps */}
      {!isConnected ? (
        <div className="card mb-24">
          <div className="card-header">
            <span className="card-title">Connect Container</span>
          </div>
          <div className="step-list">
            <div className="step-item completed">
              <div className="step-number">✓</div>
              <div className="step-body">
                <div className="step-title">Turn on the FarmTrace Gateway</div>
                <div className="step-desc">Power the ESP32 gateway device near the container.</div>
              </div>
            </div>
            <div className="step-item active">
              <div className="step-number">2</div>
              <div className="step-body">
                <div className="step-title">Connect your phone</div>
                <div className="step-desc">Join the FarmTrace_Gateway Wi-Fi network from your phone settings.</div>
                <button className="btn btn-primary btn-sm mt-12">Open Wi-Fi Settings</button>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-body">
                <div className="step-title">Container detected</div>
                <div className="step-desc">The app will automatically detect sensor data once connected.</div>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-body">
                <div className="step-title">Start monitoring</div>
                <div className="step-desc">Begin your trip with live sensor data.</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Connected Status */}
          <div className="status-banner safe mb-20">
            <div className="status-banner-icon"><CheckCircle size={16} /></div>
            <div className="status-banner-text">
              <span className="status-banner-title">Gateway Connected Successfully</span>
              <span className="status-banner-sub">Receiving sensor data from container</span>
            </div>
          </div>

          {/* Gateway Details */}
          <div className="card mb-20">
            <div className="card-header">
              <span className="card-title">Connection Details</span>
            </div>
            <div className="grid grid-2 gap-20">
              <InfoRow label="Wi-Fi Network" value={gw.ssid} />
              <InfoRow label="IP Address" value={gw.ip} />
              <InfoRow label="Signal Strength" value={`${gw.signal}% — Strong`} />
              <InfoRow label="Packets Received" value="1,024" />
              <InfoRow label="Packets Forwarded" value="1,012" />
              <InfoRow label="Pending Upload" value={`${mockSync.pending}`} highlight={mockSync.pending > 0} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-8">
            <button className="btn btn-outline">
              <RefreshCw size={16} /> Reconnect
            </button>
            <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
              <WifiOff size={16} /> Disconnect
            </button>
          </div>

          {/* Advanced Info */}
          <details style={{ marginTop: 24 }}>
            <summary style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 0' }}>
              Advanced Information
            </summary>
            <div className="card mt-12">
              <div className="grid grid-2 gap-16">
                <InfoRow label="Device ID" value="FARMGW001" />
                <InfoRow label="Firmware" value="v2.1.0" />
                <InfoRow label="nRF24 Channel" value="76" />
                <InfoRow label="Data Rate" value="250 kbps" />
                <InfoRow label="MQTT Topic" value="farmtrace/container/CONT001/data" />
                <InfoRow label="Connection Uptime" value="2h 14m" />
              </div>
            </div>
          </details>
        </>
      )}
    </div>
  );
};

const InfoRow = ({ label, value, highlight }) => (
  <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: highlight ? 'var(--warning)' : 'var(--text-primary)' }}>{value}</div>
  </div>
);

export default Gateway;
