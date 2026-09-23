import React from 'react';
import { logbookEntries } from '../../data/fleet';
import { Clock, CheckCircle } from 'lucide-react';

const GenericPage = ({ title, subtitle }) => (
  <div>
    <h1 className="page-title">{title}</h1>
    <p className="page-subtitle mb-24">{subtitle}</p>
    <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
      Content for {title} will be implemented here.
    </div>
  </div>
);

export const DriverTrip = () => <GenericPage title="Current Trip" subtitle="Navigation and route details" />;
export const DriverProfile = () => <GenericPage title="My Profile" subtitle="Driver details and vehicle assignment" />;

export const DriverLogbook = () => {
  return (
    <div>
      <h1 className="page-title">My Logbook</h1>
      <p className="page-subtitle mb-24">Hours of Service (HOS) and activity history</p>

      <div className="card" style={{ padding: 0 }}>
        {logbookEntries.map((entry, idx) => (
          <div key={entry.id} style={{ 
            padding: '16px 20px', 
            borderBottom: idx < logbookEntries.length - 1 ? '1px solid var(--border)' : 'none',
            display: 'flex', gap: '16px', alignItems: 'flex-start'
          }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '4px', width: '45px' }}>
              {entry.time}
            </div>
            <div style={{ color: entry.type === 'checkpoint' ? 'var(--success)' : 'var(--primary)', marginTop: '2px' }}>
              {entry.type === 'checkpoint' ? <CheckCircle size={20} /> : <Clock size={20} />}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.title}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{entry.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
