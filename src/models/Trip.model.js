const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  locationHistory: [{
    lat: { type: Number },
    lng: { type: Number },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
