// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyerName: String,
  buyerEmail: String,
  buyerPhone: String,
  address: String,
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  sellerEmail: String,
  status: { type: String, default: 'Pending' } // Pending, Accepted, Shipped, Delivered, Cancelled
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
