import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../config/axiosInstance';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiMapPin, FiClock, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

const RequestedDeliveries = () => {
  const { user } = useAuth();
  const [requestedDeliveries, setRequestedDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const isRequestPendingRef = React.useRef(false); // Add this line

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

  return (
    <>
      <HeaderMid />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FiPackage className="text-primary" />
              Requested Deliveries
            </h1>
            <p className="text-base-content/70 mt-1">
              Accept or decline delivery assignments
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={throttledRefresh} // Use the throttled version
            className="btn btn-sm btn-outline"
          >
            <FiRefreshCw /> Refresh
          </motion.button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : requestedDeliveries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card bg-base-100 shadow-lg max-w-md mx-auto text-center p-8"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-base-300">
                <FiPackage size={32} className="text-base-content/50" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">No Requested Deliveries</h3>
            <p className="text-base-content/70 mb-6">
              You don't have any pending delivery requests at the moment.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requestedDeliveries.map((item) => (
                <motion.div
                  key={item.order._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="card bg-base-100 shadow-lg overflow-hidden"
                >
                  <div className="bg-primary text-primary-content p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">Order #{item.order._id.substr(-6)}</h3>
                      <span className="badge badge-sm badge-outline">
                        {item.order.createdAt 
                          ? new Date(item.order.createdAt).toLocaleDateString() 
                          : 'New'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-body p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center text-base-content/70 text-sm mb-1">
                          <FiMapPin className="mr-1" size={14} />
                          Delivery Location
                        </div>
                        <p className="font-medium">
                          {item.order.deliveryAddress?.street}, {item.order.deliveryAddress?.city}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-base-content/70 text-sm mb-1">
                          <FiPackage className="mr-1" size={14} />
                          Order Details
                        </div>
                        <p className="font-medium">
                          {item.order.quantity} items • ${item.order.totalPrice?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      
                      {item.order.specialInstructions && (
                        <div className="bg-base-200 p-2 rounded-md text-sm">
                          <p className="font-medium mb-1">Special Instructions:</p>
                          <p>{item.order.specialInstructions}</p>
                        </div>
                      )}
                      
                      <div className="bg-warning/10 p-3 rounded-md flex items-center gap-2">
                        <FiClock size={20} className="text-warning" />
                        <div>
                          <p className="text-sm font-medium">
                            Respond soon! This request will expire soon.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-actions justify-end pt-3">
                      <div className="flex gap-2 w-full">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-outline btn-sm flex-1"
                          onClick={() => handleDecline(
                            item.order._id, 
                            item.notification ? item.notification._id : null
                          )}
                          disabled={processingId === item.order._id}
                        >
                          {processingId === item.order._id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <FiX className="mr-1" />
                          )}
                          Decline
                        </motion.button>
                        
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-success btn-sm flex-1"
                          onClick={() => handleAccept(
                            item.order._id,
                            item.notification ? item.notification._id : null
                          )}
                          disabled={processingId === item.order._id}
                        >
                          {processingId === item.order._id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <FiCheck className="mr-1" />
                          )}
                          Accept
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
      <Footer />
    </>
  );
};

export default RequestedDeliveries;