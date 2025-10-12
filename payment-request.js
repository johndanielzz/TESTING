// models/PaymentRequest.js
const mongoose = require('mongoose');

const PaymentRequestSchema = new mongoose.Schema({
  email: String,
  name: String,
  store: String,
  amount: Number,
  plan: String,
  method: String,
  status: { type: String, default: 'Pending' }, // Pending, Approved, Declined
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentRequest', PaymentRequestSchema);
