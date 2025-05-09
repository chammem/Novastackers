import React from 'react'; // Ensure this is the correct import
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiCheck, FiX, FiPackage, FiMapPin, FiCalendar, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import HeaderMid from '../HeaderMid';
import axiosInstance from '../../config/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast.error('Please log in to view order details');
        navigate('/login');
        return;
      }
      fetchOrderDetails();
    }
  }, [isAuthenticated, isLoading, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Get user ID from auth context
      const userId = user?._id;
      
      const response = await axiosInstance.get(`/orders/details/${orderId}?userId=${userId}`);
      setOrder(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
      setLoading(false);
      toast.error('Could not load order details');
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'paid': return 1;
      case 'fulfilled': return 2;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  return (
    <>
      <HeaderMid />
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        className="container mx-auto px-4 py-8"
      >
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate('/orders/my-orders')}
            className="btn btn-ghost btn-circle mr-4"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error shadow-lg">
            <div>
              <FiAlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        ) : !order ? (
          <div className="text-center py-12">
            <div className="text-3xl text-gray-400 mb-4">
              <FiPackage className="mx-auto" size={48} />
            </div>
            <h3 className="text-lg font-medium mb-2">Order not found</h3>
            <p className="text-sm text-gray-500 mb-4">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link to="/orders/my-orders" className="btn btn-primary">
              View My Orders
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card bg-base-100 shadow-lg mb-8">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Order Status</h2>
                  
                  {order.status === 'cancelled' ? (
                    <div className="alert alert-error mb-6">
                      <FiX size={20} />
                      <span>This order has been cancelled.</span>
                    </div>
                  ) : (
                    <ul className="steps steps-vertical lg:steps-horizontal w-full">
                      <li className={`step ${getStatusStep(order.status) >= 0 ? 'step-primary' : ''}`}>
                        Order Placed
                      </li>
                      <li className={`step ${getStatusStep(order.status) >= 1 ? 'step-primary' : ''}`}>
                        Payment Completed
                      </li>
                      <li className={`step ${getStatusStep(order.status) >= 2 ? 'step-primary' : ''}`}>
                        Order Fulfilled
                      </li>
                    </ul>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="font-semibold text-lg mb-3">Order Timeline</h3>
                    <div className="relative pl-8 border-l-2 border-base-300">
                      <div className="mb-6 relative">
                        <div className="absolute -left-[25px] p-1 rounded-full bg-primary">
                          <FiClock className="text-white" size={16} />
                        </div>
                        <h4 className="font-medium">Order Created</h4>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      
                      {order.status !== 'pending' && (
                        <div className="mb-6 relative">
                          <div className="absolute -left-[25px] p-1 rounded-full bg-primary">
                            <FiCheck className="text-white" size={16} />
                          </div>
                          <h4 className="font-medium">Payment Completed</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.updatedAt)}
                          </p>
                        </div>
                      )}
                      
                      {order.status === 'fulfilled' && (
                        <div className="mb-6 relative">
                          <div className="absolute -left-[25px] p-1 rounded-full bg-primary">
                            <FiPackage className="text-white" size={16} />
                          </div>
                          <h4 className="font-medium">Order Fulfilled</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.updatedAt)}
                          </p>
                        </div>
                      )}
                      
                      {order.status === 'cancelled' && (
                        <div className="mb-6 relative">
                          <div className="absolute -left-[25px] p-1 rounded-full bg-error">
                            <FiX className="text-white" size={16} />
                          </div>
                          <h4 className="font-medium">Order Cancelled</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.updatedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="card bg-base-100 shadow-lg mb-8">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{order._id}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item:</span>
                      <span>{order.foodSale?.foodItem?.name || 'Food Item'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span>{order.quantity}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per unit:</span>
                      <span>${order.unitPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  
                  <div className="divider my-2"></div>
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${order.totalPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">Delivery Information</h2>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <FiMapPin className="mt-1 text-primary" />
                      <div>
                        <h4 className="font-medium">Delivery Address</h4>
                        <p className="text-sm">
                          {order.deliveryAddress?.street}<br />
                          {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}<br />
                          {order.deliveryAddress?.country}
                        </p>
                      </div>
                    </div>
                    
                    {order.specialInstructions && (
                      <div className="mt-4">
                        <h4 className="font-medium">Special Instructions</h4>
                        <p className="text-sm mt-1 bg-base-200 p-2 rounded">
                          {order.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default OrderDetailPage;