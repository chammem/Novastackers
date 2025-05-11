/**
 * Script pour corriger les métriques existantes et vérifier toutes les campagnes
 * Usage: node src/scripts/fixMetrics.js
 */

const mongoose = require('mongoose');
const config = require('../config/db');

(async function() {
  try {
    // Se connecter à la base de données
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    
    // Importer les modèles
    const FoodDonation = require('../models/foodDonation');
    const CampaignMetrics = require('../models/CampaignMetrics');
    
    // Récupérer toutes les campagnes de don
    const campaigns = await FoodDonation.find({});
    console.log(`Found ${campaigns.length} campaigns`);
    
    // Mettre à jour les métriques pour chaque campagne
    let successCount = 0;
    let errorCount = 0;
    
    for (const campaign of campaigns) {
      try {
        console.log(`Processing campaign: ${campaign._id} - ${campaign.name || 'No name'}`);
        await CampaignMetrics.updateMetricsForCampaign(campaign._id.toString());
        successCount++;
      } catch (error) {
        console.error(`Error processing campaign ${campaign._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`Metrics update complete!`);
    console.log(`Success: ${successCount}, Errors: ${errorCount}`);
    
    // Déconnexion de la base de données
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  }
})();
