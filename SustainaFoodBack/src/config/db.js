const mongoose = require('mongoose');

// Track connection state
let isConnected = false;

const connectDB = async (testUri) => {
  // If already connected and not a test connection request, return
  if (isConnected && !testUri) {
    console.log('Using existing database connection');
    return;
  }

  // If there's an existing connection and we're switching URIs, close it first
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('Closed previous connection');
  }

  try {
    // Use testUri for tests, otherwise use the environment variable
    const uri = testUri || process.env.MONGODB_URI;
    const conn = await mongoose.connect(uri);
    isConnected = true;
    console.log(`Database connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    
    // Only exit in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

// Add a disconnect function for tests
const disconnectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('Database disconnected');
  }
};

module.exports = { connectDB, disconnectDB };


