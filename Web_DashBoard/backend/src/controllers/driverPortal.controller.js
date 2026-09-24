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
    // Find active or scheduled shipment for this driver
    const activeShipment = await Shipment.findOne({ driverId: driver._id, status: { $in: ['scheduled', 'active'] } });
    
    res.json({
      success: true,
      data: {
        driver: {
          id: driver._id,
          name: req.user.name,
          licenseNumber: driver.licenseNumber,
          licenseNumber: driver.licenseNumber,
          phone: driver.phone,
          dutyStatus: driver.dutyStatus,
          dutyStatusUpdatedAt: driver.dutyStatusUpdatedAt
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
    
    const activeShipment = await Shipment.findOne({ driverId: driver._id, status: { $in: ['scheduled', 'active'] } });
    
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

exports.updateDutyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    
    if (!['OFF_DUTY', 'ON_DUTY', 'DRIVING', 'BREAK'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    if (driver.dutyStatus !== status) {
      const now = new Date();
      
      // Close previous log if it exists
      const lastLog = await DriverLog.findOne({ driverId: driver._id, endTime: null }).sort({ startTime: -1 });
      if (lastLog) {
        lastLog.endTime = now;
        lastLog.duration = Math.round((now - lastLog.startTime) / 60000); // minutes
        await lastLog.save();
      }
      
      // Create new log
      const activeShipment = await Shipment.findOne({ driverId: driver._id, status: { $in: ['scheduled', 'active'] } });
      const newLog = new DriverLog({
        driverId: driver._id,
        tripId: activeShipment ? activeShipment.shipmentId : null,
        eventType: status,
        startTime: now,
        source: 'device'
      });
      await newLog.save();
      
      // Update driver
      driver.dutyStatus = status;
      driver.dutyStatusUpdatedAt = now;
      await driver.save();
    }
    
    res.json({ success: true, data: { dutyStatus: driver.dutyStatus, dutyStatusUpdatedAt: driver.dutyStatusUpdatedAt } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params; // shipmentId
    const { status } = req.body; // 'active', 'delivered'
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver profile not found' });
    
    const shipment = await Shipment.findOne({ shipmentId: id, driverId: driver._id });
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
    
    shipment.status = status;
    if (status === 'active' && !shipment.startTime) shipment.startTime = new Date();
    if (status === 'delivered' && !shipment.actualArrival) shipment.actualArrival = new Date();
    await shipment.save();
    
    res.json({ success: true, data: shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    
    alert.acknowledged = true;
    alert.acknowledgedBy = req.user.name;
    alert.acknowledgedAt = new Date();
    await alert.save();
    
    res.json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
