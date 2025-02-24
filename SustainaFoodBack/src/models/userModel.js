const mongoose = require("mongoose");
const Schema =  mongoose.Schema;
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|esprit\.tn)$/;

const user = new Schema(
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
    role: {
      type: String,
      required: true,
      enum: ["user", "driver", "restaurant", "supermarket", "charity"],
    },
    fullName: { type: String, required: true, trim: true },
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

module.exports = mongoose.model("User", user);