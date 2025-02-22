const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    confirmPassword:{type:String,required:true},
    role: {
      type: String,
      required: true,
      enum: ["user", "driver", "restaurant", "supermarket", "charity"],
    },
    fullName: { type: String, required: false, trim: true },
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
    supermarketName: { type: String },
  },
  { timestamps: true }
);

userSchema.pre('save',async function(next) {
const  user = this;

if(!user.isModified('password'))return next();
try{
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(user.password,salt);
   user.password = hashedPassword;
   next();
}catch(error){
    return next(error);
}


 
})




// Create models
const userModel = mongoose.model("User", userSchema);

// Export all models as an object
module.exports = userModel;
