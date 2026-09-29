const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true },
  containerId: { type: String, required: true },
  deviceId: { type: String, required: true },
  type: { type: String, enum: [
    'TEMPERATURE_HIGH', 'TEMPERATURE_LOW',
    'HUMIDITY_HIGH', 'HUMIDITY_LOW',
    'ETHYLENE_HIGH', 'LOW_BATTERY',
    'TAMPER_DETECTED', 'GATEWAY_DISCONNECTED', 'SYNC_FAILED',
    'ALCOHOL_MODERATE', 'ALCOHOL_CRITICAL'
  ], required: true },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'warning' },
  message: { type: String, required: true },
  sensorValue: { type: mongoose.Schema.Types.Mixed },
  threshold: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, required: true },
  status: { type: String, enum: ['active', 'resolved', 'acknowledged'], default: 'active' },
  resolvedAt: { type: Date },
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: { type: Date },
}, { timestamps: true });

AlertSchema.index({ shipmentId: 1, timestamp: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
