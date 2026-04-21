const Bus = require('../models/Bus.model');
const Driver = require('../models/Driver.model'); // Added missing import
const Trip = require('../models/Trip.model');     // Added missing import
const { firebaseDB } = require('../firebase_admin');

const startTrip = async (req, res) => {
  try {
    const driverId = req.user.id;
    
    // 1. Find Driver and populate assignedBus fully
    const driver = await Driver.findById(driverId).populate('assignedBus');
    
    if (!driver || !driver.assignedBus) {
      return res.status(400).json({ message: "No bus assigned to this driver" });
    }

    // 2. Create new Trip document
    const trip = new Trip({
      bus: driver.assignedBus._id,
      driver: driver._id,
      status: 'ongoing',
      startTime: new Date()
    });

    await trip.save();

    // 3. Update Bus document
    await Bus.findByIdAndUpdate(driver.assignedBus._id, { 
      status: 'on_trip',
      currentDriver: driver._id
    });

    // 🔥 SYNC TO FIREBASE (Realtime Database)
    if (firebaseDB) {
      await firebaseDB.ref(`buses/${driver.assignedBus._id}`).set({
        busNumber: driver.assignedBus.busNumber,
        routeName: driver.assignedBus.routeName,
        driverName: driver.name,
        status: 'on_trip',
        isActive: true,
        updatedAt: Date.now()
      });
    }

    // 4. Return specific response
    return res.status(201).json({
      tripId: trip._id,
      busId: driver.assignedBus._id,
      busNumber: driver.assignedBus.busNumber,
      routeName: driver.assignedBus.routeName,
      message: 'Trip started'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const endTrip = async (req, res) => {
  try {
    const { tripId } = req.body;
    
    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId, 
      { status: 'completed', endTime: new Date() },
      { new: true }
    );

    if (updatedTrip) {
      const busId = updatedTrip.bus.toString();
      await Bus.findByIdAndUpdate(updatedTrip.bus, { status: 'idle', currentDriver: null });

      // 🔥 SYNC TO FIREBASE (Remove tracking node)
      if (firebaseDB) {
        await firebaseDB.ref(`buses/${busId}`).remove();
      }
    }

    return res.status(200).json({
      message: "Trip ended",
      trip: updatedTrip
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getActiveBuses = async (req, res) => {
  try {
    const activeBuses = await Bus.find({ status: 'on_trip' })
      .populate('currentDriver', 'name uniqueId');
      
    return res.status(200).json(activeBuses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startTrip,
  endTrip,
  getActiveBuses
};
