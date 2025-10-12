const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  images: [String], // urls
  quantity: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false }
});

module.exports = mongoose.model('Product', ProductSchema);
