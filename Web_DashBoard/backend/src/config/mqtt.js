const mqtt = require('mqtt');
const crypto = require('crypto');
const SensorRecord = require('../models/SensorRecord');

let client;

/**
 * Compute SHA-256 hash of a string
 */
function sha256(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

const connectMQTT = (io) => {
  const brokerUrl = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io:1883';
  
  console.log(`Connecting to MQTT broker: ${brokerUrl}`);
  
  client = mqtt.connect(brokerUrl, {
    clientId: `farmtrace-backend-${Math.random().toString(16).substring(2, 10)}`,
    reconnectPeriod: 5000,
  });

  client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    client.subscribe('farmtrace/+/data', (err) => {
      if (!err) {
        console.log('Subscribed to farmtrace/+/data');
      } else {
        console.error('MQTT Subscription Error:', err);
      }
    });
    client.subscribe('farmtrace/+/status', (err) => {
      if (!err) {
        console.log('Subscribed to farmtrace/+/status');
      }
    });
    client.subscribe('farmtrace/+/integrity', (err) => {
      if (!err) {
        console.log('Subscribed to farmtrace/+/integrity');
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      let data;
      const rawString = message.toString();
      try {
        data = JSON.parse(rawString);
      } catch (err) {
        data = { status: rawString };
      }

      // Emit to Socket.io clients
      if (io) {
        if (topic.endsWith('driver/data')) {
          io.emit('farmtrace:driver:data', data);
        } else if (topic.endsWith('container/data')) {
          io.emit('farmtrace:container:data', data);
        } else if (topic.endsWith('status')) {
          io.emit('farmtrace:status', data);
        } else if (topic.endsWith('container/integrity')) {
          io.emit('farmtrace:container:integrity', data);
        }
      }

      // Ignore status messages for DB insertion (or add logic if needed)
      if (topic.endsWith('status')) return;

      // Handle integrity messages — update existing record with hash chain data
      if (topic.endsWith('integrity')) {
        await handleIntegrityMessage(data, io);
        return;
      }

      // Extract deviceType from topic: farmtrace/{deviceType}/data
      const parts = topic.split('/');
      const deviceType = parts[1]; // 'driver' or 'container'

      // Compute server-side SHA-256 hash of the raw payload
      const serverDataHash = sha256(rawString);

      // Determine transmission status
      let transmissionStatus = 'LIVE';
      let offlineReplay = false;
      if (data.offlineReplay || data.offline) {
        transmissionStatus = 'OFFLINE_REPLAYED';
        offlineReplay = true;
      }

      // Prepare record
      const record = new SensorRecord({
        deviceType: deviceType,
        deviceId: deviceType === 'driver' ? 'DRV001' : 'CONT001',
        containerId: data.containerId || 'CONT001',
        shipmentId: data.shipmentId || 'SHIP001',
        sequence: data.sequence || Math.floor(Math.random() * 1000000000),
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        temperature: data.temperature,
        humidity: data.humidity,
        mq6: data.mq6,
        battery: data.battery,
        solarVoltage: data.solarVoltage || data.solar,
        latitude: data.gps?.lat,
        longitude: data.gps?.lng,
        mq3: data.mq3,
        mpu6050: data.motion ? { motionX: data.motion.x, motionY: data.motion.y, motionZ: data.motion.z } : {},
        tamper: data.tamper || false,
        hash: data.hash || serverDataHash,
        dataHash: data.dataHash || serverDataHash,
        rawPayload: rawString,
        transmissionStatus: transmissionStatus,
        offlineReplay: offlineReplay,
        syncStatus: 'synced',
        verificationStatus: 'PENDING',
        receivedAt: new Date(),
      });

      // Use upsert to avoid duplicate MQTT messages (device + sequence uniqueness)
      if (deviceType === 'container') {
        const result = await SensorRecord.updateOne(
          { deviceId: record.deviceId, sequence: record.sequence },
          { $setOnInsert: record.toObject() },
          { upsert: true }
        );

        // If this was a new insert (upsertedCount > 0), emit the integrity update
        if (result.upsertedCount > 0) {
          if (io) {
            io.emit('farmtrace:integrity:new', {
              sequence: record.sequence,
              deviceId: record.deviceId,
              transmissionStatus,
              offlineReplay,
            });
          }
        }
      } else {
        await SensorRecord.updateOne(
          { deviceId: record.deviceId, timestamp: record.timestamp },
          { $setOnInsert: record.toObject() },
          { upsert: true }
        );
      }
      
    } catch (err) {
      console.error('Error processing MQTT message:', err);
    }
  });

  client.on('error', (err) => {
    console.error('MQTT Error:', err);
  });
  
  client.on('offline', () => {
    console.log('MQTT Client Offline');
  });
};

/**
 * Handle integrity messages from ESP32
 * Updates existing sensor record with hash chain data
 */
async function handleIntegrityMessage(data, io) {
  try {
    const sequence = data.sequence;
    const deviceId = data.deviceId || 'CONT001';

    if (!sequence) {
      console.warn('[INTEGRITY] No sequence in integrity message');
      return;
    }

    // Find the corresponding data record
    const record = await SensorRecord.findOne({ deviceId, sequence });

    if (!record) {
      console.warn(`[INTEGRITY] No data record found for seq ${sequence}, storing integrity data for later`);
      // Create a placeholder that will be merged when data arrives
      return;
    }

    // Update with integrity data from ESP32
    const updateFields = {};

    if (data.dataHash) updateFields.dataHash = data.dataHash;
    if (data.previousHash) updateFields.previousHash = data.previousHash;
    if (data.blockHash) updateFields.blockHash = data.blockHash;

    // Verify the data hash against stored raw payload
    if (data.dataHash && record.rawPayload) {
      const serverHash = sha256(record.rawPayload);
      if (serverHash === data.dataHash) {
        updateFields.verificationStatus = 'VERIFIED';
        updateFields.transmissionStatus = record.offlineReplay ? 'OFFLINE_REPLAYED' : 'VERIFIED';
        updateFields.syncStatus = 'verified';
      } else {
        updateFields.verificationStatus = 'HASH_MISMATCH';
        updateFields.transmissionStatus = 'INTEGRITY_ERROR';
        updateFields.syncStatus = 'failed';
        console.warn(`[INTEGRITY] Hash mismatch for seq ${sequence}: expected ${data.dataHash}, got ${serverHash}`);
      }
    }

    if (data.offlineReplay) {
      updateFields.offlineReplay = true;
      if (updateFields.verificationStatus !== 'HASH_MISMATCH') {
        updateFields.transmissionStatus = 'OFFLINE_REPLAYED';
      }
    }

    await SensorRecord.updateOne({ deviceId, sequence }, { $set: updateFields });

    // Emit update to frontend
    if (io) {
      io.emit('farmtrace:integrity:update', {
        sequence,
        deviceId,
        ...updateFields,
      });
    }

  } catch (err) {
    console.error('[INTEGRITY] Error handling integrity message:', err);
  }
}

const getClient = () => client;

module.exports = { connectMQTT, getClient };
