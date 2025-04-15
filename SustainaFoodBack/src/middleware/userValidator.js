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
    .valid("user", "driver", "restaurant", "supermarket", "charity", "admin")
    .required(),
  fullName: Joi.string().trim().when("role",{
    is : Joi.valid('driver','user'),
    then:Joi.required(),
    otherwise:Joi.required()
  }),
  phoneNumber: Joi.string()
    .pattern(/^\d{8,15}$/)
    .messages({
      "string.pattern.base":
        "Phone number must contain only numbers and be between 8 to 15 digits.",
    })
    .optional(),
  // address: Joi.string()
  //   .trim()
  //   .min(5)
  //   .max(100)
  //   .pattern(/^[a-zA-Z0-9\s,.'-]{5,100}$/)
  //   .messages({
  //     "string.pattern.base":
  //       "Address must contain only letters, numbers, spaces, and common symbols (, . ' -).",
  //   })
  //   .required(),
    address: Joi.string().optional(),
  lat: Joi.number().optional(),
  lng: Joi.number().optional(),
  dietaryRestrictions: Joi.array().items(Joi.string()).default([]).optional(),
  allergies: Joi.array().items(Joi.string()).default([]).optional(),

  // Driver-specific fields
  vehicleType: Joi.string(),
  licensePlateNumber: Joi.string(),
  vehicleCapacity: Joi.string(),
  driverLicenseNumber: Joi.string(),
  vehicleRegistration: Joi.string(),
  workingHours: Joi.string().optional(),
  daysAvailable: Joi.array().items(Joi.string()).default([]).optional(),

  // Restaurant-specific fields
  //restaurantName: Joi.string().when("role", { is: "restaurant", then: Joi.required(), otherwise: Joi.optional() }),
  businessType: Joi.string().optional(),
  foodTypesDonated: Joi.array().items(Joi.string()).default([]).optional(),
  averageQuantityDonated: Joi.string().optional(),
  preferredPickupTimes: Joi.string().optional(),

  // Fields required for both restaurants and supermarkets
  // businessLicenseNumber: Joi.string().when("role", {
  //   is: Joi.valid("restaurant", "supermarket"),
  //   then: Joi.required(),
  //   otherwise: Joi.optional(),
  // }),
  // taxId: Joi.string().when("role", {
  //   is: Joi.valid("restaurant", "supermarket"),
  //   then: Joi.required(),
  //   otherwise: Joi.optional(),
  // }),

  // Supermarket-specific fields
  //supermarketName: Joi.string().when("role", { is: "supermarket", then: Joi.required(), otherwise: Joi.optional() }),
});

module.exports = userValidatorSchema;
