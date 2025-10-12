// models/AssignedCode.js
const mongoose = require('mongoose');

const AssignedCodeSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  code: String,
  expiry: Date
});

module.exports = mongoose.model('AssignedCode', AssignedCodeSchema);
