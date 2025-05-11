const mongoose = require('mongoose');

const mysterypackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  pickupTime: String,
  location: String,
  category: {
    type: String,
    default: 'Lunch'
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  restaurant: {
    type: String,
    required: true
  },
  selectedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodSale'
  }],
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('mysterypack', mysterypackSchema);
