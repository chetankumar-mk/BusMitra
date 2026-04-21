const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  routeName: { type: String, required: true },
  capacity: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Controller' },
  currentDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  status: { type: String, enum: ['idle', 'on_trip', 'stopped'], default: 'idle' },
  lastLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    updatedAt: { type: Date, default: null }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bus', busSchema);
