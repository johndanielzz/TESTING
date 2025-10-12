// routes/admin.js
const express = require('express');
const PaymentRequest = require('../models/PaymentRequest');
const Seller = require('../seller');
const AssignedCode = require('../models/AssignedCode');
const auth = require('../middleware/auth');

const router = express.Router();

/** NOTE: in production wrap with admin middleware after validating JWT with admin role */

/** list pending requests */
router.get('/pending-requests', async (req, res) => {
  const list = await PaymentRequest.find({}).sort({ date: -1 }).limit(200);
  res.json(list);
});

/** list all sellers */
router.get('/sellers', async (req, res) => {
  const sellers = await Seller.find({}).sort({ createdAt: -1 });
  res.json(sellers);
});

/** get seller login credentials (for admin view) */
router.get('/seller/:email/credentials', async (req, res) => {
  const email = req.params.email;
  const seller = await Seller.findOne({ email });
  if (!seller) return res.status(404).json({ message: 'Seller not found' });

  // DON'T return raw password in production — this is only because you requested to view login code & password.
  // If hashed password stored, we cannot reveal it. If you want plain password you must store plaintext (not recommended).
  res.json({
    email: seller.email,
    code: seller.code || null,
    // Password is stored hashed — we will **not** return hashed password. You can implement password reset instead.
    passwordResetTokenAvailable: true
  });
});

module.exports = router;
