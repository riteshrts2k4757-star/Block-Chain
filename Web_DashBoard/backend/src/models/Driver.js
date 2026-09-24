const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  licenseNumber: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'on_trip'], default: 'active' },
  dutyStatus: { type: String, enum: ['OFF_DUTY', 'ON_DUTY', 'DRIVING', 'BREAK'], default: 'OFF_DUTY' },
  dutyStatusUpdatedAt: { type: Date, default: Date.now },
  currentTripId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Driver', DriverSchema);
