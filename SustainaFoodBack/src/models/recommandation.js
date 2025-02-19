const mongoose = require("mongoose");



const recommendationSchema = new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recommended_foods: [
      { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" },
    ],
    created_at: { type: Date, default: Date.now },
  });

  const Recommendation = mongoose.model("Recommendation", recommendationSchema);


  module.exports = Recommendation