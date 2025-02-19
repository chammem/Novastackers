const mongoose = require("mongoose");

const deliveryRequestSchema = new mongoose.Schema({
  delivery_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true,
    required: true,
  },
  food_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItem",
    required: true,
  },
  donor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DonorProfile",
    required: true,
  },
  recipient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RecipientProfile",
    required: true,
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DriverProfile",
    required: false,
  },
  pickup_location: { type: String, required: true },
  dropoff_location: { type: String, required: true },
  pickup_time: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed"],
    required: true,
  },
  proof_of_pickup: { type: String, required: false },
  proof_of_delivery: { type: String, required: false },
});

const DeliveryRequest = mongoose.model(
  "DeliveryRequest",
  deliveryRequestSchema
);
module.exports = DeliveryRequest;
