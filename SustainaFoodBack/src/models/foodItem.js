const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required:true},
  expiry_date: { type: Date, required: false },
  category: { type: String, required: false },
  allergens: { type: String, required: false },
  nutritional_category: { type: String, required: false },
  image_url: { type: String, required: false },
  status: {
    type: String,
    enum: ["available", "claimed", "expired"],
    required: false,
  },
  created_at: { type: Date, default: Date.now },
});

const FoodItem = mongoose.model("FoodItem", foodSchema);
module.exports = FoodItem;
