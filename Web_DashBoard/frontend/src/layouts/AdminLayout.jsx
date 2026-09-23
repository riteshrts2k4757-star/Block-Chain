import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Truck, Activity, Bell, Settings, Shield, 
  Database, AlertTriangle, Menu, X, Leaf, Zap, Wifi,
  CheckCircle, Radio, LogOut, Clock, Link as LinkIcon, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTelemetry } from '../context/TelemetryContext';
import { useAlerts } from '../context/AlertContext';
import { NotificationPanel } from '../components/common/NotificationPanel';
import { DataSourceIndicator } from '../components/common/StatusBadge';

const adminNavItems = [
  { section: 'Overview' },
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/fleet', label: 'Fleet Status', icon: Truck },
  
  { section: 'Monitoring' },
  { path: '/admin/telemetry', label: 'Live Telemetry', icon: Activity },
  { path: '/admin/gas-safety', label: 'Gas & Safety', icon: Zap },
  { path: '/admin/energy', label: 'Energy & Battery', icon: Battery },
  { path: '/admin/network', label: 'Network Telemetry', icon: Wifi },
  
  { section: 'Operations' },
  { path: '/admin/load-config', label: 'Load Configuration', icon: Package },
  { path: '/admin/live-testing', label: 'Live Load Testing', icon: Activity },
  { path: '/admin/trips', label: 'Trips', icon: Route },
  { path: '/admin/logbook', label: 'Logbook', icon: Clock },
  { path: '/admin/alerts', label: 'Alerts', icon: AlertTriangle, badge: true },
  
  { section: 'Security' },
  { path: '/admin/integrity', label: 'Data Integrity', icon: Shield },
  { path: '/admin/tamper', label: 'Tamper Detection', icon: ShieldAlert },
  
  { section: 'System' },
  { path: '/admin/mqtt', label: 'MQTT Connection', icon: LinkIcon },
  { path: '/admin/hardware', label: 'Hardware', icon: Cpu },
  { path: '/admin/devices', label: 'Devices', icon: Radio },
  { path: '/admin/simulation', label: 'Simulation', icon: PlayCircle },
  { path: '/admin/alert-rules', label: 'Alert Rules', icon: AlertTriangle },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

// Re-importing missing icons directly here to avoid large imports at top
import { Route, ShieldAlert, Cpu, PlayCircle, Battery } from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { mqttStatus, dataSource } = useTelemetry();
  const { unreadCount } = useAlerts();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isMqttConnected = mqttStatus === 'connected';

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 35, backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand" style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>FarmTrace</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Admin Console</div>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ padding: '0 12px' }}>
          {adminNavItems.map((item, i) => {
            if (item.section) {
              return <div key={`s-${i}`} style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '24px 8px 8px 8px' }}>{item.section}</div>;
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
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
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-hover)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              {user?.avatar || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Administrator</div>
            </div>
          </div>
          
          <button onClick={handleLogout} className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-area">
        <header className="top-bar">
          <div className="top-bar-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-ghost" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 8 }} ref={el => { if (el) el.style.display = window.innerWidth <= 1024 ? 'flex' : 'none'; }}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, color: isMqttConnected ? 'var(--success)' : 'var(--danger)', background: isMqttConnected ? 'var(--success-bg)' : 'var(--danger-bg)', padding: '6px 12px', borderRadius: '20px' }}>
              {isMqttConnected ? <CheckCircle size={14} /> : <X size={14} />}
              {isMqttConnected ? 'MQTT Connected' : 'MQTT Offline'}
            </div>
            
            <DataSourceIndicator source={dataSource} />
          </div>

          <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button 
              className="notification-btn" 
              onClick={() => setNotificationsOpen(true)}
              style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--danger)', color: 'white', width: 18, height: 18, borderRadius: '50%', fontSize: '0.6875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-main)' }}>
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

        <main className="page-content" style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </main>
      </div>

      <NotificationPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
