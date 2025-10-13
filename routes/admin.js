const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')('admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Seller = require('../models/Seller');

router.get('/overview', auth, async (req, res) => {
  const usersCount = await User.countDocuments();
  const productsCount = await Product.countDocuments();
  const sellersCount = await Seller.countDocuments();
  const recentSellers = await Seller.find().sort({ createdAt: -1 }).limit(5);
  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
  res.json({ usersCount, productsCount, sellersCount, recentSellers, recentUsers });
});

router.get('/users', auth, async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json(users);
});

router.get('/products', auth, async (req, res) => {
  const products = await Product.find().populate('seller').sort({ createdAt: -1 });
  res.json(products);
});

module.exports = router;
