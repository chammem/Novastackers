import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../config/axiosInstance';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiMapPin, FiClock, FiCheck, FiX, FiRefreshCw, FiTruck, FiNavigation, FiCalendar, FiAlertCircle } from 'react-icons/fi';

const RequestedDeliveries = () => {
  const { user } = useAuth();
  const [requestedDeliveries, setRequestedDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const isRequestPendingRef = React.useRef(false);
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    fetchRequestedDeliveries();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchRequestedDeliveries, 30000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const fetchRequestedDeliveries = async () => {
    if (!user || !user._id) return;
    
    // Prevent duplicate simultaneous requests
    if (isRequestPendingRef.current) {
      console.log('Request already in progress, skipping duplicate call');
      return;
    }
    
    isRequestPendingRef.current = true;
    setLoading(true);
    
    try {
      console.log(`Fetching assignments for ${user._id}, request ID: ${Date.now()}`);
      const response = await axiosInstance.get(`/driver/assignment-requests/${user._id}`);
      
      // Process the response as normal...
      console.log('Assignment requests response:', response.data);
      
      if (response.data.success) {
        setRequestedDeliveries(response.data.requests || []);
      } else {
        console.error('Failed to fetch assignment requests:', response.data.message);
        setRequestedDeliveries([]);
      }
    } catch (error) {
      console.error("Error fetching requested deliveries:", error);
      toast.error("Failed to load delivery requests");
      setRequestedDeliveries([]);
    } finally {
      setLoading(false);
      isRequestPendingRef.current = false; // Reset the flag when done
    }
  };

  const throttledRefresh = () => {
    if (isRequestPendingRef.current) {
      toast.info("Already refreshing...");
      return;
    }
    fetchRequestedDeliveries();
  };

  const handleAccept = async (orderId, notificationId) => {
    if (!user || !user._id) return;
    setProcessingId(orderId);
    
    try {
      // Accept the delivery
      const response = await axiosInstance.post(`/driver/accept-delivery/${orderId}`, {
        driverId: user._id
      });
      
      if (response.data.success) {
        // Mark notification as read if it exists
        if (notificationId) {
          try {
            await axiosInstance.patch(`/notifications/mark-read/${notificationId}`);
          } catch (notifErr) {
            console.error('Error marking notification as read:', notifErr);
            // Continue anyway, not critical
          }
        }
        
        toast.success("Delivery accepted!");
        
        // Remove this delivery from the list
        setRequestedDeliveries(prev => prev.filter(d => d.order._id !== orderId));
      } else {
        toast.error(response.data.message || "Failed to accept delivery");
      }
    } catch (error) {
      console.error("Error accepting delivery:", error);
      toast.error(error.response?.data?.message || "Failed to accept delivery. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleDecline = async (orderId, notificationId) => {
    if (!user || !user._id) return;
    setProcessingId(orderId);
    
    try {
      // Decline the delivery
      const response = await axiosInstance.post(`/driver/reject-delivery/${orderId}`, {
        driverId: user._id
      });
      
      if (response.data.success) {
        // Mark notification as read if it exists
        if (notificationId) {
          try {
            await axiosInstance.patch(`/notifications/mark-read/${notificationId}`);
          } catch (notifErr) {
            console.error('Error marking notification as read:', notifErr);
            // Continue anyway, not critical
          }
        }
        
        toast.info("Delivery declined");
        
        // Remove this delivery from the list
        setRequestedDeliveries(prev => prev.filter(d => d.order._id !== orderId));
      } else {
        toast.error(response.data.message || "Failed to decline delivery");
      }
    } catch (error) {
      console.error("Error declining delivery:", error);
      toast.error(error.response?.data?.message || "Failed to decline delivery. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  // Enhanced loading animation
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingPhase(prev => (prev + 1) % 4);
      }, 600);
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <>
      <HeaderMid />
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-10 px-4">
        <div className="container mx-auto relative">
          {/* Animated background elements */}
          <motion.div 
            className="absolute top-20 right-[5%] w-64 h-64 rounded-full bg-primary/5 filter blur-xl"
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 relative z-10"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-primary"
                >
                  <FiTruck size={28} />
                </motion.div>
                Requested Deliveries
              </h1>
              <p className="text-base-content/70 mt-2">
                Accept or decline delivery assignments in your area
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={throttledRefresh}
              className="btn btn-primary btn-sm gap-2 mt-4 md:mt-0"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
              >
                <FiRefreshCw />
              </motion.div>
              Refresh
            </motion.button>
          </motion.div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col justify-center items-center py-24"
            >
              <motion.div className="relative w-24 h-24">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border-4 border-r-secondary border-t-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 0, 180, 180, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <FiTruck className="text-primary text-2xl" />
                </motion.div>
              </motion.div>
              <motion.p
                className="mt-6 text-primary font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {["Finding deliveries...", "Connecting to server...", "Loading requests...", "Almost ready..."][loadingPhase]}
              </motion.p>
            </motion.div>
          ) : requestedDeliveries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-base-100 rounded-2xl shadow-xl max-w-lg mx-auto text-center p-10 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <motion.div 
                className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-base-200"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-base-200"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />
              
              <div className="relative z-10">
                <motion.div 
                  className="mx-auto mb-6 w-24 h-24 bg-base-200 rounded-full flex items-center justify-center"
                  animate={{ 
                    y: [0, -10, 0],
                    boxShadow: [
                      "0 0 0 rgba(0,0,0,0.1)",
                      "0 10px 20px rgba(0,0,0,0.15)",
                      "0 0 0 rgba(0,0,0,0.1)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <FiTruck size={42} className="text-base-content/50" />
                  </motion.div>
                </motion.div>
                
                <motion.h3 
                  className="text-2xl font-bold mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  No Delivery Requests
                </motion.h3>
                
                <motion.p 
                  className="text-base-content/70 mb-6 max-w-sm mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  You don't have any pending delivery requests at the moment. 
                  New requests will appear here as they become available.
                </motion.p>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={throttledRefresh}
                  className="btn btn-primary gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <FiRefreshCw />
                  Check for New Deliveries
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {requestedDeliveries.map((item, index) => (
                  <motion.div
                    key={item.order._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ 
                      duration: 0.4,
                      delay: index * 0.1,
                      type: "spring", 
                      damping: 15 
                    }}
                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    className="card bg-base-100 shadow-lg overflow-hidden border border-base-200"
                  >
                    <div className="relative bg-gradient-to-r from-primary/90 to-primary/70 text-primary-content p-4">
                      <motion.div 
                        className="absolute top-2 right-2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 5, repeat: Infinity }}
                      >
                        <FiPackage className="text-white" size={20} />
                      </motion.div>
                      
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold flex items-center">
                          Order #{item.order._id.substr(-6)}
                        </h3>
                        <motion.div 
                          className="badge badge-sm bg-white/20 text-white backdrop-blur-sm"
                          whileHover={{ scale: 1.1 }}
                        >
                          <FiCalendar className="mr-1" size={10} />
                          {item.order.createdAt 
                            ? new Date(item.order.createdAt).toLocaleDateString() 
                            : 'New'}
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="card-body p-5">
                      <div className="space-y-3">
                        <motion.div 
                          className="flex items-start gap-3 p-3 bg-base-100 rounded-xl border border-base-200 hover:border-primary/30 transition-colors"
                          whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.5)" }}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FiMapPin className="text-primary" size={16} />
                          </div>
                          <div>
                            <div className="text-sm text-base-content/70 mb-1">Delivery Location</div>
                            <p className="font-medium">
                              {item.order.deliveryAddress?.street}, {item.order.deliveryAddress?.city}
                            </p>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          className="flex items-start gap-3 p-3 bg-base-100 rounded-xl border border-base-200 hover:border-primary/30 transition-colors"
                          whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.5)" }}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FiPackage className="text-primary" size={16} />
                          </div>
                          <div>
                            <div className="text-sm text-base-content/70 mb-1">Order Details</div>
                            <p className="font-medium">
                              {item.order.quantity} items • ${item.order.totalPrice?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </motion.div>
                        
                        {item.order.specialInstructions && (
                          <motion.div 
                            className="flex items-start gap-3 p-3 bg-base-100 rounded-xl border border-yellow-200 hover:border-yellow-300 transition-colors"
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ backgroundColor: "rgba(254, 252, 232, 0.5)" }}
                          >
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                              <FiAlertCircle className="text-yellow-600" size={16} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-yellow-700 mb-1">Special Instructions:</div>
                              <p className="text-sm text-base-content/90">{item.order.specialInstructions}</p>
                            </div>
                          </motion.div>
                        )}
                        
                        <motion.div 
                          className="p-3 rounded-xl bg-warning/10 border border-warning/20"
                          animate={{ 
                            boxShadow: ['0 0 0 rgba(234, 179, 8, 0)', '0 0 15px rgba(234, 179, 8, 0.3)', '0 0 0 rgba(234, 179, 8, 0)']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 5, repeat: Infinity }}
                            >
                              <FiClock size={18} className="text-warning" />
                            </motion.div>
                            <div>
                              <p className="text-sm font-medium text-warning-content/90">
                                This request will expire soon - respond now!
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      
                      <div className="card-actions justify-center mt-4 pt-3 border-t border-base-200">
                        <div className="flex gap-4 w-full">
                          <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn btn-outline flex-1 gap-2"
                            onClick={() => handleDecline(
                              item.order._id, 
                              item.notification ? item.notification._id : null
                            )}
                            disabled={processingId === item.order._id}
                          >
                            {processingId === item.order._id ? (
                              <motion.span 
                                className="loading loading-spinner loading-xs"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            ) : (
                              <FiX />
                            )}
                            Decline
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.03, y: -2, boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.2)" }}
                            whileTap={{ scale: 0.97 }}
                            className="btn btn-success flex-1 gap-2 relative overflow-hidden"
                            onClick={() => handleAccept(
                              item.order._id,
                              item.notification ? item.notification._id : null
                            )}
                            disabled={processingId === item.order._id}
                          >
                            <motion.span 
                              className="absolute inset-0 bg-white/20"
                              animate={{ 
                                x: ['-100%', '100%'],
                                opacity: [0, 0.5, 0]
                              }}
                              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                            />
                            
                            {processingId === item.order._id ? (
                              <motion.span 
                                className="loading loading-spinner loading-xs"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            ) : (
                              <FiCheck />
                            )}
                            Accept
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RequestedDeliveries;