const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp_code: {
    type: String,
    required: false,
  },
  otp_expiry: {
    type: Date,
    required: false,
  },
  last_login: {
    type: Date,
    default: Date.now,
  },
});

const Auth = mongoose.model("Authentication", authSchema);
module.exports = Auth;
