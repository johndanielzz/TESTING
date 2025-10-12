// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seller = require('../models/Seller');

module.exports = async function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user or seller
    if (decoded.role === 'admin' || decoded.role === 'buyer') {
      req.user = decoded;
    } else if (decoded.role === 'seller') {
      req.seller = decoded;
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
