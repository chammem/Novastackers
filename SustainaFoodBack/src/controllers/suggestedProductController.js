const SuggestedProduct = require('../models/SuggestedProduct');

// Function to save a suggested product
const saveSuggestedProduct = async (req, res) => {
  try {
    const { name, aisle, score, message } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    console.log(`Checking if product exists: ${name}`);

    // Check if the product already exists
    const existingProduct = await SuggestedProduct.findOne({ name });

    if (existingProduct) {
      console.log(`Product found: ${existingProduct.name}, incrementing recommendationCount.`);
      // Increment the recommendation count if the product exists
      existingProduct.recommendationCount += 1;
      await existingProduct.save();
      console.log(`Updated recommendationCount: ${existingProduct.recommendationCount}`);
      return res.status(200).json({ success: true, data: existingProduct });
    }

    console.log(`Product not found, creating a new entry for: ${name}`);
    // Create a new suggested product if it doesn't exist
    const suggestedProduct = new SuggestedProduct({
      name,
      aisle,
      score,
      message,
      recommendationCount: 1, // Initialize recommendation count
    });

    // Save to the database
    await suggestedProduct.save();
    console.log(`New product created: ${suggestedProduct.name}`);

    res.status(201).json({ success: true, data: suggestedProduct });
  } catch (error) {
    console.error('Error saving suggested product:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Function to get all suggested products
const getSuggestedProducts = async (req, res) => {
  try {
    const suggestedProducts = await SuggestedProduct.find();
    res.status(200).json({ success: true, data: suggestedProducts });
  } catch (error) {
    console.error('Error fetching suggested products:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = { saveSuggestedProduct, getSuggestedProducts };