import React from 'react';
import { trips } from '../../data/fleet';
import { Route } from 'lucide-react';

export default function Trips() {
  return (
    <div>
      <h1 className="page-title">Active Trips</h1>
      <p className="page-subtitle mb-24">Current logistics operations and route status</p>
      
      <div className="card" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-hover)' }}>
              <th style={{ padding: '16px', fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Trip ID</th>
              <th style={{ padding: '16px', fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Route</th>
              <th style={{ padding: '16px', fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Driver / Truck</th>
              <th style={{ padding: '16px', fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => (
              <tr key={trip.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontWeight: 600 }}>{trip.id}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{trip.origin}</span>
                    <Route size={14} color="var(--text-tertiary)" />
                    <span style={{ fontWeight: 500 }}>{trip.destination}</span>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.875rem' }}>{trip.driver}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{trip.truckId}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                    background: trip.status === 'completed' ? 'var(--bg-hover)' : 'var(--primary-light)',
                    color: trip.status === 'completed' ? 'var(--text-secondary)' : 'var(--primary-dark)'
                  }}>
                    {trip.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--primary)', width: `${trip.progress}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
