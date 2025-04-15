const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodDonation",
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItem"
  }],
  requiredCapacity: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'small'
  },
  centerPoint: {
    type: [Number], // [lat, lng]
    required: true
  },
  status: {
    type: String,
    enum: ['suggested', 'requested', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'suggested'
  },
  assignmentStatus: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Add pickup and delivery code fields
  pickupCode: { type: String },
  pickupCodeGeneratedAt: { type: Date },
  deliveryCode: { type: String },
  deliveryCodeGeneratedAt: { type: Date },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  assignmentRequestedAt: { 
    type: Date,
    default: null 
  },
});

module.exports = mongoose.model("Batch", batchSchema);