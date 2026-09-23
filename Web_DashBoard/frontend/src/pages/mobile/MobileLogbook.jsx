import React from 'react';
import './mobile.css';
import { mockTrip, mockLogbook } from '../../mock/data';

const MobileLogbook = () => (
  <div className="m-page">
    {/* Summary */}
    <div className="m-row">
      <div className="m-card m-flex-1">
        <div className="m-card-label">Driving</div>
        <div className="m-card-value">{mockTrip.drivingTime}</div>
      </div>
      <div className="m-card m-flex-1">
        <div className="m-card-label">Rest</div>
        <div className="m-card-value">{mockTrip.restTime}</div>
      </div>
      <div className="m-card m-flex-1" style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>
        <div className="m-card-label" style={{ color: 'var(--primary-dark)' }}>Status</div>
        <div className="m-badge success" style={{ marginTop: 4 }}>🟢 Driving</div>
      </div>
    </div>

    {/* Controls */}
    <div className="m-row" style={{ marginBottom: 16 }}>
      <button className="m-btn-primary m-flex-1">Start Rest</button>
      <button className="m-btn-outline m-flex-1">Add Event</button>
    </div>

    {/* Timeline */}
    <div className="m-section-label">TODAY'S TIMELINE</div>
    <div className="m-card">
      {mockLogbook.map((entry, i) => (
        <div className="m-timeline-item" key={entry.id}>
          <div className="m-timeline-left">
            <div className={`m-timeline-dot ${entry.type}`} />
            {i < mockLogbook.length - 1 && <div className="m-timeline-line" />}
          </div>
          <div className="m-timeline-content">
            <div className="m-timeline-time">{entry.time}</div>
            <div className="m-timeline-title">{entry.title}</div>
            <div className="m-timeline-desc">{entry.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MobileLogbook;
