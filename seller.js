// models/Seller.js
const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  store: String,
  phone: String,
  plan: String,
  amount: Number,
  status: { type: String, default: 'Pending' }, // Pending, Approved, Declined
  paymentStatus: { type: String, default: 'Pending' },
  subscription: { type: String, default: 'Inactive' },
  code: { type: String }, // subscription/login code assigned after approval
  proof: { type: String }, // url/base64 proof
  canLogin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Seller', SellerSchema);
