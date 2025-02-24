const mongoose = require("mongoose");


const roleVerificationSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driverLicense: {
      url: { type: String, required: true },
      verified: { type: Boolean, default: false },
    },
    vehiculeRegistration: {
      url: { type: String, required: true },
      verified: { type: Boolean, default: false },
    },
    taxId: {
        url: { type: String, required: true },
        verified: { type: Boolean, default: false },
      },
      businessLicenseNumber: {
        url: { type: String, required: true },
        verified: { type: Boolean, default: false },
      },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminComments: { type: String }, // Optional for feedback on rejection
  },
  { timestamps: true }
)
const RoleVerification = mongoose.model("RoleVerification",roleVerificationSchema);
module.exports = RoleVerification;