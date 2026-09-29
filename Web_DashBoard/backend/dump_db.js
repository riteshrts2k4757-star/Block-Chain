const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Driver = require('./src/models/Driver');
    
    // Create driver for John Driver
    const johnId = '6ab446a422c9139a57bcfdc2';
    const existingDriver = await Driver.findOne({ userId: johnId });
    if (!existingDriver) {
      await Driver.create({
        userId: johnId,
        licenseNumber: 'DL-JOHN-123',
        phone: '+1 555-0199',
        status: 'active'
      });
      console.log('Created Driver profile for John Driver');
    } else {
      console.log('Driver already exists for John');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
connectDB();
