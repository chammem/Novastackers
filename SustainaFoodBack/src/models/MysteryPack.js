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
  }
}, { timestamps: true });

module.exports = mongoose.model('MysteryPack', mysteryPackSchema);
