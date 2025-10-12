const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Seller = require('../models/Seller');

// GET all sellers
router.get('/', auth('admin'), async (req, res) => {
  const sellers = await Seller.find().sort({ createdAt: -1 });
  res.json(sellers);
});

// UPDATE seller status
router.put('/:id', auth('admin'), async (req, res) => {
  const { status } = req.body;
  const seller = await Seller.findById(req.params.id);
  if (!seller) return res.status(404).json({ message: 'Seller not found' });

  seller.status = status;
  if (status === "Approved") {
    seller.subscription = "Active";
    seller.paymentStatus = "Paid";
  } else if (status === "Declined") {
    seller.subscription = "Inactive";
    seller.paymentStatus = "Unpaid";
  }

  await seller.save();
  res.json(seller);
});

module.exports = router;
