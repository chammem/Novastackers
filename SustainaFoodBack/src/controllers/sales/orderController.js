const Order = require('../../models/sales/Order');
const FoodSale = require('../../models/sales/FoodSale');

// USER ROUTES
exports.createOrder = async (req, res) => {
  try {
    const { userId, foodSaleId, quantity, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Find the food sale item
    const foodSale = await FoodSale.findById(foodSaleId);
    if (!foodSale) {
      return res.status(404).json({ 
        success: false, 
        message: 'Food sale item not found' 
      });
    }

    // Check if quantity is available
    if (foodSale.quantityAvailable < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Requested quantity is not available' 
      });
    }

    // Calculate total amount
    const price = foodSale.discountedPrice || foodSale.price;
    const totalAmount = price * quantity;

    // Create order
    const order = new Order({
      buyer: userId,
      foodSale: foodSaleId,
      quantity,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      specialInstructions,
      statusHistory: [{ status: 'pending', updatedBy: userId }]
    });

    // Save order
    await order.save();

    // Reduce available quantity
    foodSale.quantityAvailable -= quantity;
    await foodSale.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    // Build query
    const query = { buyer: userId };
    if (status) query.status = status;

    // Find orders
    const orders = await Order.find(query)
      .populate({
        path: 'foodSale',
        populate: {
          path: 'foodItem restaurant'
        }
      })
      .sort({ orderedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total orders
    const totalOrders = await Order.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          total: totalOrders,
          page,
          pages: Math.ceil(totalOrders / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    const order = await Order.findById(orderId)
      .populate({
        path: 'foodSale',
        populate: {
          path: 'foodItem restaurant'
        }
      })
      .populate('statusHistory.updatedBy', 'name');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    return res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching order details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    const allowedStatusForCancel = ['pending', 'accepted'];
    if (!allowedStatusForCancel.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in ${order.status} status`
      });
    }

    // Update status
    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      updatedBy: userId
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
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while cancelling order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        message: 'Order not found'
      });
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      order.status = 'accepted';
      order.statusHistory.push({
        status: 'accepted',
        updatedBy: userId
      });
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        path: 'foodSale',
        match: { restaurant: restaurantId },
        populate: { path: 'foodItem' }
      })
      .populate('buyer', 'name email')
      .sort({ orderedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Filter out any orders where foodSale didn't match
    const filteredOrders = orders.filter(order => order.foodSale);

    // Count total matching orders
    const totalOrders = filteredOrders.length;

    return res.status(200).json({
      success: true,
      data: {
        orders: filteredOrders,
        pagination: {
          total: totalOrders,
          page,
          pages: Math.ceil(totalOrders / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status, userId } = req.body;
    
    const order = await Order.findById(orderId)
      .populate('foodSale');
      
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['accepted', 'rejected'],
      'accepted': ['preparing', 'cancelled'],
      'preparing': ['ready'],
      'ready': ['delivering', 'completed'],
      'delivering': ['delivered'],
      'delivered': ['completed']
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    // Update status
    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: userId
    });

    // If delivered, set deliveredAt
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};