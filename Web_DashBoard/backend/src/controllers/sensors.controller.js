const SensorRecord = require('../models/SensorRecord');

exports.receiveData = async (req, res) => {
  res.json({ success: true, message: 'Sensor data received' });
};

exports.receiveBatchData = async (req, res) => {
  try {
    const { deviceId, records } = req.body;
    if (!deviceId || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid payload' } });
    }

    let accepted = 0;
    let rejected = 0;
    let failedSequences = [];
    
    const SystemSettings = require('../models/SystemSettings');
    const LoadProfile = require('../models/LoadProfile');
    const Alert = require('../models/Alert');
    
    // Fetch active LoadProfile, fallback to SystemSettings if none exists
    const activeProfile = await LoadProfile.findOne({ isActive: true });
    let settings;
    if (activeProfile) {
      settings = activeProfile;
    } else {
      settings = (await SystemSettings.findOne()) || { tempMin: 2, tempMax: 8, humidityMin: 60, humidityMax: 80 };
    }

    // Helper for debouncing alerts
    const handleAlert = async (type, severity, message, sensorValue, threshold, shipmentId, containerId, deviceId) => {
      // Find unresolved alert of same type and device
      const existingAlert = await Alert.findOne({ deviceId, type, status: 'active' }).sort({ timestamp: -1 });
      if (existingAlert) {
        // Just update timestamp and value
        existingAlert.sensorValue = sensorValue;
        existingAlert.timestamp = new Date();
        existingAlert.severity = severity; // severity might escalate from warning to critical
        await existingAlert.save();
      } else {
        await Alert.create({ shipmentId, containerId, deviceId, type, severity, message, sensorValue, threshold, timestamp: new Date(), status: 'active' });
      }
    };
    
    const resolveAlert = async (type, deviceId) => {
      await Alert.updateMany({ deviceId, type, status: 'active' }, { status: 'resolved', resolvedAt: new Date() });
    };

    for (const record of records) {
      try {
        const existing = await SensorRecord.findOne({ deviceId, sequence: record.sequence });
        if (!existing) {
          await SensorRecord.create({
            deviceId, containerId: record.containerId, shipmentId: record.shipmentId, sequence: record.sequence,
            timestamp: record.timestamp, temperature: record.temperature, humidity: record.humidity,
            ethylene: record.ethylene, battery: record.battery, syncStatus: 'synced'
          });
          accepted++;
          
          // --- Threshold Checking with Warning Margins ---
          // Warning margin = 10% of the allowed range
          const tempRange = settings.tempMax - settings.tempMin;
          const tempMargin = tempRange > 0 ? tempRange * 0.1 : 0;
          
          const humRange = settings.humidityMax - settings.humidityMin;
          const humMargin = humRange > 0 ? humRange * 0.1 : 0;

          // Temperature
          if (record.temperature > settings.tempMax) {
            await handleAlert('TEMPERATURE_HIGH', 'critical', `Temperature is above the configured maximum (${settings.tempMax}°C)`, record.temperature, settings.tempMax, record.shipmentId, record.containerId, deviceId);
          } else if (record.temperature > (settings.tempMax - tempMargin)) {
            await handleAlert('TEMPERATURE_HIGH', 'warning', `Temperature is approaching maximum limit (${settings.tempMax}°C)`, record.temperature, settings.tempMax, record.shipmentId, record.containerId, deviceId);
          } else if (record.temperature < settings.tempMin) {
            await handleAlert('TEMPERATURE_LOW', 'critical', `Temperature is below the configured minimum (${settings.tempMin}°C)`, record.temperature, settings.tempMin, record.shipmentId, record.containerId, deviceId);
          } else if (record.temperature < (settings.tempMin + tempMargin)) {
            await handleAlert('TEMPERATURE_LOW', 'warning', `Temperature is approaching minimum limit (${settings.tempMin}°C)`, record.temperature, settings.tempMin, record.shipmentId, record.containerId, deviceId);
          } else {
            // Normal
            await resolveAlert('TEMPERATURE_HIGH', deviceId);
            await resolveAlert('TEMPERATURE_LOW', deviceId);
          }
          
          // Humidity
          if (record.humidity > settings.humidityMax) {
            await handleAlert('HUMIDITY_HIGH', 'critical', `Humidity is above the configured maximum (${settings.humidityMax}%)`, record.humidity, settings.humidityMax, record.shipmentId, record.containerId, deviceId);
          } else if (record.humidity > (settings.humidityMax - humMargin)) {
            await handleAlert('HUMIDITY_HIGH', 'warning', `Humidity is approaching maximum limit (${settings.humidityMax}%)`, record.humidity, settings.humidityMax, record.shipmentId, record.containerId, deviceId);
          } else if (record.humidity < settings.humidityMin) {
            await handleAlert('HUMIDITY_LOW', 'critical', `Humidity is below the configured minimum (${settings.humidityMin}%)`, record.humidity, settings.humidityMin, record.shipmentId, record.containerId, deviceId);
          } else if (record.humidity < (settings.humidityMin + humMargin)) {
            await handleAlert('HUMIDITY_LOW', 'warning', `Humidity is approaching minimum limit (${settings.humidityMin}%)`, record.humidity, settings.humidityMin, record.shipmentId, record.containerId, deviceId);
          } else {
            // Normal
            await resolveAlert('HUMIDITY_HIGH', deviceId);
            await resolveAlert('HUMIDITY_LOW', deviceId);
          }

        } else {
          accepted++;
        }
      } catch (err) {
        console.error(err);
        rejected++;
        failedSequences.push(record.sequence);
      }
    }

    res.json({
      success: true,
      accepted,
      rejected,
      failedSequences
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getDeviceData = async (req, res) => {
  try {
    const records = await SensorRecord.find({ deviceId: req.params.deviceId }).sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
