const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./src/config/db');
const router = require('./src/routes');
const donationRouter = require('./src/routes/donationRouter');
const path = require("path");
const { initScheduler } = require('./src/utils/scheduler');
// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

// Socket.IO connection logic
io.on('connection', (socket) => {
  console.log('✅ New client connected');

  // Join user to a room by their ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`🟢 User joined room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Middleware to make `req.io` available in all routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware and static
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api', router);
app.use('/api/donations', donationRouter);

// Start DB and server
const startServer = async () => {
  await connectDB();
  server.listen(8082, () => {
    console.log(`🚀 Server + Socket.IO running on port 8082`);
  });
};

startServer();
initScheduler();
module.exports = app;
