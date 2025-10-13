const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  const q = req.query.q || '';
  const products = await Product.find({ title: { $regex: q, $options: 'i' } }).populate('seller');
  res.json(products);
});

router.post('/', auth('seller'), async (req, res) => {
  const { title, description, price, image, quantity } = req.body;
  // find seller by user id
  const seller = await Seller.findOne({ user: req.user.id });
  if (!seller) return res.status(400).json({ message: 'Seller not found' });
  const p = new Product({ seller: seller._id, title, description, price, image, quantity });
  await p.save();
  res.json(p);
});

router.put('/:id', auth(), async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  Object.assign(p, req.body);
  await p.save();
  res.json(p);
});

router.delete('/:id', auth('admin'), async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
