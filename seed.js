// seed.js
require('dotenv').config();
const connectDB = require('./db');
const bcrypt = require('bcryptjs');
const User = require('./user');
const Seller = require('./seller');
const PaymentRequest = require('./models/PaymentRequest');

async function seed() {
  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/matrixmarket');
  // create admin user (stored in User with role admin)
  const adminEmail = 'admin@matrixmarket.com';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const hashed = await bcrypt.hash('StrongAdminPass123!', 10);
    await User.create({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin' });
    console.log('Created admin user:', adminEmail);
  } else {
    console.log('Admin exists');
  }

  // sample seller (pending)
  const sellerEmail = 'seller@example.com';
  const s = await Seller.findOne({ email: sellerEmail });
  if (!s) {
    const hashed = await bcrypt.hash('sellerpass', 10);
    await Seller.create({ name: 'Sample Seller', email: sellerEmail, password: hashed, store: 'SampleStore', plan: 'Monthly', amount: 3000, status: 'Pending', canLogin: false });
    console.log('Created sample seller');
  } else {
    console.log('Seller exists');
  }

  process.exit();
}

seed().catch(err => { console.error(err); process.exit(1); });
