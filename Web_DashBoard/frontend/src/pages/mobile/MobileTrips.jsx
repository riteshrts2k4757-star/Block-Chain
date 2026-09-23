import React from 'react';
import './mobile.css';
import { mockTrips } from '../../mock/data';

const MobileTrips = () => (
  <div className="m-page">
    <button className="m-btn-primary" style={{ width: '100%', marginBottom: 16 }}>+ Start New Trip</button>

    <div className="m-section-label">ALL SHIPMENTS</div>
    {mockTrips.map(trip => (
      <div className="m-trip-card" key={trip.id}>
        <div className="m-trip-header">
          <span className="m-trip-id">{trip.id}</span>
          <span className={`m-badge ${trip.status === 'active' ? 'success' : 'neutral'}`}>
            {trip.status === 'active' ? '● Active' : 'Completed'}
          </span>
        </div>
        <div className="m-trip-route">{trip.origin} → {trip.destination}</div>
        <div className="m-trip-meta">
          <span>{trip.date}</span>
          <span>{trip.records.toLocaleString()} records</span>
          {trip.alerts > 0 && <span style={{ color: 'var(--warning)' }}>{trip.alerts} alerts</span>}
        </div>
      </div>
    ))}
  </div>
);

export default MobileTrips;
