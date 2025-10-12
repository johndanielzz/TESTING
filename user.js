// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  phone: String,
  role: { type: String, default: 'buyer' }, // buyer, seller, admin
  balance: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'pending' },
  subscription: { type: String, default: 'inactive' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
