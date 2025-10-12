const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');

// GET all payments
router.get('/', auth('admin'), async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json(payments);
});

// UPDATE payment status
router.put('/:id', auth('admin'), async (req, res) => {
  const { status } = req.body;
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  payment.status = status;
  await payment.save();
  res.json(payment);
});

module.exports = router;
