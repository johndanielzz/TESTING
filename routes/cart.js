const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

router.get('/', auth, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart) cart = { items: [] };
  res.json(cart);
});

router.post('/add', auth, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id, items: [] });
  const idx = cart.items.findIndex(i => i.product.toString() === productId);
  if (idx >= 0) cart.items[idx].quantity += quantity;
  else cart.items.push({ product: productId, quantity });
  cart.updatedAt = Date.now();
  await cart.save();
  const io = req.app.get('io'); if (io) io.emit('cartUpdate', { userId: req.user.id });
  res.json(cart);
});

router.post('/remove', auth, async (req, res) => {
  const { productId } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.json({ items: [] });
  cart.items = cart.items.filter(i => i.product.toString() !== productId);
  await cart.save();
  const io = req.app.get('io'); if (io) io.emit('cartUpdate', { userId: req.user.id });
  res.json(cart);
});

router.post('/clear', auth, async (req,res) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  const io = req.app.get('io'); if (io) io.emit('cartUpdate', { userId: req.user.id });
  res.json({ message: 'Cleared' });
});

module.exports = router;
