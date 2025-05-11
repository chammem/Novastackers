const Order = require("../../models/sales/Order");
const FoodSale = require("../../models/sales/FoodSaleItem");
const driverAssignmentService = require('../../services/driverAssignmentService');
// USER ROUTES
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      foodSaleId,
      quantity,
      deliveryAddress,
      paymentMethod,
      specialInstructions,
    } = req.body;

    // Validate location coordinates
    if (!deliveryAddress.lat || !deliveryAddress.lng) {
      return res.status(400).json({
        success: false,
        message: "Delivery coordinates are required",
      });
    }

    // Find the food sale item
    const foodSale = await FoodSale.findById(foodSaleId);
    if (!foodSale) {
      return res.status(404).json({
        success: false,
        message: "Food sale item not found",
      });
    }

    // Check if quantity is available
    if (foodSale.quantityAvailable < quantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity is not available",
      });
    }

    // Calculate total amount
    const price = foodSale.discountedPrice || foodSale.price;
    const totalAmount = price * quantity;

    // Create order with coordinates
    const order = new Order({
      buyer: userId,
      foodSale: foodSaleId,
      quantity,
      unitPrice: price,
      totalPrice: totalAmount,
      paymentMethod,
      deliveryAddress: deliveryAddress, // Now includes lat/lng
      specialInstructions,
      statusHistory: [{ status: "pending", updatedBy: userId }],
    });

    // Save order
    await order.save();

    // Reduce available quantity
    foodSale.quantityAvailable -= quantity;
    await foodSale.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all orders for a user by ID (no auth middleware)
exports.getUserOrders = async (req, res) => {
  try {
    // Get userId from query params instead of auth middleware
    const userId = req.params.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Optional status filter

    // Build the query
    const query = { user: userId };

    // Add status filter if provided
    if (
      status &&
      ["pending", "paid", "fulfilled", "cancelled"].includes(status)
    ) {
      query.status = status;
    }

    // Get orders with pagination
    const orders = await Order.find(query)
      .populate({
        path: "foodSale",
        model: "FoodSale",
        populate: {
          path: "foodItem",
          model: "FoodItem",
          select: "name category allergens size",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total orders for pagination
    const totalOrders = await Order.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit),
        currentPage: page,
        perPage: limit,
      },
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get details of a specific order (no auth middleware)
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.query.userId; // Get userId from query

    // Build the query
    const query = { _id: orderId };

    // Add user filter if provided for security
    if (userId) {
      query.user = userId;
    }

    // Find order
    const order = await Order.findOne(query).populate({
      path: "foodSale",
      populate: [
        {
          path: "foodItem",
          select: "name category allergens size",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.message,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { userId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    const allowedStatusForCancel = ["pending", "accepted"];
    if (!allowedStatusForCancel.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in ${order.status} status`,
      });
    }

    // Update status
    order.status = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      updatedBy: userId,
    });

    // Return quantity to food sale item
    const foodSale = await FoodSale.findById(order.foodSale);
    if (foodSale) {
      foodSale.quantityAvailable += order.quantity;
      await foodSale.save();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { paymentStatus, userId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === "paid") {
      order.status = "accepted";
      order.statusHistory.push({
        status: "accepted",
        updatedBy: userId,
      });
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// RESTAURANT ROUTES
exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    // Build query
    const query = {};
    if (status) query.status = status;

    // Find orders for this restaurant
    const orders = await Order.find(query)
      .populate({
        path: "foodSale",
        match: { restaurant: restaurantId },
        populate: { path: "foodItem" },
      })
      .populate("buyer", "name email")
      .sort({ orderedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Filter out any orders where foodSale didn't match
    const filteredOrders = orders.filter((order) => order.foodSale);

    // Count total matching orders
    const totalOrders = filteredOrders.length;

    return res.status(200).json({
      success: true,
      data: {
        orders: filteredOrders,
        pagination: {
          total: totalOrders,
          page,
          pages: Math.ceil(totalOrders / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status, userId } = req.body;

    const order = await Order.findById(orderId).populate("foodSale");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ["accepted", "rejected"],
      accepted: ["preparing", "cancelled"],
      preparing: ["ready"],
      ready: ["delivering", "completed"],
      delivering: ["delivered"],
      delivered: ["completed"],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`,
      });
    }

    // Update status
    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: userId,
    });

    // If delivered, set deliveredAt
    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating order status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.findBestDriver = async (req, res) => {
  try {
    const { lat, lng, size = 'small' } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const deliveryLocation = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };
    
    // Use the service to find best driver
    const bestDriver = await driverAssignmentService.findBestDriver(
      deliveryLocation,
      size
    );
    
    if (!bestDriver) {
      return res.status(404).json({
        success: false,
        message: 'No suitable driver found'
      });
    }
    
    // Calculate distance to provide additional context
    const distance = driverAssignmentService.calculateDistance(
      { lat: bestDriver.lat, lng: bestDriver.lng },
      deliveryLocation
    );
    
    return res.status(200).json({
      success: true,
      driver: {
        _id: bestDriver._id,
        fullName: bestDriver.fullName,
        phone: bestDriver.phone,
        location: {
          lat: bestDriver.lat,
          lng: bestDriver.lng
        },
        distance: {
          km: distance.toFixed(2),
          estimated_minutes: Math.ceil(distance * 2) // Rough estimate
        },
        vehicleType: bestDriver.vehicleType || 'Not specified',
        capacity: bestDriver.transportCapacity || 'small'
      }
    });
  } catch (error) {
    console.error('Error finding best driver:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Test driver assignment for a specific order
exports.assignDriverToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    // Get the order to retrieve its delivery address
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (!order.deliveryAddress?.lat || !order.deliveryAddress?.lng) {
      return res.status(400).json({
        success: false,
        message: 'Order has no valid delivery coordinates'
      });
    }
    
    // Use the service to assign a driver
    const result = await driverAssignmentService.assignDriverToOrder(
      orderId,
      order.deliveryAddress,
      req.query.size || 'small'
    );
    
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Error assigning driver:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get test order coordinates (for demo purposes)
exports.getOrderCoordinates = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      orderId: order._id,
      coordinates: {
        lat: order.deliveryAddress?.lat || null,
        lng: order.deliveryAddress?.lng || null
      },
      address: {
        street: order.deliveryAddress?.street,
        city: order.deliveryAddress?.city,
        state: order.deliveryAddress?.state,
        zipCode: order.deliveryAddress?.zipCode,
        country: order.deliveryAddress?.country
      }
    });
  } catch (error) {
    console.error('Error getting order coordinates:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add this function to your orderController
exports.getOrderTrackingData = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the order
    const order = await Order.findById(orderId)
      .populate('assignedDriver')
      .populate({
        path: 'foodSale',
        populate: {
          path: 'foodItem',
          populate: 'buisiness_id'
        }
      });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // For now, return default demo locations
    // Later you can replace these with actual data from your database
    const trackingData = {
      driverLocation: {
        lat: 36.8065,
        lng: 10.1815, // Default Tunis coordinates
        timestamp: new Date()
      },
      restaurantLocation: {
        lat: 36.8125,
        lng: 10.1765 // Nearby coordinates
      },
      deliveryLocation: {
        lat: 36.8015,
        lng: 10.1865 // Nearby coordinates
      }
    };
    
    return res.status(200).json({
      success: true,
      data: trackingData
    });
    
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return res.status(500).json({
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};

// Add this function to your existing controller
exports.getOrderLocations = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the order with related data
    const order = await Order.findById(orderId)
      .populate({
        path: 'foodSale',
        populate: {
          path: 'foodItem',
          populate: 'buisiness_id'
        }
      });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Extract delivery address location
    const deliveryLocation = order.deliveryAddress ? {
      lat: order.deliveryAddress.lat,
      lng: order.deliveryAddress.lng,
      address: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`
    } : null;
    
    // Extract restaurant location
    let restaurantLocation = null;
    if (order.foodSale?.foodItem?.buisiness_id) {
      const business = order.foodSale.foodItem.buisiness_id;
      restaurantLocation = {
        lat: business.lat,
        lng: business.lng,
        name: business.fullName || business.restaurantName || "Restaurant"
      };
    }
    
    return res.status(200).json({
      success: true,
      data: {
        restaurantLocation,
        deliveryLocation
      }
    });
    
  } catch (error) {
    console.error('Error fetching order locations:', error);
    return res.status(500).json({
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
};
