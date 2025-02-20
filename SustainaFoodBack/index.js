const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./src/config/db");
const router = require("./src/routes");
const FoodItem = require("./src/models/foodItem");




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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("connected to db");
    console.log("server is running");
  });
});
