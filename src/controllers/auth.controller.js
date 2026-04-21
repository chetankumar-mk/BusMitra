const jwt = require('jsonwebtoken');
const Controller = require('../models/Controller.model');
const Driver = require('../models/Driver.model');

const controllerRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const newController = new Controller({
      name,
      email,
      passwordHash: password
    });
    
    await newController.save();
    return res.status(201).json({ message: "Controller account created" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const controllerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const controller = await Controller.findOne({ email });
    
    if (!controller || !(await controller.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: controller._id, role: "controller", name: controller.name },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.status(200).json({
      token,
      name: controller.name,
      role: "controller"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const driverLogin = async (req, res) => {
  try {
    const { uniqueId, password } = req.body;
    
    const driver = await Driver.findOne({ uniqueId }).populate('assignedBus');
    
    if (!driver || !(await driver.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid driver ID or password" });
    }

    const payload = {
      id: driver._id,
      role: "driver",
      name: driver.name,
      busId: driver.assignedBus ? driver.assignedBus._id : null
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

    return res.status(200).json({
      token,
      name: driver.name,
      role: "driver",
      assignedBus: driver.assignedBus
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const passengerLogin = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    const token = jwt.sign(
      { phone, role: "passenger" },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.status(200).json({
      token,
      phone,
      role: "passenger"
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  controllerRegister,
  controllerLogin,
  driverLogin,
  passengerLogin
};
