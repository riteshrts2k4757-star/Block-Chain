const Shipment = require('../models/Shipment');

exports.getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find().populate('driverId');
    res.json({ success: true, data: shipments });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
