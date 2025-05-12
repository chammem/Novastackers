import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiClock,
  FiCheck,
  FiX,
  FiPackage,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiAlertCircle,
  FiUser,
  FiTruck,
  FiShoppingBag,
  FiClipboard,
  FiInfo,
} from "react-icons/fi";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import HeaderMid from "../HeaderMid";
import axiosInstance from "../../config/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import OrderTrackingMap from "../customer/OrderTrackingMap";
import React from 'react';
import { useLocation } from "react-router-dom";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [loadingStage, setLoadingStage] = useState(0);
  const [highlightedSection, setHighlightedSection] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Create animated loading sequence
  useEffect(() => {
    if (loading) {
      const stages = ['Connecting', 'Fetching order', 'Processing details'];
      let stageIndex = 0;
      
      const loadingInterval = setInterval(() => {
        setLoadingStage(stageIndex);
        stageIndex = (stageIndex + 1) % stages.length;
      }, 800);
      
      return () => clearInterval(loadingInterval);
    }
  }, [loading]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast.error("Please log in to view order details");
        navigate("/login");
        return;
      }
      fetchOrderDetails();
    }
  }, [isAuthenticated, isLoading, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(`/orders/${orderId}`);

      // Debug log to see the actual order data
      console.log("Order details raw:", response.data);
      
      if (!response.data || !response.data.success || !response.data.data) {
        setError("Order not found or no data available");
        setLoading(false);
        return;
      }

      // Extract the actual order data from the nested structure
      const orderData = response.data.data;
      console.log("Order status:", orderData.status);

      // Normalize the status field to handle inconsistencies
      if (orderData.status) {
        orderData.status = orderData.status.toLowerCase().trim();
      }

      setOrder(orderData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details. Please try again.");
      setLoading(false);
    }
  };

  // Enhanced status visualization with animation
  const getStatusStep = (status) => {
    // Normalize status to handle case and whitespace differences
    const normalizedStatus = status?.toLowerCase().trim();

    console.log("Checking status:", normalizedStatus); // Debug log

    // Handle various status values
    switch (normalizedStatus) {
      case "pending":
        return 0;
      case "paid":
      case "payment_completed":
      case "processed":
      case "completed":
        return 1; // All payment-related statuses return 1
      case "fulfilled":
      case "delivered":
      case "complete":
        return 2;
      case "cancelled":
      case "canceled":
        return -1;
      default:
        return 0;
    }
  };

  const formatDate = (dateString) => {
    try {
      // Handle both ISO strings and raw Date objects
      if (!dateString) return "No date available";

      // If it's already a Date object
      if (dateString instanceof Date) {
        return format(dateString, "MMM dd, yyyy • h:mm a");
      }

      // Try parsing as ISO
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) {
        // Try alternative date parsing if ISO parsing fails
        const fallbackDate = new Date(dateString);
        if (isNaN(fallbackDate.getTime())) {
          return "Invalid Date";
        }
        return format(fallbackDate, "MMM dd, yyyy • h:mm a");
      }

      return format(date, "MMM dd, yyyy • h:mm a");
    } catch (err) {
      console.error("Date formatting error:", err, "for date:", dateString);
      return "Invalid Date";
    }
  };

  // Highlight a section when in view
  const handleSectionHover = (section) => {
    setHighlightedSection(section);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Order status colors
  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase().trim();
    
    switch (normalizedStatus) {
      case "pending": return "warning";
      case "paid":
      case "payment_completed":
      case "processed":
      case "completed": return "info";
      case "fulfilled":
      case "delivered":
      case "complete": return "success";
      case "cancelled":
      case "canceled": return "error";
      default: return "base";
    }
  };

  return (
    <>
      <HeaderMid />
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        <div className="container mx-auto px-4 py-8 relative">
          {/* Background elements */}
          <motion.div 
            className="absolute top-40 right-[10%] w-64 h-64 rounded-full bg-primary/5 filter blur-xl"
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div 
            className="absolute bottom-40 left-[5%] w-80 h-80 rounded-full bg-success/5 filter blur-xl"
            animate={{ 
              y: [0, 30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          />
          
          <motion.div 
            className="mb-6 flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.1, x: -3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/orders")}
              className="btn btn-ghost btn-circle mr-4"
            >
              <FiArrowLeft size={20} />
            </motion.button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">
              Order Details
            </h1>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <motion.div 
                  className="relative w-24 h-24 mb-6"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div 
                    className="absolute inset-2 rounded-full border-4 border-secondary border-b-transparent"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ 
                        rotate: [0, 0, 180, 180, 0],
                        scale: [1, 1.2, 1.2, 1, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FiPackage className="text-primary text-2xl" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStage}
                    className="text-base-content/70 font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {['Connecting...', 'Fetching order...', 'Processing details...'][loadingStage]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-error/10 rounded-xl p-8 text-center max-w-md mx-auto"
              >
                <motion.div 
                  className="mx-auto mb-4 w-16 h-16 bg-error/20 rounded-full flex items-center justify-center text-error"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <FiAlertCircle size={28} />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Error</h3>
                <p className="text-base-content/70 mb-6">{error}</p>
                <motion.button 
                  className="btn btn-error"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchOrderDetails}
                >
                  Try Again
                </motion.button>
              </motion.div>
            ) : !order ? (
              <motion.div 
                key="not-found"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <motion.div 
                  className="text-3xl text-gray-400 mb-4"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0] 
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <FiPackage className="mx-auto" size={64} />
                </motion.div>
                <h3 className="text-xl font-medium mb-2">Order not found</h3>
                <p className="text-base-content/70 max-w-md mx-auto mb-6">
                  The order you're looking for doesn't exist or you don't have
                  permission to view it.
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/orders" className="btn btn-primary gap-2">
                    <FiPackage /> View My Orders
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="order-details"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10"
              >
                {/* Order status badge */}
                <motion.div 
                  className="flex justify-center mb-8"
                  variants={itemVariants}
                >
                  <motion.div 
                    className={`badge badge-${getStatusColor(order.status)} gap-2 py-4 px-6 text-lg font-medium shadow-md`}
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {order.status === "pending" && <FiClock />}
                    {order.status === "paid" && <FiCheck />}
                    {order.status === "fulfilled" && <FiPackage />}
                    {order.status === "cancelled" && <FiX />}
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </motion.div>
                </motion.div>
                
                {/* Tab navigation */}
                <motion.div 
                  className="flex justify-center mb-6"
                  variants={itemVariants}
                >
                  <div className="tabs tabs-boxed bg-base-200/50 p-1 rounded-xl">
                    <motion.a 
                      className={`tab ${activeTab === 'summary' ? 'bg-primary text-primary-content' : ''}`}
                      onClick={() => setActiveTab('summary')}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      <FiClipboard className="mr-2" /> Summary
                    </motion.a>
                    <motion.a 
                      className={`tab ${activeTab === 'timeline' ? 'bg-primary text-primary-content' : ''}`}
                      onClick={() => setActiveTab('timeline')}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      <FiClock className="mr-2" /> Timeline
                    </motion.a>
                    <motion.a 
                      className={`tab ${activeTab === 'delivery' ? 'bg-primary text-primary-content' : ''}`}
                      onClick={() => setActiveTab('delivery')}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      <FiMapPin className="mr-2" /> Delivery
                    </motion.a>
                  </div>
                </motion.div>
                
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                  <motion.div
                    className="lg:col-span-4"
                    variants={itemVariants}
                  >
                    <AnimatePresence mode="wait">
                      {activeTab === 'summary' && (
                        <motion.div
                          key="summary"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="card bg-base-100 shadow-xl overflow-hidden"
                        >
                          {/* Card header */}
                          <div className={`bg-gradient-to-r from-${getStatusColor(order.status)}/80 to-${getStatusColor(order.status)}/60 p-6 text-${getStatusColor(order.status)}-content relative`}>
                            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-10">
                              {order.status === "pending" && <FiClock size={80} />}
                              {order.status === "paid" && <FiCheck size={80} />}
                              {order.status === "fulfilled" && <FiPackage size={80} />}
                              {order.status === "cancelled" && <FiX size={80} />}
                            </div>
                            <h2 className="text-2xl font-bold flex items-center">
                              <FiShoppingBag className="mr-2" /> Order Summary
                            </h2>
                            <p className="opacity-80 mt-1">Placed on {formatDate(order.createdAt)}</p>
                          </div>
                          
                          <div className="card-body p-6">
                            {/* Order status progress */}
                            {order.status !== "cancelled" ? (
                              <div className="mb-8">
                                <ul className="steps steps-vertical lg:steps-horizontal w-full">
                                  <motion.li
                                    className={`step ${getStatusStep(order.status) >= 0 ? "step-primary" : ""}`}
                                    animate={getStatusStep(order.status) >= 0 ? {
                                      scale: [1, 1.1, 1]
                                    } : {}}
                                    transition={{ duration: 0.5 }}
                                  >
                                    Order Placed
                                  </motion.li>
                                  <motion.li
                                    className={`step ${getStatusStep(order.status) >= 1 ? "step-primary" : ""}`}
                                    animate={getStatusStep(order.status) >= 1 ? {
                                      scale: [1, 1.1, 1]
                                    } : {}}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                  >
                                    Payment Completed
                                  </motion.li>
                                  <motion.li
                                    className={`step ${getStatusStep(order.status) >= 2 ? "step-primary" : ""}`}
                                    animate={getStatusStep(order.status) >= 2 ? {
                                      scale: [1, 1.1, 1]
                                    } : {}}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                  >
                                    Order Fulfilled
                                  </motion.li>
                                </ul>
                              </div>
                            ) : (
                              <motion.div 
                                className="alert alert-error mb-6"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                              >
                                <FiX size={20} />
                                <span>This order has been cancelled.</span>
                              </motion.div>
                            )}
                            
                            {/* Order info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <motion.div 
                                className="bg-base-200/50 p-4 rounded-xl"
                                whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                                onHoverStart={() => handleSectionHover('item')}
                                onHoverEnd={() => handleSectionHover(null)}
                              >
                                <h3 className="font-medium mb-2 flex items-center">
                                  <FiPackage className="mr-2 text-primary" /> Item Details
                                </h3>
                                <div className="text-base-content/80 space-y-2">
                                  <div>
                                    <span className="text-sm font-medium">Item:</span>
                                    <div className="font-medium text-lg">{order.foodSale?.foodItem?.name || "Food Item"}</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Quantity:</span>
                                    <span className="font-medium">{order.quantity}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Price per unit:</span>
                                    <span className="font-medium">${order.unitPrice?.toFixed(2) || "0.00"}</span>
                                  </div>
                                </div>
                              </motion.div>
                              
                              <motion.div 
                                className="bg-base-200/50 p-4 rounded-xl"
                                whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                                onHoverStart={() => handleSectionHover('payment')}
                                onHoverEnd={() => handleSectionHover(null)}
                              >
                                <h3 className="font-medium mb-2 flex items-center">
                                  <FiDollarSign className="mr-2 text-primary" /> Payment Details
                                </h3>
                                <div className="text-base-content/80 space-y-2">
                                  <div className="flex justify-between">
                                    <span>Payment ID:</span>
                                    <span className="font-mono text-xs">{order.paymentId?.substring(0, 12) || "N/A"}...</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Payment Status:</span>
                                    <span className={`font-medium text-${order.status === 'paid' ? 'success' : 'warning'}`}>
                                      {order.status === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Total Amount:</span>
                                    <motion.span 
                                      className="font-bold text-primary"
                                      animate={highlightedSection === 'payment' ? {
                                        scale: [1, 1.1, 1]
                                      } : {}}
                                      transition={{ duration: 0.5 }}
                                    >
                                      ${order.totalPrice?.toFixed(2) || "0.00"}
                                    </motion.span>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {activeTab === 'timeline' && (
                        <motion.div
                          key="timeline"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="card bg-base-100 shadow-xl"
                        >
                          <div className="card-body p-6">
                            <h2 className="card-title text-2xl mb-6 flex items-center">
                              <FiClock className="mr-2 text-primary" /> Order Timeline
                            </h2>
                            
                            <div className="relative pl-10 border-l-2 border-base-300">
                              <motion.div 
                                className="mb-8 relative"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <motion.div 
                                  className="absolute -left-[29px] p-1.5 rounded-full bg-primary"
                                  whileHover={{ scale: 1.2 }}
                                >
                                  <FiClock className="text-white" size={16} />
                                </motion.div>
                                <div className="bg-base-200/50 p-4 rounded-xl">
                                  <h4 className="font-medium flex items-center">
                                    Order Created
                                  </h4>
                                  <p className="text-sm text-base-content/70 mt-1">
                                    {formatDate(order.createdAt)}
                                  </p>
                                  <p className="text-sm mt-2">
                                    Your order was received and is being processed.
                                  </p>
                                </div>
                              </motion.div>

                              {order.status !== "pending" && (
                                <motion.div 
                                  className="mb-8 relative"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <motion.div 
                                    className="absolute -left-[29px] p-1.5 rounded-full bg-primary"
                                    whileHover={{ scale: 1.2 }}
                                  >
                                    <FiCheck className="text-white" size={16} />
                                  </motion.div>
                                  <div className="bg-base-200/50 p-4 rounded-xl">
                                    <h4 className="font-medium">Payment Completed</h4>
                                    <p className="text-sm text-base-content/70 mt-1">
                                      {formatDate(order.updatedAt)}
                                    </p>
                                    <p className="text-sm mt-2">
                                      Your payment was successfully processed and confirmed.
                                    </p>
                                  </div>
                                </motion.div>
                              )}

                              {order.status === "fulfilled" && (
                                <motion.div 
                                  className="mb-8 relative"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <motion.div 
                                    className="absolute -left-[29px] p-1.5 rounded-full bg-primary"
                                    whileHover={{ scale: 1.2 }}
                                  >
                                    <FiPackage className="text-white" size={16} />
                                  </motion.div>
                                  <div className="bg-base-200/50 p-4 rounded-xl">
                                    <h4 className="font-medium">Order Fulfilled</h4>
                                    <p className="text-sm text-base-content/70 mt-1">
                                      {formatDate(order.updatedAt)}
                                    </p>
                                    <p className="text-sm mt-2">
                                      Your order has been successfully delivered.
                                    </p>
                                  </div>
                                </motion.div>
                              )}

                              {order.status === "cancelled" && (
                                <motion.div 
                                  className="mb-8 relative"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <motion.div 
                                    className="absolute -left-[29px] p-1.5 rounded-full bg-error"
                                    whileHover={{ scale: 1.2 }}
                                  >
                                    <FiX className="text-white" size={16} />
                                  </motion.div>
                                  <div className="bg-error/10 p-4 rounded-xl">
                                    <h4 className="font-medium">Order Cancelled</h4>
                                    <p className="text-sm text-base-content/70 mt-1">
                                      {formatDate(order.updatedAt)}
                                    </p>
                                    <p className="text-sm mt-2">
                                      This order has been cancelled.
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                              
                              {/* Next expected event if order is in progress */}
                              {order.status === "pending" && (
                                <motion.div 
                                  className="mb-8 relative"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <motion.div 
                                    className="absolute -left-[29px] p-1.5 rounded-full bg-base-300"
                                    animate={{
                                      backgroundColor: ['rgb(203,213,225)', 'rgb(14,165,233)', 'rgb(203,213,225)']
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <FiClock className="text-white" size={16} />
                                  </motion.div>
                                  <div className="bg-base-200/30 p-4 rounded-xl border border-dashed border-base-300">
                                    <h4 className="font-medium opacity-70">Payment Processing</h4>
                                    <p className="text-sm text-base-content/50 mt-1">
                                      Awaiting payment confirmation...
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                              
                              {order.status === "paid" && (
                                <motion.div 
                                  className="mb-8 relative"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <motion.div 
                                    className="absolute -left-[29px] p-1.5 rounded-full bg-base-300"
                                    animate={{
                                      backgroundColor: ['rgb(203,213,225)', 'rgb(34,197,94)', 'rgb(203,213,225)']
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <FiPackage className="text-white" size={16} />
                                  </motion.div>
                                  <div className="bg-base-200/30 p-4 rounded-xl border border-dashed border-base-300">
                                    <h4 className="font-medium opacity-70">Order Fulfillment</h4>
                                    <p className="text-sm text-base-content/50 mt-1">
                                      Your order is being prepared for delivery...
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {activeTab === 'delivery' && (
                        <motion.div
                          key="delivery"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="card bg-base-100 shadow-xl"
                        >
                          <div className="card-body p-6">
                            <h2 className="card-title text-2xl mb-6 flex items-center">
                              <FiMapPin className="mr-2 text-primary" /> Delivery Information
                            </h2>
                            
                            <motion.div 
                              className="bg-gradient-to-r from-primary/5 to-base-100 p-5 rounded-xl mb-6 relative overflow-hidden border border-primary/10"
                              whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <motion.div 
                                className="absolute top-2 right-2 text-primary/20"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 5, repeat: Infinity }}
                              >
                                <FiMapPin size={60} />
                              </motion.div>
                              
                              <h3 className="font-medium mb-3 text-lg flex items-center">
                                <FiMapPin className="mr-2 text-primary" /> Delivery Address
                              </h3>
                              
                              <div className="space-y-1 max-w-md">
                                <p className="font-medium">{order.deliveryAddress?.street}</p>
                                <p>
                                  {order.deliveryAddress?.city},{" "}
                                  {order.deliveryAddress?.state}{" "}
                                  {order.deliveryAddress?.zipCode}
                                </p>
                                <p>{order.deliveryAddress?.country}</p>
                              </div>
                            </motion.div>
                            
                            {order.specialInstructions && (
                              <motion.div 
                                className="bg-base-200/50 p-5 rounded-xl"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <h3 className="font-medium mb-2 flex items-center">
                                  <FiInfo className="mr-2 text-primary" /> Special Instructions
                                </h3>
                                <p className="text-base-content/80 bg-base-100 p-3 rounded-lg border border-base-300">
                                  {order.specialInstructions}
                                </p>
                              </motion.div>
                            )}
                            
                            {/* Add Driver Tracking Section - only when driver is assigned and delivery is active */}
                            {order &&
                              order.assignedDriver &&
                              [
                                "driver_assigned",
                                "pickup_ready",
                                "picked_up",
                                "delivering",
                              ].includes(order.deliveryStatus) && (
                                <motion.div
                                  className="mt-6"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <h3 className="font-medium mb-4 flex items-center">
                                    <FiTruck className="mr-2 text-primary" /> Live Tracking
                                  </h3>
                                  
                                  <div className="rounded-xl overflow-hidden mb-4 border border-base-300 shadow-md">
                                    <OrderTrackingMap orderId={orderId} />
                                  </div>

                                  <motion.div 
                                    className="flex items-center justify-between bg-base-200 rounded-lg p-3"
                                    whileHover={{ backgroundColor: "rgba(241, 245, 249, 0.5)" }}
                                  >
                                    <div className="flex items-center">
                                      <div className="avatar mr-3">
                                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                                          <FiUser />
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-medium">
                                          {order.driverDetails?.name || "Your Driver"}
                                        </div>
                                        {order.driverDetails?.phone && (
                                          <div className="text-sm text-base-content/60">
                                            {order.driverDetails.phone}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <motion.div
                                      animate={{ 
                                        scale: [1, 1.05, 1],
                                        y: [0, -2, 0]
                                      }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <span className="badge badge-primary">
                                        {order.deliveryStatus === "driver_assigned" &&
                                          "Assigned"}
                                        {order.deliveryStatus === "pickup_ready" &&
                                          "At Restaurant"}
                                        {order.deliveryStatus === "picked_up" &&
                                          "Order Picked Up"}
                                        {order.deliveryStatus === "delivering" &&
                                          "On The Way"}
                                      </span>
                                    </motion.div>
                                  </motion.div>
                                </motion.div>
                              )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  <motion.div
                    className="lg:col-span-3"
                    variants={itemVariants}
                  >
                    <motion.div 
                      className="card bg-base-100 shadow-xl h-full"
                      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                    >
                      <motion.div 
                        className="card-body"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h2 className="card-title text-xl mb-4 flex items-center">
                          <FiClipboard className="mr-2 text-primary" /> Order Summary
                        </h2>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-base-content/70">Order ID:</span>
                            <motion.span 
                              className="font-medium text-sm bg-base-200 py-1 px-2 rounded"
                              whileHover={{ backgroundColor: "#f1f5f9" }}
                            >
                              {order._id}
                            </motion.span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-base-content/70">Date:</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>

                          <motion.div 
                            className="bg-base-200/50 p-4 rounded-xl mt-6"
                            whileHover={{ backgroundColor: "rgba(241, 245, 249, 0.5)" }}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-medium">Item</span>
                              <span className="font-medium">Price</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-base-300">
                              <div className="flex items-start gap-3">
                                <motion.div 
                                  className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center text-primary"
                                  whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                  <FiPackage />
                                </motion.div>
                                <div>
                                  <div className="font-medium">
                                    {order.foodSale?.foodItem?.name || "Food Item"}
                                  </div>
                                  <div className="text-xs text-base-content/60">
                                    Quantity: {order.quantity}
                                  </div>
                                </div>
                              </div>
                              <div className="font-medium">
                                ${(order.unitPrice * order.quantity).toFixed(2)}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4">
                              <span className="font-medium">Subtotal</span>
                              <span>${order.totalPrice?.toFixed(2) || "0.00"}</span>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2 text-xs text-base-content/70">
                              <span>Tax</span>
                              <span>Included</span>
                            </div>
                          </motion.div>
                          
                          <motion.div 
                            className="flex justify-between items-center text-lg font-bold mt-4 bg-primary/10 p-3 rounded-lg"
                            animate={{ 
                              boxShadow: ['0 0 0 rgba(16, 185, 129, 0)', '0 0 15px rgba(16, 185, 129, 0.3)', '0 0 0 rgba(16, 185, 129, 0)']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <span>Total:</span>
                            <span className="text-primary">${order.totalPrice?.toFixed(2) || "0.00"}</span>
                          </motion.div>
                        </div>
                        
                        <div className="card-actions mt-auto pt-6">
                          <Link to="/orders" className="btn btn-outline btn-block gap-2">
                            <FiArrowLeft /> Back to Orders
                          </Link>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Debug info - you can remove this in production */}
          {order &&
            process.env.NODE_ENV === 'development' &&
            <div className="mt-10 text-xs text-gray-400 hidden">
              Debug - Status: {order.status}, Step Value: {getStatusStep(order.status)}
              <pre className="mt-2 bg-base-200 p-2 rounded overflow-auto">
                {JSON.stringify({
                  createdAt: order.createdAt,
                  updatedAt: order.updatedAt,
                  typeCreatedAt: typeof order.createdAt,
                  typeUpdatedAt: typeof order.updatedAt,
                }, null, 2)}
              </pre>
            </div>
          }
        </div>
      </div>
    </>
  );
};

export default OrderDetailPage;
