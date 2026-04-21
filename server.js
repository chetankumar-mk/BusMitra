// STEP 1 — imports at top
const express = require('express')
const http = require('http')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const { initSocket } = require('./src/socket/index.js')

dotenv.config()

// 🔥 FIREBASE ADMIN INITIALIZATION
const { firebaseDB } = require('./src/firebase_admin');

// 🧪 CONNECTION TEST write
if (firebaseDB) {
  firebaseDB.ref("test").set({
    message: "Backend connected (Realtime DB) 🚀",
    timestamp: Date.now()
  }).then(() => console.log("✅ Firebase (RTDB) Backend Connected 🚀"))
    .catch(err => console.error("❌ RTDB Backend Test Failed:", err.message));
}

// STEP 2 — import all route files
const authRoutes = require('./src/routes/auth.routes.js')
const busRoutes = require('./src/routes/bus.routes.js')
const tripRoutes = require('./src/routes/trip.routes.js')

// STEP 3 — create express app
const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 📝 REQUEST LOGGING MIDDLEWARE
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') console.log('Body:', req.body);
  next();
});

// STEP 4 — mount routes
app.use('/api/auth', authRoutes)
app.use('/api/bus', busRoutes)
app.use('/api/trip', tripRoutes)

// STEP 5 — health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Busmitra server running',
    timestamp: new Date().toISOString()
  })
})

// STEP 6 — global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

// STEP 7 — create http server and init socket
const server = http.createServer(app)
initSocket(server, '*')

// STEP 8 — connect MongoDB then start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    server.listen(process.env.PORT || 5000, '0.0.0.0', () => {
      console.log('🚀 Server running on port ' + (process.env.PORT || 5000))
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB failed:', err.message)
    process.exit(1)
  })