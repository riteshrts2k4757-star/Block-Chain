import React from 'react';


const Settings = () => {
  return (
    <div>
      <h1 className="page-title mb-24">Settings</h1>

      {/* Gateway */}
      <div className="section-title">Gateway Configuration</div>
      <div className="card mb-20">
        <div className="grid grid-2 gap-20">
          <div className="form-group">
            <label className="form-label">Gateway IP Address</label>
            <input className="form-input" type="text" defaultValue="192.168.4.1" />
          </div>
          <div className="form-group">
            <label className="form-label">Port</label>
            <input className="form-input" type="text" defaultValue="80" />
          </div>
          <div className="form-group">
            <label className="form-label">Gateway ID</label>
            <input className="form-input" type="text" defaultValue="FARMGW001" />
          </div>
          <div className="form-group">
            <label className="form-label">Connection Mode</label>
            <select className="form-input">
              <option>Wi-Fi Direct</option>
              <option>Local Network</option>
            </select>
          </div>
        </div>
      </div>

      {/* MQTT */}
      <div className="section-title">MQTT Broker</div>
      <div className="card mb-20">
        <div className="grid grid-2 gap-20">
          <div className="form-group">
            <label className="form-label">Broker URL</label>
            <input className="form-input" type="text" defaultValue="mqtt.farmtrace.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Port</label>
            <input className="form-input" type="text" defaultValue="8883" />
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" defaultValue="farmtrace_driver" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" defaultValue="••••••••" />
          </div>
          <div className="form-group">
            <label className="form-label">Publish Topic</label>
            <input className="form-input" type="text" defaultValue="farmtrace/container/CONT001/data" />
            <span className="form-hint">Topic used to forward sensor data</span>
          </div>
          <div className="form-group">
            <label className="form-label flex items-center gap-8">
              TLS Encryption
            </label>
            <div className="flex items-center gap-8">
              <input type="checkbox" id="tls" defaultChecked style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
              <label htmlFor="tls" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Enable TLS</label>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="section-title">Alert Thresholds</div>
      <div className="card mb-20">
        <div className="grid grid-2 gap-20">
          <div className="form-group">
            <label className="form-label">Max Temperature (°C)</label>
            <input className="form-input" type="number" defaultValue="8.0" step="0.5" />
          </div>
          <div className="form-group">
            <label className="form-label">Max Humidity (%)</label>
            <input className="form-input" type="number" defaultValue="90" />
          </div>
          <div className="form-group">
            <label className="form-label">Ethylene Threshold (ppm)</label>
            <input className="form-input" type="number" defaultValue="5.0" step="0.5" />
          </div>
          <div className="form-group">
            <label className="form-label">Low Battery (%)</label>
            <input className="form-input" type="number" defaultValue="20" />
          </div>
          <div className="form-group">
            <label className="form-label">Max Driving Time (hours)</label>
            <input className="form-input" type="number" defaultValue="4.5" step="0.5" />
          </div>
          <div className="form-group">
            <label className="form-label">Rest Reminder (hours)</label>
            <input className="form-input" type="number" defaultValue="4" step="0.5" />
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="section-title">Data Management</div>
      <div className="card mb-20">
        <div className="flex flex-col gap-12">
          <div className="flex justify-between items-center" style={{ padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Synchronize Now</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Upload all pending records to backend</div>
            </div>
            <button className="btn btn-primary btn-sm">Sync</button>
          </div>
          <div style={{ borderTop: '1px solid var(--border-light)' }} />
          <div className="flex justify-between items-center" style={{ padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Export Trip Data</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Download current trip as CSV</div>
            </div>
            <button className="btn btn-outline btn-sm">Export</button>
          </div>
          <div style={{ borderTop: '1px solid var(--border-light)' }} />
          <div className="flex justify-between items-center" style={{ padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Clear Synced Data</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Remove uploaded records from local storage</div>
            </div>
            <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Clear</button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="section-title">Application</div>
      <div className="card">
        <div className="flex flex-col gap-12">
          <div className="flex justify-between" style={{ fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Version</span>
            <span style={{ fontWeight: 500 }}>1.0.0-beta</span>
          </div>
          <div className="flex justify-between" style={{ fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Build</span>
            <span style={{ fontWeight: 500 }}>2026.09.21</span>
          </div>
          <div className="flex justify-between" style={{ fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Mode</span>
            <span className="badge badge-warning">Simulation</span>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end gap-8 mt-24">
        <button className="btn btn-outline">Cancel</button>
        <button className="btn btn-primary">Save Settings</button>
      </div>
    </div>
  );
};

export default Settings;
