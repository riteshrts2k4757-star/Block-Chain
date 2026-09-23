const DriverLog = require('../models/DriverLog');

exports.getDriverLogs = async (req, res) => {
  try {
    const logs = await DriverLog.find({ driverId: req.params.driverId }).sort({ startTime: -1 });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.createDriverLog = async (req, res) => {
  try {
    const log = await DriverLog.create(req.body);
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
