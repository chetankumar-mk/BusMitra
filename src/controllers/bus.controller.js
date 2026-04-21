const Bus = require('../models/Bus.model');
const Driver = require('../models/Driver.model');

const addBus = async (req, res) => {
  try {
    const { busNumber, routeName, capacity } = req.body;
    const createdBy = req.user.id;

    const newBus = new Bus({
      busNumber,
      routeName,
      capacity,
      createdBy
    });

    const savedBus = await newBus.save();
    return res.status(201).json(savedBus);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find({ createdBy: req.user.id })
      .populate('currentDriver', 'name uniqueId');
    
    return res.status(200).json(buses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addDriver = async (req, res) => {
  try {
    const { name, uniqueId, password, busId } = req.body;
    const createdBy = req.user.id;

    const newDriver = new Driver({
      name,
      uniqueId,
      passwordHash: password,
      assignedBus: busId || null,
      createdBy
    });

    const savedDriver = await newDriver.save();

    if (busId) {
      await Bus.findByIdAndUpdate(busId, { currentDriver: savedDriver._id });
    }

    return res.status(201).json(savedDriver);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ createdBy: req.user.id })
      .populate('assignedBus', 'busNumber routeName');
      
    return res.status(200).json(drivers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addBus,
  getAllBuses,
  addDriver,
  getAllDrivers
};
