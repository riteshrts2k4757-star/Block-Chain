const Driver = require('../models/Driver');
const User = require('../models/User');

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('userId', 'name email phone');
    if (drivers.length > 0) {
      // Map to frontend expected format
      const mapped = drivers.map(d => ({
        truckId: 'FT-TRK-' + d._id.toString().substring(18),
        containerId: 'FT-CNT-' + d._id.toString().substring(18),
        driver: {
          name: d.userId?.name || 'Unknown',
          id: d._id,
          phone: d.phone,
          avatar: d.userId?.name ? d.userId.name.substring(0, 2).toUpperCase() : 'DR'
        },
        route: { origin: 'Dhanbad', destination: 'Ranchi', distance: '155 km', eta: '2h 45m' },
        status: d.status,
        plate: d.licenseNumber
      }));
      return res.json({ success: true, data: mapped });
    }
    
    // Fallback to mock data if DB is empty to ensure UI works
    const mockFleet = [
      {
        truckId: 'FT-TRK-001', containerId: 'FT-CNT-001',
        driver: { name: 'Rajesh Kumar', id: 'DRV-001', phone: '+91 9876543210', avatar: 'RK' },
        route: { origin: 'Dhanbad', destination: 'Ranchi', distance: '155 km', eta: '2h 45m' },
        status: 'active', plate: 'JH10AB1234'
      },
      {
        truckId: 'FT-TRK-002', containerId: 'FT-CNT-002',
        driver: { name: 'Suresh Patel', id: 'DRV-002', phone: '+91 9876543211', avatar: 'SP' },
        route: { origin: 'Kolkata', destination: 'Patna', distance: '580 km', eta: '8h 30m' },
        status: 'active', plate: 'WB05CD5678'
      }
    ];
    res.json({ success: true, data: mockFleet });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getDriverTelemetry = async (req, res) => {
  try {
    // Generate mock historical telemetry data for the graphs
    const data = [];
    let now = Date.now();
    for (let i = 20; i >= 0; i--) {
      data.push({
        time: new Date(now - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temperature: parseFloat((4 + Math.random() * 4).toFixed(1)),
        humidity: parseFloat((65 + Math.random() * 15).toFixed(1)),
        mq6: Math.round(300 + Math.random() * 100),
        mq3: Math.round(100 + Math.random() * 50),
        vibration: parseFloat((0.01 + Math.random() * 0.05).toFixed(3))
      });
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
