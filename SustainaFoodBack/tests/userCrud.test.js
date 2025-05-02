const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const userModel = require('../src/models/userModel');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mockUser = {
  fullName: 'Test User',
  email: 'testuser@example.com',
  password: 'password123',
  role: 'user',
};

let mongoServer;

describe('User CRUD Operations', () => {
  let userId;

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect to in-memory MongoDB
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a user
    const user = await userModel.create(mockUser);
    userId = user._id;
  });

  afterAll(async () => {
    // Stop the in-memory MongoDB server
    await mongoose.disconnect();
    await mongoServer.stop();

    jest.restoreAllMocks();
  });

  it('should fetch all users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('should fetch a user by ID', async () => {
    const response = await request(app).get(`/api/user/${userId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('fullName', mockUser.fullName);
  });

  it('should update user information', async () => {
    const res = await request(app)
      .put(`/api/updateUser/${userId}`)
      .send({ fullName: 'Updated Name' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('fullName', 'Updated Name');
  });

  it('should delete a user by ID', async () => {
    const response = await request(app).delete(`/api/deleteUser/${userId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'User deleted successfully');
  });
});
