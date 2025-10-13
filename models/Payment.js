const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  name: String,
  email: String,
  amount: Number,
  method: String,
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending','Approved','Declined'], default: 'Pending' },
  metadata: Object
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
