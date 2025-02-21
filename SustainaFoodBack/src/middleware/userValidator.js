const Joi = require("joi");

// Joi validation schema for user registration
const userValidatorSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match password",
  }),
  role: Joi.string()
    .valid("user", "driver", "restaurant", "supermarket", "charity")
    .required(),
  fullName: Joi.string().trim().required(),
  phoneNumber: Joi.string()
    .pattern(/^\d{8,15}$/)
    .messages({
      "string.pattern.base":
        "Phone number must contain only numbers and be between 8 to 15 digits.",
    })
    .optional(),
  address: Joi.string()
    .trim()
    .min(5)
    .max(100)
    .pattern(/^[a-zA-Z0-9\s,.'-]{5,100}$/)
    .messages({
      "string.pattern.base":
        "Address must contain only letters, numbers, spaces, and common symbols (, . ' -).",
    })
    .required(),

  dietaryRestrictions: Joi.array().items(Joi.string()).default([]).optional(),
  allergies: Joi.array().items(Joi.string()).default([]).optional(),
  vehicleType: Joi.string().optional(),
  licensePlateNumber: Joi.string().optional(),
  vehicleCapacity: Joi.string().optional(),
  workingHours: Joi.string().optional(),
  daysAvailable: Joi.array().items(Joi.string()).default([]).optional(),
  driverLicenseNumber: Joi.string().optional(),
  vehicleRegistration: Joi.string().optional(),
  restaurantName: Joi.string().optional(),
  businessType: Joi.string().optional(),
  foodTypesDonated: Joi.array().items(Joi.string()).default([]).optional(),
  averageQuantityDonated: Joi.string().optional(),
  preferredPickupTimes: Joi.string().optional(),
  businessLicenseNumber: Joi.string().optional(),
  taxId: Joi.string().optional(),
  supermarketName: Joi.string().optional(),
});

module.exports = userValidatorSchema;
