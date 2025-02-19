const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["user", "driver", "restaurant", "supermarket", "admin", "charity"] },
  fullName: { type: String, trim: true },
  phoneNumber: { type: String, trim: true },
  address: { type: String, trim: true },
  dietaryRestrictions: { type: [String], default: [] },
  allergies: { type: [String], default: [] },
  vehicleType: { type: String },
  licensePlateNumber: { type: String },
  vehicleCapacity: { type: String },
  workingHours: { type: String },
  daysAvailable: { type: [String], default: [] },
  driverLicenseNumber: { type: String },
  vehicleRegistration: { type: String },
  restaurantName: { type: String },
  businessType: { type: String },
  foodTypesDonated: { type: [String], default: [] },
  averageQuantityDonated: { type: String },
  preferredPickupTimes: { type: String },
  businessLicenseNumber: { type: String },
  taxId: { type: String },
  supermarketName: { type: String }
}, { timestamps: true });

const userPreferenceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity_level: { type: String, enum: ['sedentary', 'moderate', 'active'], required: true },
  dietary_preferences: { type: [String], default: [] },  // e.g., ['vegan', 'high_protein']
  disliked_foods: { type: [String], default: [] },
  past_selections: { type: [mongoose.Schema.Types.ObjectId], ref: 'FoodItem' },
}, { timestamps: true });

const recommendationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recommended_foods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }],
  created_at: { type: Date, default: Date.now },
  
});


//const User = mongoose.model("User", userSchema);
module.exports = 
{
  User:mongoose.model("User", userSchema),
  
  UserPreference:mongoose.model("UserPreference",userPreferenceSchema),
  Recommendation:mongoose.model("Recommendation",recommendationSchema),

};
