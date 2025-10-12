// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Seller = require('../seller');
const User = require('../user');
const AssignedCode = require('../models/AssignedCode');
const { generateSubscriptionCode } = require('../utils/codeGen');

const router = express.Router();

/**
 * Register seller (basic) - in your frontend you already push seller data to pendingRequests; this endpoint can be used for registration
 */
router.post('/seller/register', async (req, res) => {
  try {
    const { name, email, store, phone, password, plan, amount } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const exists = await Seller.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Seller already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const seller = new Seller({ name, email, store, phone, password: hashed, plan, amount, status: 'Pending' });
    await seller.save();

    res.json({ message: 'Seller registered - pending admin approval', seller });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Login (seller or user) - accepts email OR subscription code for sellers
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or seller code
    if (!identifier || !password) return res.status(400).json({ message: 'identifier and password required' });

    // try seller by email or code
    let seller = await Seller.findOne({ email: identifier });
    if (!seller) {
      seller = await Seller.findOne({ code: identifier });
    }

    if (seller) {
      const match = await bcrypt.compare(password, seller.password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });
      if (!seller.canLogin) return res.status(403).json({ message: 'Account not approved yet' });

      const payload = { id: seller._id, email: seller.email, role: 'seller', name: seller.name };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, seller });
    }

    // else try normal user
    let user = await User.findOne({ email: identifier });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const matchU = await bcrypt.compare(password, user.password);
    if (!matchU) return res.status(400).json({ message: 'Invalid credentials' });
    const payloadU = { id: user._id, email: user.email, role: 'buyer', name: user.name };
    const tokenU = jwt.sign(payloadU, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: tokenU, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
