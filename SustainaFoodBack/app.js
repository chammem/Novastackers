const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./src/config/db');
const router = require('./src/routes');
const path = require("path");
const app = express();

// Configuration de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*", // Allow frontend URL or all origins (fallback)
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content', 'Accept', 'Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));


app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));// Routes
app.use('/api', router);


// Connexion à la base de données et démarrage du serveur
const startServer = async () => {
  await connectDB();
  app.listen(8082, () => {
    console.log(`Server is running on port `);
  });
};

startServer();

module.exports = app;
