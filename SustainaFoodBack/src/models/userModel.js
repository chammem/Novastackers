const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
  
const Schema =  mongoose.Schema;
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|esprit\.tn)$/;

const userSchema = new Schema(
{  

    email: {
      type: String,required: true,unique: true,trim: true,lowercase: true,
      validate: {
        validator: function(value) {
            return emailRegex.test(value);
        },
        message: 'Email must be from gmail.com, yahoo.com, or esprit.tn.'
    }
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
    address: { type: String, trim: true, validate: {
      validator: function(value) {
          return /^\d{8}$/.test(value.toString()); // Ensures exactly 8 digits
      },
      message: 'Phone number must be exactly 8 digits.'
  } },
  facebook:{type: String,required: true},
    dietaryRestrictions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    
    //Driver specific fields//
    vehicleType: { type: String },
    licensePlateNumber: { type: String },
    vehicleCapacity: { type: String },
    workingHours: { type: String },
    daysAvailable: { type: [String], default: [] },
    driverLicenseNumber: { type: String },
    vehicleRegistration: { type: String },

    //Restaurant-specific fields//
    restaurantName: { type: String },
    businessType: { type: String },
    foodTypesDonated: { type: [String], default: [] },
    averageQuantityDonated: { type: String },
    preferredPickupTimes: { type: String },
    businessLicenseNumber: { type: String },
    taxId: { type: String },
    
    //
    supermarketName: { type: String },
    ///NonUser-specific attribute //
    isActive:{type:Boolean,default:false},
    verificationStatus:{
      type:String,
      enum:["pending","verified","rejected"],
      default:"pending"
    }
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




module.exports = mongoose.model("User", userSchema);