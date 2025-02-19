const mongoose = require("mongoose");



const userPreferenceSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activity_level: {
      type: String,
      enum: ["sedentary", "moderate", "active"],
      required: true,
    },
    dietary_preferences: { type: [String], default: [] }, // e.g., ['vegan', 'high_protein']
    disliked_foods: { type: [String], default: [] },
    past_selections: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "FoodItem",
    },
  },
  { timestamps: true }
);

const UserPreference = mongoose.model("UserPreference", userPreferenceSchema);

module.exports = UserPreference