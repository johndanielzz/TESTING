// routes/orders.js
const express = require('express');
const Order = require('../order');
const router = express.Router();

// buyer creates order
router.post('/', async (req, res) => {
  const { buyerName, buyerEmail, buyerPhone, address, items, total } = req.body;
  // also set sellerEmail based on first item seller (example)
  const sellerEmail = items?.[0]?.sellerEmail || null;
  const order = new Order({ buyerName, buyerEmail, buyerPhone, address, items, total, sellerEmail, status: 'Pending' });
  await order.save();
  // notify seller via socket
  if (router.io) router.io.emit('newOrder', order);
  res.json(order);
});

// list orders for seller
router.get('/seller/:email', async (req, res) => {
  const orders = await Order.find({ sellerEmail: req.params.email }).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
