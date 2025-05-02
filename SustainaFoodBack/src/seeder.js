const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel'); // Adjust the path to your user model

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Example: Add a default user
    const defaultUser = {
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'password123', // Ensure this is hashed in your model
      role: 'admin',
    };

    await User.create(defaultUser);
    console.log('Database seeded successfully');

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
