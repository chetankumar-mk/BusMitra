const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uniqueId: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Controller' },
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true
});

driverSchema.pre('save', async function() {
  if (!this.isModified('passwordHash')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

driverSchema.methods.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('Driver', driverSchema);
