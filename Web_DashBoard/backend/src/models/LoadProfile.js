const mongoose = require('mongoose');

const LoadProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  tempMin: { type: Number, required: true },
  tempMax: { type: Number, required: true },
  humidityMin: { type: Number, required: true },
  humidityMax: { type: Number, required: true },
  handlingType: { type: String, required: true },
  isActive: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('LoadProfile', LoadProfileSchema);
