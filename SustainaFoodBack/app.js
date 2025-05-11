const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const connectDB = require("./src/config/db"); // Updated import statement
const router = require("./src/routes");
const donationRouter = require("./src/routes/donationRouter");
const path = require("path");
const { initScheduler } = require("./src/utils/scheduler");
const foodSaleRoutes = require("./src/routes/foodSaleRoute");
const paymentRoutes = require("./src/routes/paymentRoutes");
const recommendationRoutes = require("./src/routes/recommendationRoutes");
const suggestedProductRoutes = require("./src/routes/suggestedProductRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const locationRoutes = require("./src/routes/locationRoutes");
const driverRoutes = require("./src/routes/driverRoutes");
const User = require("./src/models/userModel"); // Assuming User model is defined
const Order = require("./src/models/sales/Order"); // Assuming Order model is defined

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const paymentController = require("./src/controllers/payment/paymentController");
const driverAssignmentService = require("./src/services/driverAssignmentService");

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// Setup socket middleware to make io available in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO connection logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handler for user notification room
  socket.on("join", (userId) => {
    if (userId) {
      // Join the room with just the userId (no prefix)
      socket.join(userId);
      console.log(`Client ${socket.id} joined user room: ${userId}`);
    }
  });

  // Handler for order tracking room
  socket.on("join-order-room", (orderId) => {
    if (orderId) {
      socket.join(`order-${orderId}`);
      console.log(`Client ${socket.id} joined order room: order-${orderId}`);
    }
  });

  // Handle direct driver location update from client
  socket.on("driver-location-update", (data) => {
    const { orderId, driverId, location } = data;

    if (orderId && location) {
      console.log(
        `Broadcasting driver location for order ${orderId}:`,
        location
      );

      // Broadcast to everyone in the order room EXCEPT sender
      socket.to(`order-${orderId}`).emit("driver-location-update", data);

      // Also save to database if needed
      // This could call your updateDriverLocation function
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

driverAssignmentService.initialize(io);
// This line MUST come BEFORE any Express JSON parsing middleware
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

// Middleware and static
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content",
      "Accept",
      "Content-Type",
      "Authorization",
    ],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Add a root route handler for tests/health checks
app.get("/", (req, res) => {
  res.status(200).json({
    message: "SustainaFood API is running",
    status: "OK",
  });
});

// Routes
app.use("/api", router);
app.use("/api/donations", donationRouter);
app.use("/api/food-sale", foodSaleRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/driver", driverRoutes);
// Recommendation routes
app.use("/api", recommendationRoutes);
// Suggested Products API
app.use("/api/suggested-products", suggestedProductRoutes);
// Start DB and server
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 8082;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server + Socket.IO running on http://0.0.0.0:${PORT}`);
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer();
  initScheduler(); // Only initialize the scheduler if not in test mode
}
module.exports = app;
