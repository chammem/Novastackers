const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  foodSale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodSale",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled', 'delivered'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'cash-on-delivery'],
    default: 'card',
  },
  orderedAt: {
    type: Date,
    default: Date.now,
  },
  deliveredAt: Date,
});

module.exports = mongoose.model("Order", orderSchema);
