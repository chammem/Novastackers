const axios = require('axios');
const FoodItem = require('../models/foodItem');
const FoodSale = require('../models/sales/FoodSaleItem');
const SuggestedProduct = require('../models/SuggestedProduct');

exports.getUserRecommendations = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
    });
  }

  try {
    const response = await axios.post('http://172.21.0.4:5000/recommend/user', {
      user_id: userId,
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Error fetching user recommendations',
    });
  }
};

exports.getProductRecommendations = async (req, res) => {
  const { productName } = req.body;

  if (!productName) {
    return res.status(400).json({
      success: false,
      message: 'Product name is required',
    });
  }

  try {
    const flaskResponse = await axios.post('http://172.21.0.4:5000/recommend/product', {
      product_name: productName,
    });

    const recommended = flaskResponse.data.recommendations;

    const results = await Promise.all(
      recommended.map(async (rec) => {
        const foodItem = await FoodItem.findOne({ name: rec.product_name });
        
        if (foodItem) {
          const foodSale = await FoodSale.findOne({
            foodItem: foodItem._id,
            isAvailable: true,
          });

          if (foodSale) {
            return {
              name: foodItem.name,
              image: foodSale.image,
              id: foodSale._id,
            };
          }
        }

        const existingSuggestedProduct = await SuggestedProduct.findOne({ name: rec.product_name });

        if (existingSuggestedProduct) {
          existingSuggestedProduct.recommendationCount += 1;
          await existingSuggestedProduct.save();
          return existingSuggestedProduct;
        }

        const suggestedProduct = {
          name: rec.product_name,
          message: 'This product is not available in our database.',
          aisle: rec.aisle || 'Unknown aisle',
          score: rec.score || 'No score available',
        };

        const newSuggestedProduct = await SuggestedProduct.create(suggestedProduct);
        return newSuggestedProduct;
      })
    );

    const filtered = results.filter((r) => r !== null);

    res.status(200).json({
      success: true,
      results: filtered,
    });

  } catch (error) {
    console.error('Product recommendation error:', error.message);
    if (error.response) {
      console.error('Flask API response:', error.response.data); // Log the full response from Flask
    }
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Error fetching product recommendations',
    });
  }
};

exports.getFoodRecommendations = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
    });
  }

  try {
    const response = await axios.post('http://172.21.0.4:5000/recommend/user', {
      user_id: userId,
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Error fetching food recommendations',
    });
  }
};
