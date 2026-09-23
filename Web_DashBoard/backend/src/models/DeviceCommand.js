const mongoose = require('mongoose');

const DeviceCommandSchema = new mongoose.Schema({
  commandId: { type: String, required: true, unique: true },
  deviceId: { type: String, required: true }, // The target container ESP32
  command: { type: String, required: true },  // e.g., REQUEST_BATTERY, SET_INTERVAL
  parameters: { type: mongoose.Schema.Types.Mixed },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'acknowledged', 'failed', 'timeout'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date },
  acknowledgedAt: { type: Date },
  response: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('DeviceCommand', DeviceCommandSchema);
