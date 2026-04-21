const express = require('express')
const router = express.Router()
const {
  controllerLogin,
  controllerRegister,
  driverLogin,
  passengerLogin
} = require('../controllers/auth.controller.js')

router.post('/controller/register', controllerRegister)
router.post('/controller/login', controllerLogin)
router.post('/driver/login', driverLogin)
router.post('/passenger/login', passengerLogin)

module.exports = router
