
const mongoose = require("mongoose");


const VerificationSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    code: { type: String, required: true }, // Stores the verification code
    expiresAt: { type: Date,expires: 0, required: true }, // Expiry time for the code
  });

  const Verification = mongoose.model("Verification",VerificationSchema);
  module.exports = Verification;