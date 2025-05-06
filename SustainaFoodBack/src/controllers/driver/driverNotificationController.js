const Order = require('../../models/sales/Order');
const User = require('../../models/userModel');
const Notification = require('../../models/notification');
const driverAssignmentService = require('../../services/driverAssignmentService');
const driverTimeoutService = require('../../services/driverTimeoutService');

// Accept a delivery assignment
exports.acceptDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    console.log(`Driver ${driverId} accepting delivery order ${orderId}`);

    // Validate input
    if (!driverId || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Driver ID and Order ID are required' 
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if this order is assigned to this driver
    if (!order.assignedDriver || order.assignedDriver.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: 'This order is not assigned to this driver'
      });
    }
    
    // Cancel the timeout since the driver has responded
    driverTimeoutService.cancelAssignmentTimeout(orderId);
    
    // Update order status
    order.deliveryStatus = 'pickup_ready'; // Changed from 'driver_assigned'
    order.statusHistory.push({
      status: 'pickup_ready', // Changed from 'driver_assigned'
      updatedBy: driverId,
      timestamp: new Date()
    });
    
    await order.save();
    
    // Update driver status
    await User.findByIdAndUpdate(driverId, {
      status: 'busy'
    });
    
    // Notify customer that a driver accepted their order
    const notification = await Notification.create({
      user_id: order.user,
      message: `A driver has accepted your order and will pick it up soon.`,
      type: 'status_update',
      read: false
    });
    
    if (req.io) {
      req.io.to(order.user.toString()).emit('new-notification', notification);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Delivery accepted successfully',
      order: {
        _id: order._id,
        status: order.status,
        deliveryStatus: order.deliveryStatus
      }
    });
  } catch (error) {
    console.error('Error accepting delivery:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Reject a delivery assignment
exports.rejectDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    console.log(`Driver ${driverId} rejecting delivery order ${orderId}`);

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if this order is assigned to this driver
    if (!order.assignedDriver || order.assignedDriver.toString() !== driverId) {
      return res.status(403).json({
        success: false,
        message: 'This order is not assigned to this driver'
      });
    }

    // Update order status back to waiting for driver
    order.deliveryStatus = 'waiting_for_driver';
    order.assignedDriver = null;
    
    // Add driver to declinedBy list to prevent reassignment
    if (!order.declinedBy) {
      order.declinedBy = [];
    }
    order.declinedBy.push(driverId);
    
    order.statusHistory.push({
      status: 'driver_rejected',
      updatedBy: driverId,
      timestamp: new Date()
    });

    await order.save();

    // Update driver status back to available
    await User.findByIdAndUpdate(driverId, { 
      status: 'available'
    });

    // Try to reassign to another driver
    try {
      const assignmentResult = await driverAssignmentService.assignDriverToOrder(
        orderId,
        order.deliveryAddress,
        'small',
        req.io // Pass req.io here, not just io
      );
      
      console.log(`Reassignment result:`, assignmentResult);
    } catch (reassignError) {
      console.error('Error reassigning order:', reassignError);
    }

    return res.status(200).json({
      success: true,
      message: 'Delivery rejected successfully',
      order: {
        _id: order._id,
        status: order.status,
        deliveryStatus: order.deliveryStatus
      }
    });
  } catch (error) {
    console.error('Error rejecting delivery:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get driver's current assignments
exports.getDriverAssignments = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    const assignments = await Order.find({
      assignedDriver: driverId,
      // Include all active delivery statuses
      deliveryStatus: { 
        $in: ['driver_assigned', 'pickup_ready', 'picked_up', 'delivering'] 
      }
    }).populate('user', 'fullName email phone')
      .populate('foodSale', 'name image_url')
      .sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('Error fetching driver assignments:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get pending delivery requests for a driver (assignments waiting for acceptance)
exports.getDriverAssignmentRequests = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID is required'
      });
    }
    
    console.log(`Fetching assignment requests for driver ${driverId}`);
    
    // Find orders assigned to this driver but still pending acceptance
    const pendingAssignments = await Order.find({
      assignedDriver: driverId,
      deliveryStatus: 'driver_assigned' // Only pending acceptance
    })
    .populate('foodSale')
    .populate('user', 'fullName phone')
    .sort({ createdAt: -1 });
    
    // Get related notifications for each order
    const orderIds = pendingAssignments.map(order => order._id.toString());
    
    // Find notifications related to these orders
    const notifications = await Notification.find({
      user_id: driverId,
      'data.orderId': { $in: orderIds },
      type: { $in: ['assignment-request', 'delivery_assignment'] },
      read: false
    });
    
    // Map notifications to orders
    const assignmentsWithNotifications = pendingAssignments.map(order => {
      const notification = notifications.find(
        n => n.data && n.data.orderId && n.data.orderId.toString() === order._id.toString()
      );
      
      return {
        order: {
          _id: order._id,
          user: order.user,
          foodSale: order.foodSale,
          quantity: order.quantity,
          totalPrice: order.totalPrice,
          deliveryAddress: order.deliveryAddress,
          specialInstructions: order.specialInstructions,
          status: order.status,
          deliveryStatus: order.deliveryStatus,
          createdAt: order.createdAt
        },
        notification: notification || null
      };
    });
    
    return res.status(200).json({
      success: true,
      count: assignmentsWithNotifications.length,
      requests: assignmentsWithNotifications
    });
  } catch (error) {
    console.error('Error fetching assignment requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.handleDeliveryTimeout = async (orderId, driverId) => {
    try {
      console.log(`Driver ${driverId} timed out for delivery order ${orderId}`);
      
      const order = await Order.findById(orderId);
      if (!order) {
        console.error(`Order ${orderId} not found`);
        return { success: false };
      }
      
      // Add driver to declinedBy array
      if (!order.declinedBy) {
        order.declinedBy = [];
      }
      
      if (!order.declinedBy.includes(driverId)) {
        order.declinedBy.push(driverId);
      }
      
      // Reset assignment
      order.deliveryStatus = 'waiting_for_driver';
      order.assignedDriver = null;
      
      // Log in history
      order.statusHistory.push({
        status: 'driver_timeout',
        updatedBy: 'system',
        timestamp: new Date()
      });
      
      await order.save();
      
      // Free up the driver
      await User.findByIdAndUpdate(driverId, {
        status: 'available'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error handling delivery timeout:', error);
      return { success: false, error: error.message };
    }
  };