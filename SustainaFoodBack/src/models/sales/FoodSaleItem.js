const mongoose = require("mongoose");

const foodSaleSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItem",
    required: false,
  },
  price: {
    type: Number,
    required: false,
  },
  discountedPrice: {
    type: Number,
    required: false, // optional if there's no discount
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  quantityAvailable: {
    type: Number,
    default: 1,
  },
  listedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: Date, // could default to foodItem.expiry_date
});

module.exports = mongoose.model("FoodSale", foodSaleSchema);
