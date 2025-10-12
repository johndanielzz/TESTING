const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  store: String,
  plan: String,
  proof: String,
  status: { type: String, default: 'Pending' },
  paymentStatus: { type: String, default: 'Unpaid' },
  subscription: { type: String, default: 'Inactive' },
}, { timestamps: true });

module.exports = mongoose.model('Seller', SellerSchema);
