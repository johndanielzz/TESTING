const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')('admin');
const Payment = require('../models/Payment');

router.get('/', auth, async (req,res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json(payments);
});

router.put('/:id/status', auth, async (req,res) => {
  const { status } = req.body;
  const p = await Payment.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  p.status = status;
  await p.save();
  const io = req.app.get('io'); if (io) io.emit('paymentUpdate', { id: p._id, status });
  res.json(p);
});

module.exports = router;
