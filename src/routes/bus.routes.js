const express = require('express')
const router = express.Router()
const { addBus, getAllBuses, addDriver, getAllDrivers } = require('../controllers/bus.controller.js')
const { protect } = require('../middleware/auth.middleware.js')

router.post('/add', protect, addBus)
router.get('/', protect, getAllBuses)
router.post('/driver/add', protect, addDriver)
router.get('/drivers', protect, getAllDrivers)

module.exports = router
