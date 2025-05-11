const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import DB and routes
const connectDB = require('./src/config/db');
const router = require('./src/routes');
const donationRouter = require('./src/routes/donationRouter');
const mysteryPacksRouter = require('./src/routes/mysteryPacks');
const authRoutes = require('./src/routes/authRoutes');

// App and Server Setup
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8082;

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log('✅ New client connected');
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`🟢 User joined room: ${userId}`);
  });
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Inject Socket.IO into req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
// Mount auth routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/donations', donationRouter);
app.use('/api/mystery-packs', mysteryPacksRouter);
app.use('/api', router); // Les autres routes regroupées
app.use('/api', require('./src/routes/api')); // Si besoin, à ajuster selon ton organisation

// DB + Start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 Server + Socket.IO running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
