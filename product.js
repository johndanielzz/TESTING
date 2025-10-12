// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  sellerEmail: String,
  name: String,
  description: String,
  price: Number,
  image: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
