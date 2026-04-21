const express = require('express')
const router = express.Router()
const { startTrip, endTrip, getActiveBuses } = require('../controllers/trip.controller.js')
const { protect } = require('../middleware/auth.middleware.js')

router.post('/start', protect, startTrip)
router.post('/end', protect, endTrip)
router.get('/active-buses', getActiveBuses)

module.exports = router
