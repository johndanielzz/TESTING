// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./db');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: { origin: '*' }
});

// Connect DB
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/matrixmarket';
connectDB(MONGO).catch(err => console.error('DB connect error', err));

// middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// import routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const messagesRoutes = require('./routes/messages');

// attach io to routers that need to emit
paymentRoutes.io = io;
adminRoutes.io = io;
ordersRoutes.io = io;
messagesRoutes.io = io;

// mount
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/messages', messagesRoutes);

// socket events
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
