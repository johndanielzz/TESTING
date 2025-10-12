// routes/messages.js
const express = require('express');
const Message = require('../message');
const router = express.Router();

router.post('/', async (req, res) => {
  const { fromEmail, toEmail, text } = req.body;
  const m = new Message({ fromEmail, toEmail, text });
  await m.save();
  if (router.io) router.io.emit('message', m);
  res.json(m);
});

router.get('/conversation', async (req, res) => {
  const { a, b } = req.query;
  const msgs = await Message.find({ $or: [{ fromEmail: a, toEmail: b }, { fromEmail: b, toEmail: a }] }).sort({ date: 1 });
  res.json(msgs);
});

module.exports = router;
