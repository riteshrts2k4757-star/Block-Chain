require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Driver = require('./models/Driver');
const Container = require('./models/Container');
const Shipment = require('./models/Shipment');
const SensorRecord = require('./models/SensorRecord');
const DriverLog = require('./models/DriverLog');
const Alert = require('./models/Alert');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Dropping existing database...');
    await mongoose.connection.dropDatabase();

    console.log('Seeding Users and Drivers...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@farmtrace.test',
      passwordHash: 'password123',
      role: 'admin'
    });

    const driverUser = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@farmtrace.test',
      passwordHash: 'password123',
      role: 'driver'
    });

    const driver = await Driver.create({
      userId: driverUser._id,
      licenseNumber: 'DL-JH-2023-8899',
      phone: '+91-9876543210',
      status: 'on_trip'
    });
    
    driverUser.driverId = driver._id;
    await driverUser.save();

    console.log('Seeding Containers...');
    const container = await Container.create({
      containerId: 'CONT-4048-A',
      deviceId: 'FARMNODE-001',
      type: 'refrigerated',
      status: 'in_use',
      batteryLevel: 87,
      firmwareVersion: '1.2.4'
    });

    console.log('Seeding Shipments...');
    const shipment = await Shipment.create({
      shipmentId: 'FT-2026-001',
      origin: 'Dhanbad Farms',
      destination: 'Ranchi Storage',
      driverId: driver._id,
      containerId: container.containerId,
      status: 'active',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    });

    driver.currentTripId = shipment.shipmentId;
    await driver.save();

    console.log('Seeding Sensor Records...');
    await SensorRecord.create({
      deviceId: container.deviceId,
      containerId: container.containerId,
      shipmentId: shipment.shipmentId,
      sequence: 1,
      timestamp: new Date(),
      temperature: 5.8,
      humidity: 82.4,
      ethylene: 1.2,
      battery: 87,
      vibration: 0.02,
      hash: 'abc',
      syncStatus: 'synced'
    });

    console.log('Seeding Logbook...');
    await DriverLog.create({
      driverId: driver._id,
      tripId: shipment.shipmentId,
      eventType: 'driving',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      duration: 120,
      notes: 'Departed from farm'
    });

    console.log('Seeding Alerts...');
    await Alert.create({
      shipmentId: shipment.shipmentId,
      containerId: container.containerId,
      deviceId: container.deviceId,
      type: 'TEMPERATURE_HIGH',
      severity: 'warning',
      message: 'Temperature exceeded 5.0°C threshold',
      sensorValue: 5.8,
      threshold: 5.0,
      timestamp: new Date()
    });

    console.log('Database Seeding Completed Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
