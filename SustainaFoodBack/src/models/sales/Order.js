const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
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
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    lat: Number,
    lng: Number,
  },
  specialInstructions: String,
  status: {
    type: String,
    enum: ["pending", "paid", "fulfilled", "cancelled", "completed"],
    default: "pending",
  },
  deliveryStatus: {
    type: String,
    enum: [
      "pending",
      "waiting_for_driver",
      "driver_assigned",
      "pickup_ready",
      "picked_up",
      "delivering",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  pickupCode: {
    code: { type: String },
    generatedAt: { type: Date },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  deliveryCode: {
    code: { type: String },
    generatedAt: { type: Date },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  statusHistory: [
    {
      status: { type: String },
      updatedBy: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  paymentId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  estimatedDeliveryTime: Date,
  deliveredAt: Date,
  declinedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Order", orderSchema);
