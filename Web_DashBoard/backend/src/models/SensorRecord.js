const mongoose = require('mongoose');

const SensorRecordSchema = new mongoose.Schema({
  deviceType: { type: String, enum: ['driver', 'container'], default: 'container' },
  deviceId: { type: String, required: true },
  containerId: { type: String, required: true },
  shipmentId: { type: String, required: true },
  sequence: { type: Number },
  timestamp: { type: Date, required: true },
  temperature: { type: Number },
  humidity: { type: Number },
  ethylene: { type: Number },
  mq6: { type: Number }, // Phase 3: Raw gas sensor reading
  battery: { type: Number },
  solarVoltage: { type: Number }, // Phase 3
  latitude: { type: Number },
  longitude: { type: Number },
  vibration: { type: Number },

  // Phase 3: Driver-side Gateway Sensors
  mpu6050: {
    motionX: { type: Number },
    motionY: { type: Number },
    motionZ: { type: Number }
  },
  mq3: { type: Number }, // Phase 3: Raw alcohol sensor

  tamper: { type: Boolean, default: false },

  // Data Integrity
  previousHash: { type: String, default: '0000000000000000000000000000000000000000000000000000000000000000' },
  hash: { type: String, required: true },
  syncStatus: { type: String, enum: ['pending', 'synced', 'verified', 'failed'], default: 'synced' },
}, { timestamps: true });

// Ensure idempotency: deviceId + sequence must be unique
SensorRecordSchema.index({ deviceId: 1, sequence: 1 }, { unique: true, sparse: true });
SensorRecordSchema.index({ deviceId: 1, timestamp: -1 });
SensorRecordSchema.index({ containerId: 1, timestamp: -1 });
SensorRecordSchema.index({ shipmentId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorRecord', SensorRecordSchema);
