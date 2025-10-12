require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json()); // parse JSON bodies

// If you want to serve your static HTML from the backend:
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// DB connect
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=>console.log('MongoDB connected'))
.catch(err=>{
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
