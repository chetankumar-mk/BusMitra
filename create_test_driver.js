const mongoose = require('mongoose');
require('dotenv').config();
const Driver = require('./src/models/Driver.model');
const Bus = require('./src/models/Bus.model');

async function createTestDriver() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find any bus
    const bus = await Bus.findOne();
    if (!bus) {
      console.log('No buses available to assign.');
      process.exit(1);
    }

    const testDriverId = 'TEST-1';
    const testPassword = 'password123';

    // Remove existing if any
    await Driver.deleteMany({ uniqueId: testDriverId });

    const newDriver = new Driver({
      name: 'Test Driver',
      uniqueId: testDriverId,
      passwordHash: testPassword, // Model handles hashing on .save()
      assignedBus: bus._id,
      isActive: true
    });

    await newDriver.save();
    console.log(`\n✅ TEST DRIVER CREATED!`);
    console.log(`Driver ID: ${testDriverId}`);
    console.log(`Password: ${testPassword}`);
    console.log(`Assigned to Bus: ${bus.busNumber}`);

    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createTestDriver();
