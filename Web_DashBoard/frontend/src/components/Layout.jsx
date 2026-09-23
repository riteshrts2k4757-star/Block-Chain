import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Truck, FileText, Activity, 
  Bell, Settings, Shield, Database, AlertTriangle, 
  Menu, X, Radio
} from 'lucide-react';
import { mockDriver, mockSync, mockAlerts, mockConnectivity } from '../mock/data';

const navItems = [
  { section: 'Overview' },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/shipments', label: 'Shipments', icon: Truck },
  { path: '/monitor',   label: 'Live Data',  icon: Activity },

  { section: 'Operations' },
  { path: '/logbook',   label: 'Logbook',    icon: FileText },
  { path: '/alerts',    label: 'Alerts',     icon: AlertTriangle, badge: mockAlerts.filter(a => a.type === 'danger' || a.type === 'warning').length },
  { path: '/gateway',   label: 'Gateway',    icon: Radio },

  { section: 'System' },
  { path: '/blockchain', label: 'Data Integrity', icon: Shield },
  { path: '/settings',   label: 'Settings',       icon: Settings },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const gatewayOnline = mockConnectivity.gateway.status === 'connected';
  const hasPending = mockSync.pending > 0;

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 35 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">FT</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">FarmTrace</span>
            <span className="sidebar-brand-sub">Smart Farm-to-Fork Traceability</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div className="sidebar-section-label" key={`s-${i}`}>{item.section}</div>;
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon />
                {item.label}
                {item.badge > 0 && <span className="link-badge">{item.badge}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/profile" className="sidebar-profile" onClick={() => setSidebarOpen(false)}>
            <div className="sidebar-avatar">{mockDriver.avatar}</div>
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">{mockDriver.name}</span>
              <span className="sidebar-profile-role">{mockDriver.id} · {mockDriver.role}</span>
            </div>
          </NavLink>
          
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.hash = '/login';
            }} 
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '10px',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '13px'
            }}
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-area">
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="btn-ghost" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none', padding: 8 }}
              ref={el => { if (el) el.style.display = window.innerWidth <= 1024 ? 'flex' : 'none'; }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className={`connection-indicator ${gatewayOnline ? '' : 'error'}`}>
              <span className="connection-dot" />
              {gatewayOnline ? 'Gateway Connected' : 'Gateway Offline'}
            </div>

            {hasPending && (
              <div className="sync-bar pending" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
                <Database size={14} />
                {mockSync.pending} records pending sync
              </div>
            )}
          </div>

          <div className="top-bar-right">
            <span className="sim-badge">⚡ Simulation</span>

            <button className="notification-btn" aria-label="Notifications">
              <Bell size={20} />
              {mockAlerts.length > 0 && <span className="notification-count">{mockAlerts.length}</span>}
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
