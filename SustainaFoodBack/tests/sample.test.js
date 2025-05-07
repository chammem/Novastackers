const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

describe('Sample Test Suite', () => {
  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect to in-memory MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Disconnect and stop the in-memory MongoDB server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should return 200 for the root route', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  it('should return a 404 for an unknown route', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.statusCode).toBe(404);
  });
});