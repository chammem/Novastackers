const mongoose = require('mongoose');

const SuggestedProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  aisle: {
    type: String,
    required: false,
  },
  score: {
    type: Number,
    required: false,
  },
  message: {
    type: String,
    required: false,
  },
  recommendationCount: {
    type: Number,
    default: 1, // Track how many times the product is recommended
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SuggestedProduct', SuggestedProductSchema);