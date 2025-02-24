const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to database');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // Arrêter l'application en cas d'échec
  }
};

module.exports = connectDB;



