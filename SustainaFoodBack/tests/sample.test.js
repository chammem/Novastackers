const request = require('supertest');
const app = require('../app'); // Assuming app.js exports the Express app
const mongoose = require('mongoose');

describe('Sample Test Suite', () => {
  beforeAll(async () => {
    // Ensure proper handling of Mongoose connections
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/testdb');
    }
  });

  afterAll(async () => {
    // Disconnect from the database
    await mongoose.connection.close();
  });

  it('should return 200 for the root route', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  it('should return a 404 for an unknown route', async () => {
    const response = await request(app).get('/unknown');
    expect(response.statusCode).toBe(404);
  });
});