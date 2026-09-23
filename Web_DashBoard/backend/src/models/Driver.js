const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  licenseNumber: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'on_trip'], default: 'active' },
  currentTripId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Driver', DriverSchema);
