const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDB, disconnectDB } = require('../src/config/db');

let mongoServer;

// Set up the in-memory database before tests
const setupTestDB = async () => {
  // Set environment to test
  process.env.NODE_ENV = 'test';
  
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await connectDB(uri);
  
  return uri;
};

// Clean up after tests
const teardownTestDB = async () => {
  await disconnectDB();
  
  if (mongoServer) {
    await mongoServer.stop();
  }
};

module.exports = {
  setupTestDB,
  teardownTestDB
};
