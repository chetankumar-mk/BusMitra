const mongoose = require('mongoose');
require('dotenv').config();
const Driver = require('./src/models/Driver.model');
const Bus = require('./src/models/Bus.model');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const drivers = await Driver.find().populate('assignedBus');
    console.log('\n--- Drivers ---');
    if (drivers.length === 0) {
      console.log('No drivers found in database.');
    } else {
      drivers.forEach(d => {
        console.log(`Name: ${d.name}, uniqueId: ${d.uniqueId}, assignedBus: ${d.assignedBus ? d.assignedBus.busNumber : 'None'}`);
      });
    }

    const buses = await Bus.find();
    console.log('\n--- Buses ---');
    if (buses.length === 0) {
      console.log('No buses found in database.');
    } else {
      buses.forEach(b => {
        console.log(`Bus Number: ${b.busNumber}, Route: ${b.routeName}`);
      });
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkData();
