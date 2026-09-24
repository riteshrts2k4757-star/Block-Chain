const mqtt = require('mqtt');
const SensorRecord = require('../models/SensorRecord');

let client;

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
        }
      }

      // Ignore status messages for DB insertion (or add logic if needed)
      if (topic.endsWith('status')) return;

      // Extract deviceType from topic: farmtrace/{deviceType}/data
      const parts = topic.split('/');
      const deviceType = parts[1]; // 'driver' or 'container'

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
        solarVoltage: data.solarVoltage,
        mq3: data.mq3,
        mpu6050: data.motion ? { motionX: data.motion.x, motionY: data.motion.y, motionZ: data.motion.z } : {},
        hash: data.hash || 'MOCK_HASH_' + Date.now(),
        syncStatus: 'synced'
      });

      // We'll use upsert to avoid duplicate MQTT messages
      if (deviceType === 'container') {
        await SensorRecord.updateOne(
          { deviceId: record.deviceId, sequence: record.sequence },
          { $setOnInsert: record },
          { upsert: true }
        );
      } else {
        await SensorRecord.updateOne(
          { deviceId: record.deviceId, timestamp: record.timestamp },
          { $setOnInsert: record },
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

const getClient = () => client;

module.exports = { connectMQTT, getClient };
