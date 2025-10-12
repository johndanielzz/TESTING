const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user','seller','admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  // optional profile fields...
});

module.exports = mongoose.model('User', UserSchema);
