// routes/payments.js
const express = require('express');
const PaymentRequest = require('../models/PaymentRequest');
const Seller = require('../seller');
const { generateSubscriptionCode } = require('../utils/codeGen');
const AssignedCode = require('../models/AssignedCode');

const router = express.Router();

/** Create payment request (used by frontend confirm-payment) */
router.post('/request', async (req, res) => {
  try {
    const { name, email, store, amount, plan, method } = req.body;
    const reqObj = new PaymentRequest({ name, email, store, amount, plan, method, status: 'Pending' });
    await reqObj.save();

    // also upsert seller record if missing
    let seller = await Seller.findOne({ email });
    if (!seller) {
      seller = new Seller({ name, email, store, amount, plan, status: 'Pending' });
      await seller.save();
    }

    // notify admin via socket (server will implement emitting)
    if (router.io) router.io.emit('paymentRequest', reqObj);

    res.json({ message: 'Payment request submitted', request: reqObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/** Admin approves a payment request - assigns code and activates seller */
router.post('/admin/approve/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const reqDoc = await PaymentRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });

    reqDoc.status = 'Approved';
    await reqDoc.save();

    // update seller
    let seller = await Seller.findOne({ email: reqDoc.email });
    if (!seller) {
      seller = new Seller({ email: reqDoc.email, name: reqDoc.name, store: reqDoc.store });
    }
    seller.status = 'Approved';
    seller.paymentStatus = 'Paid';
    seller.subscription = 'Active';
    seller.canLogin = true;

    // assign subscription/login code
    const code = generateSubscriptionCode();
    seller.code = code;
    await seller.save();

    // store assigned code with expiry
    const expiry = new Date(); expiry.setDate(expiry.getDate() + 30);
    await AssignedCode.findOneAndUpdate(
      { email: seller.email },
      { code, expiry },
      { upsert: true, new: true }
    );

    // emit socket event
    if (router.io) router.io.emit('paymentApproved', { email: seller.email, code });

    res.json({ message: 'Approved and code assigned', email: seller.email, code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/** Admin decline */
router.post('/admin/decline/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const reqDoc = await PaymentRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });

    reqDoc.status = 'Declined';
    await reqDoc.save();

    // update seller if exists
    let seller = await Seller.findOne({ email: reqDoc.email });
    if (seller) {
      seller.status = 'Declined';
      seller.paymentStatus = 'Unpaid';
      seller.subscription = 'Inactive';
      seller.canLogin = false;
      await seller.save();
    }

    if (router.io) router.io.emit('paymentDeclined', { email: reqDoc.email });

    res.json({ message: 'Request declined' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
