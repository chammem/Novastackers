const mongoose = require('mongoose');

const foodSaleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  discountedPrice: Number,
  businessId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Business'
  },
  businessName: { type: String, required: true },
  businessType: {
    type: String,
    enum: ['restaurant', 'supermarket'],
    required: true
  },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  image: String
});

// Enable virtuals and getters in schema options
foodSaleSchema.set('toJSON', { virtuals: true, getters: true });
foodSaleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.FoodSale || mongoose.model('FoodSale', foodSaleSchema);
