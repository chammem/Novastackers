const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  buisiness_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodDonation", // assuming your campaign model is FoodDonation
  },
  
  name: { type: String, required: false },
  quantity: { type: Number, required:false},
  expiry_date: { type: Date, required: false },
  category: { type: String, required: false },
  allergens: { type: String, required: false },
  nutritional_category: { type: String, required: false },
  image_url: { type: String, required: false },
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked-up', 'delivered', 'cancelled','requested'],
    default: 'pending',
  }, 
  volunteerPickedUpAt:{type:Date,required:false},
  supermarketConfirmedAt:{type:Date,required:false},

  created_at: { type: Date, default: Date.now },
  pickupCode: { type: String },             // code used for confirmation
  pickupCodeGeneratedAt: { type: Date },    // optional: track when code was created

  deliveryCode: { type: String },              // code used for delivery confirmation
  deliveryCodeGeneratedAt: { type: Date },
  deliveredAt: { type: Date },
  assignmentStatus: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  size: { 
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'small',
    required: true
  },
});

// Remplacer le hook post-save existant par une version plus robuste
foodSchema.post('save', async function(doc) {
  console.log(`FoodItem saved with ID: ${doc._id}, donationId: ${doc.donationId}`);
  
  if (!doc.donationId) {
    console.log('No donationId found, skipping metrics update');
    return;
  }
  
  try {
    // Importer directement les modèles pour éviter les problèmes de référence circulaire
    const CampaignMetrics = mongoose.model('CampaignMetrics');
    
    // Méthode de mise à jour directe qui recalcule immédiatement
    await CampaignMetrics.updateMetricsForCampaign(doc.donationId.toString());
    console.log(`Metrics updated successfully for campaign: ${doc.donationId}`);
  } catch (error) {
    console.error(`Error updating metrics after food item save: ${error.message}`);
    console.error(error.stack);
  }
});

// Hook pour mettre à jour le score d'impact à chaque ajout d'item
foodSchema.post('save', async function() {
  if (!this.donationId) return;
  
  try {
    // Appeler la fonction de mise à jour des métriques
    const metricsController = require('../controllers/campaignMetricsController');
    await metricsController.updateMetricsForCampaign(this.donationId);
  } catch (error) {
    console.error('Error updating impact score:', error);
  }
});

const FoodItem = mongoose.model("FoodItem", foodSchema);
module.exports = FoodItem;
