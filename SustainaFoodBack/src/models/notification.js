const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
 
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "food_availability",
      "delivery_update",
      "expiry_alert",
      "system_notification",
    ],
    required: true,
  },
  channel: { type: String, enum: ["email", "SMS", "in-app"], required: true },
  sent_at: { type: Date, default: Date.now },
  status: { type: String, enum: ["sent", "read"], required: true },
});
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
