const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Seller = require('../models/Seller');

const router = express.Router();

// =========================
// GET /api/admin/overview
// =========================
// Protected: admin only
router.get('/overview', auth('admin'), async (req, res) => {
  try {
    const [usersCount, productsCount, sellersCount, recentProducts] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Seller.countDocuments(),
      Product.find().sort({ createdAt: -1 }).limit(20).populate('seller', 'shopName')
    ]);

    res.json({
      success: true,
      stats: {
        usersCount,
        productsCount,
        sellersCount
      },
      recentProducts
    });
  } catch (err) {
    console.error('Error fetching admin overview:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching overview' });
  }
});

// =========================
// GET /api/admin/users
// =========================
router.get('/users', auth('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching users' });
  }
});

// =========================
// GET /api/admin/products
// =========================
router.get('/products', auth('admin'), async (req, res) => {
  try {
    const products = await Product.find()
      .populate('seller', 'shopName')
      .sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching products' });
  }
});

// =========================
// PUT /api/admin/user/:id/role
// =========================
router.put('/user/:id/role', auth('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to '${role}'`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error changing user role:', err);
    res.status(500).json({ success: false, message: 'Server error while updating user role' });
  }
});

module.exports = router;
