const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')('admin');
const Seller = require('../models/Seller');

router.get('/', auth, async (req,res) => {
  const sellers = await Seller.find().sort({ createdAt: -1 });
  res.json(sellers);
});

router.put('/:id/status', auth, async (req,res) => {
  const { status } = req.body;
  const s = await Seller.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Not found' });
  s.status = status;
  if (status === 'Approved') { s.subscription = 'Active'; s.paymentStatus = 'Paid'; }
  else { s.subscription = 'Inactive'; s.paymentStatus = 'Unpaid'; }
  await s.save();
  const io = req.app.get('io'); if (io) io.emit('sellerUpdate', { id: s._id, status });
  res.json(s);
});

module.exports = router;
