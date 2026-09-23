const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
