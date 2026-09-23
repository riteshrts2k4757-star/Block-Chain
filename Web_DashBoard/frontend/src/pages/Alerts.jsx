import React from 'react';
import { AlertTriangle, CheckCircle, Info, Bell } from 'lucide-react';
import { mockAlerts } from '../mock/data';

const iconMap = {
  danger: <AlertTriangle size={16} />,
  warning: <Info size={16} />,
  info: <Info size={16} />,
  success: <CheckCircle size={16} />,
};

const Alerts = () => {
  return (
    <div>
      <div className="flex justify-between items-start mb-24">
        <div>
          <h1 className="page-title">Alerts</h1>
          <p className="page-subtitle">{mockAlerts.length} total alerts</p>
        </div>
        <button className="btn btn-outline btn-sm">Mark all read</button>
      </div>

      {/* Summary */}
      <div className="kpi-grid mb-24">
        <div className="kpi-card">
          <span className="kpi-label">Critical</span>
          <span className="kpi-value" style={{ color: 'var(--danger)' }}>
            {mockAlerts.filter(a => a.type === 'danger').length}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Warnings</span>
          <span className="kpi-value" style={{ color: 'var(--warning)' }}>
            {mockAlerts.filter(a => a.type === 'warning').length}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Resolved</span>
          <span className="kpi-value" style={{ color: 'var(--success)' }}>
            {mockAlerts.filter(a => a.type === 'success').length}
          </span>
        </div>
      </div>

      {/* Alert List */}
      <div className="flex flex-col gap-12">
        {mockAlerts.map(alert => (
          <div className="alert-item" key={alert.id}>
            <div className={`alert-icon ${alert.type}`}>
              {iconMap[alert.type]}
            </div>
            <div className="alert-body">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-desc">{alert.desc}</div>
              {alert.action && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginTop: 6, fontWeight: 500 }}>
                  {alert.action}
                </div>
              )}
              <div className="alert-time">{alert.time}</div>
            </div>
            <div className="alert-action">
              <button className="btn btn-sm btn-ghost">
                Acknowledge
              </button>
            </div>
          </div>
        ))}
      </div>

      {mockAlerts.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Bell size={24} /></div>
          <div className="empty-state-title">All Clear</div>
          <div className="empty-state-desc">No active alerts. Your shipment is operating within normal parameters.</div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
