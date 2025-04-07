const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
 
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  message: { type: String, required: false },
  type: {
    type: String,
    enum: [
      "food_availability",
      "delivery_update",
      "expiry_alert",
      "system_notification",
      'pickup_code',
      'delivery_code',
      'status_update',
      'assignment','assignment-request'
    ],
    required: false,
  },
  
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  channel: { type: String, enum: ["email", "SMS", "in-app"], required: false },
  // sent_at: { type: Date, default: Date.now },
  // status: { type: String, enum: ["sent", "read"], required: false },
});
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
