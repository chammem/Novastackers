const FoodSaleItem = require('../../models/sales/FoodSaleItem');
const FoodItem = require('../../models/foodItem');
const User = require('../../models/userModel');
const Order = require('../../models/sales/Order');

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
      size,
    } = req.body;

    // Basic validation
    if (!price || !name) {
      return res.status(400).json({
        success: false,
        message: "Food name and price are required",
      });
    }

    const foodItem = new FoodItem({
      buisiness_id: buisinessId,
      name,
      quantity: quantityAvailable || 1,
      expiry_date: expiresAt,
      category,
      allergens,
      size: size || "small",
      status: "pending",
    });

    const savedFoodItem = await foodItem.save();

    const newFoodSale = new FoodSaleItem({
      foodItem: savedFoodItem._id,
      price,
      discountedPrice,
      quantityAvailable: quantityAvailable || 1,
      expiresAt: expiresAt,
      isAvailable: true, // Explicitly set this to true
    });

    const savedFoodSale = await newFoodSale.save();

    return res.status(201).json({
      success: true,
      data: {
        foodSale: savedFoodSale,
        foodItem: savedFoodItem,
      },
      message: "Food item created and listed for sale successfully",
    });
  } catch (error) {
    console.error("Error creating food sale:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating food sale",
      error: error.message,
    });
  }
};

exports.getAllFoodSales = async (req, res) => {
  try {
    // Basic pagination setup remains the same
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};

    // Apply availability filter as before
    if (req.query.available === "true") {
      filter.isAvailable = true;
    } else if (req.query.available === "false") {
      filter.isAvailable = false;
    }

    // Calculate the sum of quantities for each food sale from paid orders
    const soldQuantities = await Order.aggregate([
      { $match: { status: 'paid' } },
      { 
        $group: {
          _id: '$foodSale',
          totalSold: { $sum: '$quantity' }
        }
      }
    ]);

    // Create a map of foodSaleId -> soldQuantity for efficient lookup
    const soldQuantityMap = {};
    soldQuantities.forEach(item => {
      soldQuantityMap[item._id.toString()] = item.totalSold;
    });

    // Business filter (keep as is)
    if (req.query.businessId) {
      // Same as before
      const businessFoodItems = await FoodItem.find({
        buisiness_id: req.query.businessId,
      }).select("_id");
      const foodItemIds = businessFoodItems.map((item) => item._id);
      filter.foodItem = { $in: foodItemIds };
    }

    // Get all food sales meeting the filter criteria
    let foodSales = await FoodSaleItem.find(filter)
      .populate("foodItem")
      .sort({ listedAt: -1 });

    // Filter out items that are sold out (sold quantity >= available quantity)
    foodSales = foodSales.filter(item => {
      const itemId = item._id.toString();
      const soldQty = soldQuantityMap[itemId] || 0;
      const remainingQty = item.quantityAvailable - soldQty;
      
      // Update the item to show the actual remaining quantity
      item.remainingQuantity = remainingQty;
      
      // Only include items with remaining quantity > 0
      return remainingQty > 0;
    });

    // Apply pagination after filtering
    const totalFoodSales = foodSales.length;
    foodSales = foodSales.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      count: foodSales.length,
      pagination: {
        total: totalFoodSales,
        pages: Math.ceil(totalFoodSales / limit),
        currentPage: page,
        perPage: limit,
      },
      data: foodSales,
      message: "Food sales retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching food sales:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching food sales",
      error: error.message,
    });
  }
};

exports.getRestaurantDetails = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Find the restaurant/business details
    const restaurant = await User.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Find count of food sales from this restaurant
    const foodItemIds = await FoodItem.find({
      buisiness_id: restaurantId,
    }).select("_id");

    const foodSalesCount = await FoodSaleItem.countDocuments({
      foodItem: { $in: foodItemIds.map((item) => item._id) },
      isAvailable: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.fullName,
          email: restaurant.email,
          address: restaurant.address,
          phone: restaurant.phone,
          businessType: restaurant.businessType || "Restaurant",
          itemCount: foodSalesCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching restaurant details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching restaurant details",
      error: error.message,
    });
  }
};

exports.getRestaurantFoodSales = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // First find all food items belonging to this restaurant
    const foodItems = await FoodItem.find({
      buisiness_id: restaurantId,
    }).select("_id");

    if (foodItems.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: "No food items found for this restaurant",
      });
    }

    // Extract IDs to use in the food sales query
    const foodItemIds = foodItems.map((item) => item._id);

    // Get food sales for this restaurant with pagination
    const foodSales = await FoodSaleItem.find({
      foodItem: { $in: foodItemIds },
      isAvailable: true,
    })
      .populate("foodItem")
      .sort({ listedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total food sales
    const totalFoodSales = await FoodSaleItem.countDocuments({
      foodItem: { $in: foodItemIds },
      isAvailable: true,
    });

    return res.status(200).json({
      success: true,
      count: foodSales.length,
      pagination: {
        total: totalFoodSales,
        pages: Math.ceil(totalFoodSales / limit),
        currentPage: page,
        perPage: limit,
      },
      data: foodSales,
      message: "Restaurant food sales retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching restaurant food sales:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching restaurant food sales",
      error: error.message,
    });
  }
};

exports.getFoodSaleById = async (req, res) => {
  try {
    // First check if ID is valid to prevent server errors
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid food sale ID format'
      });
    }

    // Modified to properly populate the nested restaurant data
    const foodSale = await FoodSaleItem.findById(req.params.id)
      .populate({
        path: 'foodItem',
        populate: {
          path: 'buisiness_id',
          model: 'User',
          select: 'fullName email address phone businessType'
        }
      });
    
    if (!foodSale) {
      return res.status(404).json({
        success: false,
        message: 'Food sale item not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: foodSale
    });
  } catch (error) {
    console.error('Error fetching food sale:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching food sale details',
      error: error.message
    });
  }
};
