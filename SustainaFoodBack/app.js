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
const mysteryPacksRouter = require('./src/routes/mysteryPacks');
const authRoutes = require('./src/routes/authRoutes');
const app = express();
const server = http.createServer(app);
const PORT = 8082;

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
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

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware and static
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure these routes are mounted before other routes
app.use('/api', require('./src/routes/api'));

// Routes
app.use('/api', router);
app.use('/api/donations', donationRouter);
app.use('/api/mystery-packs', mysteryPacksRouter); // ✅ nom cohérent avec le frontend
app.use('/api/auth', authRoutes);

// Start DB and server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
