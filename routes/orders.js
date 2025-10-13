const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')();
const Order = require('../models/Order');
const Cart = require('../models/Cart');

router.post('/', auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart empty' });
  const items = cart.items.map(i => ({ product: i.product._id, quantity: i.quantity, price: i.product.price }));
  const total = items.reduce((s,i) => s + i.quantity * i.price, 0);
  const order = new Order({ user: req.user.id, items, total, status: 'Pending' });
  await order.save();
  await Cart.findOneAndDelete({ user: req.user.id });
  const io = req.app.get('io'); if (io) io.emit('orderCreated', { orderId: order._id });
  res.json(order);
});

router.get('/', auth, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
