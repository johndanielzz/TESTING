// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  fromEmail: String,
  toEmail: String,
  text: String,
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
