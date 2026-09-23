import React from 'react';
import { User, Truck, Phone, MapPin, Clock, Shield, Edit } from 'lucide-react';
import { mockDriver, mockTrip } from '../mock/data';

const Profile = () => {
  return (
    <div>
      <h1 className="page-title mb-24">Driver Profile</h1>

      {/* Profile Card */}
      <div className="card mb-20">
        <div className="flex items-center gap-16">
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)', color: 'var(--primary-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, flexShrink: 0
          }}>
            {mockDriver.avatar}
          </div>
          <div className="flex-1">
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{mockDriver.name}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {mockDriver.id} · {mockDriver.role}
            </div>
          </div>
          <button className="btn btn-outline btn-sm">
            <Edit size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-2 gap-20 mb-24">
        <div className="card">
          <div className="card-title mb-16">Personal Information</div>
          <ProfileField icon={<User size={16} />} label="Full Name" value={mockDriver.name} />
          <ProfileField icon={<Phone size={16} />} label="Phone" value={mockDriver.phone} />
          <ProfileField icon={<Shield size={16} />} label="Driver ID" value={mockDriver.id} />
        </div>
        <div className="card">
          <div className="card-title mb-16">Vehicle & Trip</div>
          <ProfileField icon={<Truck size={16} />} label="Vehicle" value={mockDriver.vehicle} />
          <ProfileField icon={<MapPin size={16} />} label="Current Trip" value={mockTrip.id} />
          <ProfileField icon={<Clock size={16} />} label="Driving Today" value={mockTrip.drivingTime} />
        </div>
      </div>

      {/* Stats */}
      <div className="section-title">Performance Summary</div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Trips</span>
          <span className="kpi-value">24</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Safety Score</span>
          <span className="kpi-value" style={{ color: 'var(--success)' }}>98%</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Alerts Received</span>
          <span className="kpi-value">7</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Records Delivered</span>
          <span className="kpi-value">12.4k</span>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ icon, label, value }) => (
  <div className="flex items-center gap-12" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
    <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
    <div className="flex-1">
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value}</div>
    </div>
  </div>
);

export default Profile;
