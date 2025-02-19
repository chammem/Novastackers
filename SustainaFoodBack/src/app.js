const express = require("express");
const app = express();
const models = require('./models')
const {User} = require('./models/user')

const UserPreference = require("./models/user");






models.connectToDatabase();
//app.get("/", (req, res) => res.send("Hello, world!"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRouter = require('./routes/userRouter');

app.use('/user',userRouter);
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`My first Express app - listening on port ${PORT}!`);
});