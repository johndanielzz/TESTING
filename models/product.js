const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  title: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  image: String,
  quantity: { type: Number, default: 1 },
  status: { type: String, enum: ['Active','Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
