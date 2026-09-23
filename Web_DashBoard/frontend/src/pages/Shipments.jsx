import React from 'react';
import { Truck, MapPin, Calendar, ChevronRight, Plus, Package, AlertTriangle, Database } from 'lucide-react';
import { mockTrips } from '../mock/data';

const Shipments = () => {
  return (
    <div>
      <div className="flex justify-between items-start mb-24">
        <div>
          <h1 className="page-title">Shipments</h1>
          <p className="page-subtitle">Current and completed trips</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> New Trip
        </button>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid mb-24">
        <div className="kpi-card">
          <span className="kpi-label">Active Shipments</span>
          <span className="kpi-value">1</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Completed</span>
          <span className="kpi-value">1</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Total Alerts</span>
          <span className="kpi-value" style={{ color: 'var(--warning)' }}>2</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Records Synced</span>
          <span className="kpi-value">3,072</span>
        </div>
      </div>

      {/* Shipment List */}
      <div className="section-title">All Shipments</div>
      <div className="flex flex-col gap-12">
        {mockTrips.map(trip => (
          <div className="card" key={trip.id} style={{ cursor: 'pointer' }}>
            <div className="flex justify-between items-start">
              <div className="flex gap-16 items-start">
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: trip.status === 'active' ? 'var(--success-bg)' : 'var(--bg-hover)',
                  color: trip.status === 'active' ? 'var(--success)' : 'var(--text-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Truck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-8">
                    <span style={{ fontSize: '1rem', fontWeight: 600 }}>{trip.id}</span>
                    <span className={`badge badge-${trip.status === 'active' ? 'success' : 'neutral'}`}>
                      {trip.status === 'active' ? '● Active' : 'Completed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-8 mt-8" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <MapPin size={14} />
                    <span>{trip.origin} → {trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-16 mt-8" style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                    <span className="flex items-center gap-8"><Calendar size={13} /> {trip.date}</span>
                    <span className="flex items-center gap-8"><Package size={13} /> {trip.container}</span>
                    <span className="flex items-center gap-8"><Database size={13} /> {trip.records.toLocaleString()} records</span>
                    {trip.alerts > 0 && (
                      <span className="flex items-center gap-8" style={{ color: 'var(--warning)' }}>
                        <AlertTriangle size={13} /> {trip.alerts} alerts
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shipments;
