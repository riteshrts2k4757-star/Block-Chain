const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  containerId: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'active', 'delivered', 'cancelled'], default: 'scheduled' },
  startTime: { type: Date },
  estimatedArrival: { type: Date },
  actualArrival: { type: Date },
}, { timestamps: true });

ShipmentSchema.index({ status: 1 });
ShipmentSchema.index({ driverId: 1 });

module.exports = mongoose.model('Shipment', ShipmentSchema);
