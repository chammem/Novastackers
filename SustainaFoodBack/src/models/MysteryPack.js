const mongoose = require('mongoose');

const mysteryPackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  discountedPrice: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x300'
  },
  pickupTime: {
    type: String,
    default: '18h00 - 20h00'
  },
  location: {
    type: String,
    default: 'Adresse non spécifiée'
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Bakery', 'Groceries']
  },
  availableQuantity: {
    type: Number,
    required: true
  },
  selectedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodSale'
  }]
}, { timestamps: true });

module.exports = mongoose.model('MysteryPack', mysteryPackSchema);
