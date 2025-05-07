const mongoose = require('mongoose');
<<<<<<< HEAD
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to database');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // Arrêter l'application en cas d'échec
=======

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Database connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
  }
};

module.exports = connectDB;
<<<<<<< HEAD



=======
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
