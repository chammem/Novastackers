const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|esprit\.tn)$/;

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String },

    role: {
      type: String,

      enum: ["user", "driver", "restaurant", "supermarket", "charity","volunteer", "admin"],
    },
    fullName: { type: String, required: false, trim: true },
    phoneNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    lat: { type: Number },
    lng: { type: Number },

    facebook: { type: String, optional: true },
    isDisabled: { type: Boolean, default: false }, // Désactivé = true
    googleId: { type: String, unique: true },
   
   
   
   
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
    isActive: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    // Charity (NGO) specific fields
    organizationName: { type: String, trim: true },
    mission: { type: String },
    description: { type: String },
    website: { type: String },
    logoUrl: { type: String },
    donationNeeds: { type: [String], default: [] },
    instagram: { type: String },
   facebook: { type: String },
    twitter: { type: String },

  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
