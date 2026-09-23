const mongoose = require('mongoose');

const ContainerSchema = new mongoose.Schema({
  containerId: { type: String, required: true, unique: true },
  deviceId: { type: String, required: true }, // The ESP32 node ID attached to it
  type: { type: String, default: 'refrigerated' },
  status: { type: String, enum: ['available', 'in_use', 'maintenance'], default: 'available' },
  batteryLevel: { type: Number },
  lastSeen: { type: Date },
  currentShipmentId: { type: String },
  firmwareVersion: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Container', ContainerSchema);
