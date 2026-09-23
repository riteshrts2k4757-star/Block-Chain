import React from 'react';
import './mobile.css';
import { mockDriver, mockTrip } from '../../mock/data';

const MobileProfile = () => (
  <div className="m-page">
    {/* Avatar */}
    <div className="m-profile-header">
      <div className="m-avatar">{mockDriver.avatar}</div>
      <div className="m-profile-name">{mockDriver.name}</div>
      <div className="m-profile-role">{mockDriver.id} · {mockDriver.role}</div>
    </div>

    {/* Info */}
    <div className="m-card" style={{ marginBottom: 14 }}>
      <div className="m-card-title">Personal Information</div>
      <div className="m-info-row"><span className="m-info-label">Phone</span><span className="m-info-value">{mockDriver.phone}</span></div>
      <div className="m-info-row"><span className="m-info-label">Vehicle</span><span className="m-info-value">{mockDriver.vehicle}</span></div>
      <div className="m-info-row"><span className="m-info-label">Current Trip</span><span className="m-info-value">{mockTrip.id}</span></div>
      <div className="m-info-row" style={{ borderBottom: 'none' }}><span className="m-info-label">Driving Today</span><span className="m-info-value">{mockTrip.drivingTime}</span></div>
    </div>

    {/* Stats */}
    <div className="m-section-label">PERFORMANCE</div>
    <div className="m-stats-row">
      <div className="m-stat-card"><div className="m-stat-value">24</div><div className="m-stat-label">Trips</div></div>
      <div className="m-stat-card"><div className="m-stat-value" style={{ color: 'var(--success)' }}>98%</div><div className="m-stat-label">Safety</div></div>
      <div className="m-stat-card"><div className="m-stat-value">7</div><div className="m-stat-label">Alerts</div></div>
    </div>

    {/* Settings */}
    <div className="m-card">
      <div className="m-settings-row"><span className="m-settings-label">Gateway Settings</span><span className="m-settings-chevron">›</span></div>
      <div className="m-settings-row"><span className="m-settings-label">MQTT Configuration</span><span className="m-settings-chevron">›</span></div>
      <div className="m-settings-row"><span className="m-settings-label">Alert Thresholds</span><span className="m-settings-chevron">›</span></div>
      <div className="m-settings-row"><span className="m-settings-label">Export Data</span><span className="m-settings-chevron">›</span></div>
      <div className="m-settings-row"><span className="m-settings-label">About FarmTrace</span><span className="m-settings-chevron">›</span></div>
    </div>
  </div>
);

export default MobileProfile;
