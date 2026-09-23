import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Activity, FileText, Map, User } from 'lucide-react';
import './MobileFrame.css';

const tabs = [
  { path: '/mobile',          icon: Home,     label: 'Home' },
  { path: '/mobile/monitor',  icon: Activity, label: 'Monitor' },
  { path: '/mobile/logbook',  icon: FileText, label: 'Logbook' },
  { path: '/mobile/trips',    icon: Map,      label: 'Trips' },
  { path: '/mobile/profile',  icon: User,     label: 'Profile' },
];

/** Shared bottom tab bar — used in both desktop preview and native mode */
const TabBar = () => (
  <nav className="mobile-tab-bar" role="navigation" aria-label="App navigation">
    {tabs.map(tab => {
      const Icon = tab.icon;
      return (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.path === '/mobile'}
          className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}
          aria-label={tab.label}
        >
          <Icon size={22} />
          <span>{tab.label}</span>
        </NavLink>
      );
    })}
  </nav>
);

/**
 * MobileFrame
 *
 * native=false (default, on browser/desktop):
 *   Shows simulated phone shell around content — useful for demos and development.
 *
 * native=true (on real Android via Capacitor):
 *   Renders content + tab bar directly full-screen.
 *   The device itself IS the phone, no fake chrome needed.
 */
const MobileFrame = ({ children, native = false }) => {
  if (native) {
    return (
      <div className="native-shell">
        <div className="native-screen-content">
          {children}
        </div>
        <TabBar />
        {/* Safe area spacer for gesture nav bar on Android */}
        <div className="native-bottom-spacer" aria-hidden="true" />
      </div>
    );
  }

  // Desktop browser preview: simulated phone frame
  return (
    <div className="mobile-preview-bg">
      <div className="mobile-frame" role="presentation">
        {/* Dynamic Island / Notch */}
        <div className="mobile-notch" aria-hidden="true">
          <div className="mobile-notch-pill" />
        </div>

        {/* Screen Content */}
        <div className="mobile-screen-content">
          {children}
        </div>

        {/* Bottom Tab Bar */}
        <TabBar />

        {/* Home Indicator */}
        <div className="mobile-home-indicator" aria-hidden="true">
          <div className="mobile-home-pill" />
        </div>
      </div>
    </div>
  );
};

export default MobileFrame;
