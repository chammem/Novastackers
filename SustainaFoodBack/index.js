const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./src/config/db");
const router = require("./src/routes");
const FoodItem = require("./src/models/foodItem");
const User = require("./src/models/userModel")



const app = express();
app.use(
  cors(
    {
    origin : process.env.FRONTEND_URL,
    credentials: true,
  }
)
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api", router);

const PORT = 8082 || process.env.PORT;

const createUser = async () => {
  const user = new User({
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
    fullName: 'John Doe',
    adress:'1£1',
    phoneNumber:'111',
  });

  await user.save();
  console.log('User created successfully!');
};


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("connected to db");
    console.log("server is running");
  });
});
