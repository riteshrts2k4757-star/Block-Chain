const mongoose = require('mongoose');

const DriverLogSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  tripId: { type: String, required: true },
  eventType: { type: String, enum: ['driving', 'rest', 'break', 'delivery', 'checkpoint', 'manual'], required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number }, // in minutes
  notes: { type: String },
  source: { type: String, enum: ['manual', 'device', 'system'], default: 'manual' },
}, { timestamps: true });

DriverLogSchema.index({ driverId: 1, startTime: -1 });

module.exports = mongoose.model('DriverLog', DriverLogSchema);
