import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Route, Clock, AlertTriangle, User, LogOut, Menu, X, Leaf, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DriverNotificationPanel } from '../components/driver/DriverNotificationPanel';
import { driverPortalService } from '../services/driverPortal';

const driverNavItems = [
  { path: '/driver/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/driver/trip', label: 'Current Trip', icon: Route },
  { path: '/driver/logbook', label: 'Logbook', icon: Clock },
  { path: '/driver/alerts', label: 'Alerts', icon: AlertTriangle, badge: true },
  { path: '/driver/profile', label: 'Profile', icon: User },
];

export default function DriverLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell driver-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 35, backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Driver Sidebar (Usually hidden on mobile, shown on tablet/desktop) */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand" style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>FarmTrace</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Driver App</div>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ padding: '20px 12px' }}>
          {driverNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                style={{ padding: '12px 16px', fontSize: '1rem', marginBottom: '8px' }}
              >
                <Icon size={20} />
                {item.label}
                {item.badge && unreadCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              {user?.avatar || 'D'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{user?.truckId}</div>
            </div>
          </div>
          
          <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-area" style={{ background: 'var(--bg-main)' }}>
        <header className="top-bar" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <div className="top-bar-left">
            <button className="btn-ghost" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 8 }} ref={el => { if (el) el.style.display = window.innerWidth <= 1024 ? 'flex' : 'none'; }}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.truckId || 'My Truck'}
            </div>
          </div>

          <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="notification-btn" 
              onClick={() => setNotificationsOpen(true)}
              style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px' }}
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 4, background: 'var(--danger)', color: 'white', width: 18, height: 18, borderRadius: '50%', fontSize: '0.6875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-card)' }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={handleLogout} 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.875rem' }}
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </header>

        <main className="page-content" style={{ padding: '16px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </main>
      </div>

      <DriverNotificationPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} onCountUpdate={setUnreadCount} />
    </div>
  );
}
