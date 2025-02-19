const mongoose = require("mongoose");

const foodClaimSchema = new mongoose.Schema({
  food_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItem",
    required: true,
  },
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  claimed_at: { type: Date, default: Date.now },
  reservation_expiry: { type: Date, required: false },
  status: {
    type: String,
    enum: ["pending", "picked_up", "expired"],
    required: true,
  },
});

const FoodClaim = mongoose.model("FoodClaim", foodClaimSchema);
module.exports = FoodClaim;
