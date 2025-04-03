const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  buisiness_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodDonation", // assuming your campaign model is FoodDonation
  },
  
  name: { type: String, required: false },
  quantity: { type: Number, required:false},
  expiry_date: { type: Date, required: false },
  category: { type: String, required: false },
  allergens: { type: String, required: false },
  nutritional_category: { type: String, required: false },
  image_url: { type: String, required: false },
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked-up', 'delivered', 'cancelled'],
    default: 'pending',
  }, 
  volunteerPickedUpAt:{type:Date,required:false},
  supermarketConfirmedAt:{type:Date,required:false},

  created_at: { type: Date, default: Date.now },
  pickupCode: { type: String },             // code used for confirmation
  pickupCodeGeneratedAt: { type: Date },    // optional: track when code was created

  deliveryCode: { type: String },              // code used for delivery confirmation
  deliveryCodeGeneratedAt: { type: Date },
  deliveredAt: { type: Date },

});

const FoodItem = mongoose.model("FoodItem", foodSchema);
module.exports = FoodItem;
