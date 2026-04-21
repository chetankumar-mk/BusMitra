const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const controllerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true }
}, {
  timestamps: true
});

controllerSchema.pre('save', async function() {
  if (!this.isModified('passwordHash')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

controllerSchema.methods.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('Controller', controllerSchema);
