import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import DriverLayout from './layouts/DriverLayout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Fleet from './pages/admin/Fleet';
import LiveTelemetry from './pages/admin/LiveTelemetry';
import GasSafety from './pages/admin/GasSafety';
import EnergyBattery from './pages/admin/EnergyBattery';
import NetworkTelemetry from './pages/admin/NetworkTelemetry';
import MQTTConnection from './pages/admin/MQTTConnection';
import Hardware from './pages/admin/Hardware';
import DataFlow from './pages/admin/DataFlow';
import DataIntegrity from './pages/admin/DataIntegrity';
import TamperDetection from './pages/admin/TamperDetection';
import Simulation from './pages/admin/Simulation';
import Alerts from './pages/admin/Alerts';
import Trips from './pages/admin/Trips';
import Settings from './pages/admin/Settings';
import DriverDetails from './pages/admin/DriverDetails';
import AlertRules from './pages/admin/AlertRules';
import LoadConfiguration from './pages/admin/LoadConfiguration';
import LiveLoadTesting from './pages/admin/LiveLoadTesting';
import { TelemetryTable, Logbook as AdminLogbook, Devices, Profile as AdminProfile } from './pages/admin/GenericPages';
import LoadTracking from './pages/admin/LoadTracking';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverAlerts from './pages/driver/DriverAlerts';
import DriverTelemetry from './pages/driver/DriverTelemetry';
import { DriverTrip, DriverLogbook, DriverProfile } from './pages/driver/DriverGenericPages';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/telemetry' : '/driver/dashboard'} replace />;
  }
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/load-tracking" element={<Navigate to="/admin/load-tracking" replace />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="telemetry" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="load-tracking" element={<LoadTracking />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="fleet/:id" element={<DriverDetails />} />
        <Route path="alert-rules" element={<AlertRules />} />
        <Route path="load-config" element={<LoadConfiguration />} />
        <Route path="live-testing" element={<LiveLoadTesting />} />
        <Route path="telemetry" element={<LiveTelemetry />} />
        <Route path="gas-safety" element={<GasSafety />} />
        <Route path="energy" element={<EnergyBattery />} />
        <Route path="network" element={<NetworkTelemetry />} />
        <Route path="mqtt" element={<MQTTConnection />} />
        <Route path="hardware" element={<Hardware />} />
        <Route path="data-flow" element={<DataFlow />} />
        <Route path="integrity" element={<DataIntegrity />} />
        <Route path="tamper" element={<TamperDetection />} />
        <Route path="simulation" element={<Simulation />} />
        <Route path="table" element={<TelemetryTable />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="logbook" element={<AdminLogbook />} />
        <Route path="trips" element={<Trips />} />
        <Route path="devices" element={<Devices />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Driver Routes */}
      <Route path="/driver" element={<ProtectedRoute allowedRole="driver"><DriverLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DriverDashboard />} />
        <Route path="trip" element={<DriverTrip />} />
        <Route path="logbook" element={<DriverLogbook />} />
        <Route path="telemetry" element={<DriverTelemetry />} />
        <Route path="alerts" element={<DriverAlerts />} />
        <Route path="profile" element={<DriverProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
