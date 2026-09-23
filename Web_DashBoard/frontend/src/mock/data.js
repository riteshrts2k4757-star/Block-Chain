/**
 * FarmTrace Mock Data Service
 * 
 * All simulation data is isolated here so it can be replaced
 * with real API/MQTT calls without changing any UI components.
 */

export const mockDriver = {
  id: 'DRIVER001',
  name: 'Rajesh Kumar',
  phone: '+91 9876543210',
  vehicle: 'JH10AB1234',
  role: 'Driver',
  avatar: 'RK',
};

export const mockTrip = {
  id: 'FT-2026-001',
  origin: 'Dhanbad',
  destination: 'Ranchi',
  containerId: 'CONT001',
  status: 'active',
  startTime: '2026-09-21T04:00:00',
  drivingTime: '04h 32m',
  restTime: '01h 15m',
};

export const mockSensors = {
  temperature: { value: 5.8, unit: '°C', status: 'normal', min: 4.2, max: 7.1, threshold: 8.0 },
  humidity:    { value: 82.4, unit: '%', status: 'normal', min: 78, max: 85, threshold: 90 },
  ethylene:    { value: 1.2, unit: 'ppm', status: 'normal', threshold: 5.0 },
  battery:     { value: 87, unit: '%', status: 'normal' },
  vibration:   { value: 0.18, unit: 'g', status: 'normal' },
};

export const mockConnectivity = {
  gateway:  { status: 'connected', ssid: 'FarmTrace_Gateway', ip: '192.168.4.1', signal: 85 },
  mqtt:     { status: 'connected', broker: 'mqtt.farmtrace.com' },
  internet: { status: 'connected' },
  backend:  { status: 'connected' },
};

export const mockSync = {
  total: 1024,
  synced: 1012,
  pending: 12,
  failed: 0,
  lastSync: '12 seconds ago',
};

export const mockAlerts = [
  { id: 1, type: 'danger',  title: 'Temperature Warning', desc: 'Temperature reached 9.8°C at 14:32', time: '2 min ago', action: 'Check refrigeration system.' },
  { id: 2, type: 'warning', title: 'Ethylene Rising', desc: 'Ethylene level increased to 3.1 ppm', time: '18 min ago', action: 'Monitor produce condition.' },
  { id: 3, type: 'warning', title: 'Gateway Signal Weak', desc: 'Signal strength dropped below 40%', time: '45 min ago', action: 'Move closer to gateway.' },
  { id: 4, type: 'success', title: 'Data Synchronized', desc: 'All 1,012 records verified on backend', time: '1 hour ago', action: null },
];

export const mockLogbook = [
  { id: 1, time: '14:20', type: 'active',  title: 'Delivery Checkpoint', desc: 'Arrived at checkpoint B' },
  { id: 2, time: '12:15', type: 'active',  title: 'Driving', desc: 'Resumed driving after rest' },
  { id: 3, time: '11:30', type: 'warning', title: 'Rest', desc: 'Rest period — 45 minutes' },
  { id: 4, time: '09:45', type: 'active',  title: 'Driving', desc: 'Started driving — Highway NH-2' },
  { id: 5, time: '08:10', type: 'active',  title: 'Vehicle Inspection', desc: 'All systems clear' },
  { id: 6, time: '08:00', type: 'active',  title: 'Trip Started', desc: 'Origin: Dhanbad warehouse' },
];

export const mockTrips = [
  { id: 'FT-2026-001', origin: 'Dhanbad', destination: 'Ranchi', status: 'active', driver: 'Rajesh Kumar', container: 'CONT001', date: '21 Sep 2026', alerts: 2, records: 1024 },
  { id: 'FT-2026-000', origin: 'Kolkata', destination: 'Dhanbad', status: 'completed', driver: 'Rajesh Kumar', container: 'CONT001', date: '18 Sep 2026', alerts: 0, records: 2048 },
];

export const mockBlockchain = {
  totalRecords: 4821,
  verified: 4809,
  pending: 12,
  integrityStatus: 'verified',
  latestHash: 'a84d91c7f2e836b1a04d...',
  previousHash: '72c9a1e38f5bd204c8a2...',
};

// Generate temperature chart data
export function generateChartData(points = 30) {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    time: new Date(now - (points - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: 5 + Math.random() * 3 + Math.sin(i / 5) * 0.5,
    humidity: 78 + Math.random() * 8,
    ethylene: 0.8 + Math.random() * 1.5,
  }));
}
