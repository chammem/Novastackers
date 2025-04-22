const FoodSaleItem = require('../../models/sales/FoodSaleItem');
const FoodItem = require('../../models/foodItem');

exports.createFoodSale = async (req, res) => {
  try {
    const { 
      buisinessId,
      price, 
      discountedPrice, 
      quantityAvailable, 
      expiresAt,
      name,
      category,
      allergens,
      size
    } = req.body;

    // Basic validation
    if (!price || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Food name and price are required' 
      });
    }

    const foodItem = new FoodItem({
      buisiness_id: buisinessId, 
      name,
      quantity: quantityAvailable || 1,
      expiry_date: expiresAt,
      category,
      allergens,
      size: size || 'small',
      status: 'pending'
    });

    const savedFoodItem = await foodItem.save();

    const newFoodSale = new FoodSaleItem({
      foodItem: savedFoodItem._id,
      price,
      discountedPrice,
      quantityAvailable: quantityAvailable || 1,
      expiresAt: expiresAt,
      isAvailable: true  // Explicitly set this to true
    });

    const savedFoodSale = await newFoodSale.save();

    return res.status(201).json({
      success: true,
      data: {
        foodSale: savedFoodSale,
        foodItem: savedFoodItem
      },
      message: 'Food item created and listed for sale successfully'
    });

  } catch (error) {
    console.error('Error creating food sale:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating food sale',
      error: error.message
    });
  }
};

exports.getAllFoodSales = async (req, res) => {
  try {
    // Basic pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Start with an empty filter to get all items by default
    const filter = {};
    
    // Apply isAvailable filter only if specified
    if (req.query.available === 'true') {
      filter.isAvailable = true;
    } else if (req.query.available === 'false') {
      filter.isAvailable = false;
    }
    // If not specified, return all items regardless of availability
    
    // Optional business filter
    if (req.query.businessId) {
      // We need to first find food items for this business
      const businessFoodItems = await FoodItem.find({ 
        buisiness_id: req.query.businessId 
      }).select('_id');
      
      // Extract the IDs to use in our food sales query
      const foodItemIds = businessFoodItems.map(item => item._id);
      filter.foodItem = { $in: foodItemIds };
    }

    // Get food sales with pagination and populate food item details
    const foodSales = await FoodSaleItem.find(filter)
      .populate('foodItem')
      .sort({ listedAt: -1 })
      .skip(skip)
      .limit(limit);
      
    // Count total food sales for pagination info
    const totalFoodSales = await FoodSaleItem.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      count: foodSales.length,
      pagination: {
        total: totalFoodSales,
        pages: Math.ceil(totalFoodSales / limit),
        currentPage: page,
        perPage: limit
      },
      data: foodSales,
      message: 'Food sales retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching food sales:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching food sales',
      error: error.message
    });
  }
};