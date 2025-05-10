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
const foodSaleRoutes = require('./src/routes/foodSaleRoute');
const paymentRoutes = require('./src/routes/paymentRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes');
const suggestedProductRoutes = require('./src/routes/suggestedProductRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const nodemailer = require('nodemailer');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const paymentController = require('./src/controllers/payment/paymentController');
const driverAssignmentService = require('./src/services/driverAssignmentService');

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
driverAssignmentService.initialize(io);

// This line MUST come BEFORE any Express JSON parsing middleware
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

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

// Add a root route handler for tests/health checks
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'SustainaFood API is running',
    status: 'OK'
  });
});

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
  const { subject, message, email } = req.body;

  // Validate input
  if (!subject || !message || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "support@sustainafood.org", // Fixed recipient email
    subject: `New Contact Form Submission: ${subject}`,
    text: `
      Subject: ${subject}
      From: ${email}
      Message: ${message}
    `,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>From:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Routes
app.use('/api', router);
app.use('/api/donations', donationRouter);
app.use('/api/food-sale', foodSaleRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/driver', driverRoutes);
// Recommendation routes
app.use('/api', recommendationRoutes);
// Suggested Products API
app.use('/api/suggested-products', suggestedProductRoutes);

// Start DB and server
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 8082;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server + Socket.IO running on http://0.0.0.0:${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
  initScheduler(); // Only initialize the scheduler if not in test mode
}

module.exports = app;