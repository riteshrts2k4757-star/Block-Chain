/**
 * FarmTrace Fleet & Mock Data
 * 4 trucks, 4 containers, realistic demo data
 */

export const fleet = [
  {
    truckId: 'FT-TRK-001',
    containerId: 'FT-CNT-001',
    driver: { name: 'Rajesh Kumar', id: 'DRV-001', phone: '+91 9876543210', avatar: 'RK' },
    route: { origin: 'Dhanbad', destination: 'Ranchi', distance: '155 km', eta: '2h 45m' },
    status: 'active',
    plate: 'JH10AB1234',
  },
  {
    truckId: 'FT-TRK-002',
    containerId: 'FT-CNT-002',
    driver: { name: 'Suresh Patel', id: 'DRV-002', phone: '+91 9876543211', avatar: 'SP' },
    route: { origin: 'Kolkata', destination: 'Patna', distance: '580 km', eta: '8h 30m' },
    status: 'active',
    plate: 'WB05CD5678',
  },
  {
    truckId: 'FT-TRK-003',
    containerId: 'FT-CNT-003',
    driver: { name: 'Amit Sharma', id: 'DRV-003', phone: '+91 9876543212', avatar: 'AS' },
    route: { origin: 'Jamshedpur', destination: 'Bokaro', distance: '130 km', eta: '2h 10m' },
    status: 'active',
    plate: 'JH04EF9012',
  },
  {
    truckId: 'FT-TRK-004',
    containerId: 'FT-CNT-004',
    driver: { name: 'Deepak Singh', id: 'DRV-004', phone: '+91 9876543213', avatar: 'DS' },
    route: { origin: 'Ranchi', destination: 'Hazaribagh', distance: '95 km', eta: '1h 45m' },
    status: 'en-route',
    plate: 'JH01GH3456',
  },
];

export const trips = [
  { id: 'FT-2026-001', truckId: 'FT-TRK-001', origin: 'Dhanbad', destination: 'Ranchi', status: 'active', driver: 'Rajesh Kumar', container: 'FT-CNT-001', date: '24 Sep 2026', alerts: 2, records: 1024, progress: 65 },
  { id: 'FT-2026-002', truckId: 'FT-TRK-002', origin: 'Kolkata', destination: 'Patna', status: 'active', driver: 'Suresh Patel', container: 'FT-CNT-002', date: '24 Sep 2026', alerts: 0, records: 856, progress: 35 },
  { id: 'FT-2026-003', truckId: 'FT-TRK-003', origin: 'Jamshedpur', destination: 'Bokaro', status: 'active', driver: 'Amit Sharma', container: 'FT-CNT-003', date: '24 Sep 2026', alerts: 1, records: 512, progress: 80 },
  { id: 'FT-2026-004', truckId: 'FT-TRK-004', origin: 'Ranchi', destination: 'Hazaribagh', status: 'en-route', driver: 'Deepak Singh', container: 'FT-CNT-004', date: '24 Sep 2026', alerts: 0, records: 256, progress: 20 },
  { id: 'FT-2026-000', truckId: 'FT-TRK-001', origin: 'Kolkata', destination: 'Dhanbad', status: 'completed', driver: 'Rajesh Kumar', container: 'FT-CNT-001', date: '18 Sep 2026', alerts: 0, records: 2048, progress: 100 },
];

export const logbookEntries = [
  { id: 1, time: '14:20', type: 'checkpoint', title: 'Delivery Checkpoint', desc: 'Arrived at checkpoint B', truckId: 'FT-TRK-001' },
  { id: 2, time: '12:15', type: 'driving', title: 'Driving', desc: 'Resumed driving after rest', truckId: 'FT-TRK-001' },
  { id: 3, time: '11:30', type: 'rest', title: 'Rest Period', desc: 'Rest period — 45 minutes', truckId: 'FT-TRK-001' },
  { id: 4, time: '09:45', type: 'driving', title: 'Driving', desc: 'Started driving — Highway NH-2', truckId: 'FT-TRK-001' },
  { id: 5, time: '08:10', type: 'inspection', title: 'Vehicle Inspection', desc: 'All systems clear', truckId: 'FT-TRK-001' },
  { id: 6, time: '08:00', type: 'trip_started', title: 'Trip Started', desc: 'Origin: Dhanbad warehouse', truckId: 'FT-TRK-001' },
];

export const devices = [
  { id: 'ESP8266-DRV-001', type: 'Driver Node', mcu: 'ESP8266', sensors: ['MQ3', 'MPU6050', 'Temperature'], truck: 'FT-TRK-001', status: 'online', firmware: 'v2.1.0', lastSeen: 'Just now' },
  { id: 'ESP32-CNT-001', type: 'Container Node', mcu: 'ESP32', sensors: ['MQ6', 'DHT22', 'Temperature', 'Humidity'], container: 'FT-CNT-001', status: 'online', firmware: 'v2.1.0', lastSeen: 'Just now' },
  { id: 'ESP8266-DRV-002', type: 'Driver Node', mcu: 'ESP8266', sensors: ['MQ3', 'MPU6050', 'Temperature'], truck: 'FT-TRK-002', status: 'online', firmware: 'v2.0.8', lastSeen: '2s ago' },
  { id: 'ESP32-CNT-002', type: 'Container Node', mcu: 'ESP32', sensors: ['MQ6', 'DHT22', 'Temperature', 'Humidity'], container: 'FT-CNT-002', status: 'online', firmware: 'v2.0.8', lastSeen: '3s ago' },
  { id: 'ESP8266-DRV-003', type: 'Driver Node', mcu: 'ESP8266', sensors: ['MQ3', 'MPU6050', 'Temperature'], truck: 'FT-TRK-003', status: 'online', firmware: 'v2.1.0', lastSeen: '5s ago' },
  { id: 'ESP32-CNT-003', type: 'Container Node', mcu: 'ESP32', sensors: ['MQ6', 'DHT22', 'Temperature', 'Humidity'], container: 'FT-CNT-003', status: 'offline', firmware: 'v2.0.5', lastSeen: '12m ago' },
  { id: 'ESP8266-DRV-004', type: 'Driver Node', mcu: 'ESP8266', sensors: ['MQ3', 'MPU6050', 'Temperature'], truck: 'FT-TRK-004', status: 'online', firmware: 'v2.1.0', lastSeen: '1s ago' },
  { id: 'ESP32-CNT-004', type: 'Container Node', mcu: 'ESP32', sensors: ['MQ6', 'DHT22', 'Temperature', 'Humidity'], container: 'FT-CNT-004', status: 'online', firmware: 'v2.1.0', lastSeen: '2s ago' },
];

// Generate hash chain blocks
export function generateHashChain(count = 10) {
  const blocks = [];
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 1; i <= count; i++) {
    const data = `seq:${i}|temp:${(4 + Math.random() * 4).toFixed(1)}|hum:${(65 + Math.random() * 15).toFixed(1)}|mq6:${Math.round(300 + Math.random() * 100)}|ts:${Date.now() - (count - i) * 5000}`;
    // Simulate SHA-256 hash (shortened for display)
    const hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    blocks.push({
      blockNumber: i,
      sequence: i,
      timestamp: new Date(Date.now() - (count - i) * 5000).toISOString(),
      data,
      dataHash: hash,
      previousHash: prevHash,
      currentHash: hash,
      device: i % 2 === 0 ? 'Container ESP32' : 'Driver ESP8266',
      verified: true,
    });
    prevHash = hash;
  }
  return blocks;
}
