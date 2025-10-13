require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin'); // overview/users/products
const adminPaymentsRoute = require('./routes/adminPayments');
const adminSellersRoute = require('./routes/adminSellers');
const cartRoute = require('./routes/cart');
const ordersRoute = require('./routes/orders');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// create server + socket.io
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' }});
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('join', (room) => socket.join(room));
  socket.on('disconnect', () => console.log('Socket disconnect', socket.id));
});

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);        // overview + admin users/products
app.use('/api/admin/payments', adminPaymentsRoute);
app.use('/api/admin/sellers', adminSellersRoute);
app.use('/api/cart', cartRoute);
app.use('/api/orders', ordersRoute);

// serve static frontend if any
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> server.listen(PORT, ()=> console.log(`Server running on ${PORT}`)))
  .catch(err => { console.error('Mongo error', err); process.exit(1); });
