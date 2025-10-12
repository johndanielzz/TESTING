const express = require('express');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const auth = require('../middleware/auth');
const router = express.Router();

// Public: fetch products (with filters)
router.get('/', async (req, res) => {
  try {
    const { q, seller, archived } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (seller) filter.seller = seller;
    if (archived !== undefined) filter.archived = archived === 'true';
    const products = await Product.find(filter).populate('seller');
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Create product (seller)
router.post('/', auth(), async (req, res) => {
  try {
    const { sellerId, title, description, price, images, quantity } = req.body;
    if (!sellerId || !title) return res.status(400).json({ message: 'Missing fields' });

    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(400).json({ message: 'Seller not found' });

    const p = new Product({ seller: sellerId, title, description, price, images, quantity });
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update product (seller/admin)
router.put('/:id', auth(), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    // Optionally check ownership if role !== admin
    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete or archive
router.delete('/:id', auth('admin'), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
