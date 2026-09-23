const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  tempMin: { type: Number, default: 2 },
  tempMax: { type: Number, default: 8 },
  humidityMin: { type: Number, default: 60 },
  humidityMax: { type: Number, default: 80 }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
