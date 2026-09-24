const Driver = require('../models/Driver');
const Shipment = require('../models/Shipment');
const DriverLog = require('../models/DriverLog');
const Alert = require('../models/Alert');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    
    // Find active shipment for this driver
    const activeShipment = await Shipment.findOne({ driverId: driver._id, status: 'active' });
    
    res.json({
      success: true,
      data: {
        driver: {
          id: driver._id,
          name: req.user.name,
          licenseNumber: driver.licenseNumber,
          phone: driver.phone
        },
        currentTrip: activeShipment || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCurrentTrip = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    
    const activeShipment = await Shipment.findOne({ driverId: driver._id, status: 'active' });
    
    res.json({
      success: true,
      data: activeShipment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLogbook = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    
    const logs = await DriverLog.find({ driverId: driver._id }).sort({ startTime: -1 }).limit(50);
    
    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    
    // Get all shipments for this driver
    const shipments = await Shipment.find({ driverId: driver._id });
    const shipmentIds = shipments.map(s => s.shipmentId);
    
    const alerts = await Alert.find({ shipmentId: { $in: shipmentIds } }).sort({ timestamp: -1 }).limit(50);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id }).populate('userId', 'name email role');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    
    res.json({
      success: true,
      data: {
        _id: driver._id,
        name: driver.userId.name,
        email: driver.userId.email,
        licenseNumber: driver.licenseNumber,
        phone: driver.phone,
        status: driver.status,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    
    if (phone) {
      driver.phone = phone;
      await driver.save();
    }
    
    if (name) {
      const user = await User.findById(req.user._id);
      user.name = name;
      await user.save();
    }
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    
    const shipments = await Shipment.find({ driverId: driver._id, status: 'active' });
    const shipmentIds = shipments.map(s => s.shipmentId);
    
    // Unacknowledged alerts for active shipments
    const notifications = await Alert.find({ 
      shipmentId: { $in: shipmentIds },
      acknowledged: false 
    }).sort({ timestamp: -1 });
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
