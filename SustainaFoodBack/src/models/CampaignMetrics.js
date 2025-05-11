const mongoose = require('mongoose');

const campaignMetricsSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodDonation', // Utiliser la même référence que dans foodItem.js
    required: true
  },
  donorsCount: {
    type: Number,
    default: 0
  },
  foodCollected: {
    type: Number, // en kilogrammes
    default: 0
  },
  donationsCount: {
    type: Number,
    default: 0
  },
  deliveredItems: {
    type: Number,
    default: 0
  },
  impactScore: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calcule le score d'impact basé sur les autres métriques
campaignMetricsSchema.methods.calculateImpactScore = function() {
  const baseScore = this.donorsCount * 2;
  const quantityFactor = this.foodCollected / 5; // Plus sensible à la quantité
  const donationsFactor = this.donationsCount * 3;
  const deliveryFactor = this.deliveredItems * 5; // Bonus pour les articles livrés
  
  this.impactScore = Math.min(100, Math.floor(baseScore + quantityFactor + donationsFactor + deliveryFactor));
  return this.impactScore;
};

module.exports = mongoose.model('CampaignMetrics', campaignMetricsSchema);
