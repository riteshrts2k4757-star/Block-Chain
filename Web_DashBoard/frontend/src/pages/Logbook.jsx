import React from 'react';
import { Truck, Clock, Coffee, Plus } from 'lucide-react';
import { mockLogbook, mockTrip } from '../mock/data';

const Logbook = () => {
  return (
    <div>
      <div className="flex justify-between items-start mb-24">
        <div>
          <h1 className="page-title">Driver Logbook</h1>
          <p className="page-subtitle">Trip {mockTrip.id} — Today's activity</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Add Event
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-3 gap-16 mb-24">
        <div className="card" style={{ padding: 20 }}>
          <div className="flex items-center gap-8 mb-8">
            <Truck size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Today's Driving</span>
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{mockTrip.drivingTime}</span>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="flex items-center gap-8 mb-8">
            <Coffee size={18} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Today's Rest</span>
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{mockTrip.restTime}</span>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="flex items-center gap-8 mb-8">
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Current Status</span>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.875rem', padding: '6px 14px' }}>
            🟢 Driving
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-8 mb-24">
        <button className="btn btn-primary btn-lg">
          <Coffee size={18} /> Start Rest
        </button>
        <button className="btn btn-outline btn-lg">
          <Clock size={18} /> Break
        </button>
        <button className="btn btn-outline btn-lg">
          Off Duty
        </button>
      </div>

      {/* Timeline */}
      <div className="section-title">Today's Timeline</div>
      <div className="card">
        <div className="timeline">
          {mockLogbook.map((entry) => (
            <div className="timeline-item" key={entry.id}>
              <div className="timeline-marker">
                <div className={`timeline-dot ${entry.type}`} />
                <div className="timeline-line" />
              </div>
              <div className="timeline-content">
                <span className="timeline-time">{entry.time}</span>
                <span className="timeline-title">{entry.title}</span>
                <span className="timeline-desc">{entry.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Logbook;
