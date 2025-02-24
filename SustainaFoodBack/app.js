const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./src/config/db');
const router = require('./src/routes');

const app = express();

// Configuration de CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api', router);


// Connexion à la base de données et démarrage du serveur
const startServer = async () => {
  await connectDB();
  app.listen(8082, () => {
    console.log(`Server is running on port 8082` );
  });
};

startServer();

module.exports = app;