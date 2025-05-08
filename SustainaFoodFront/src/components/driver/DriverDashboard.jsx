import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../config/axiosInstance';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import { FiPackage, FiNavigation, FiCheckCircle, FiClock, FiBell, FiTruck, FiShoppingBag, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';

const DriverDashboard = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Code verification state
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [actionType, setActionType] = useState(''); // 'pickup' or 'delivery'
  const [inProgress, setInProgress] = useState(false);
  
  useEffect(() => {
    if (!user || !user._id) return;
    
    const fetchActiveDeliveries = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/driver/assignments/${user._id}`);
        setActiveDeliveries(response.data.assignments || []);
      } catch (error) {
        console.error('Error fetching active deliveries:', error);
        toast.error('Failed to load active deliveries');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveDeliveries();
    
    // Refresh every 30 seconds
    const intervalId = setInterval(fetchActiveDeliveries, 30000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  const refreshDeliveries = async () => {
    if (!user || !user._id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/driver/assignments/${user._id}`);
      setActiveDeliveries(response.data.assignments || []);
      toast.success('Deliveries refreshed!');
    } catch (error) {
      console.error('Error refreshing deliveries:', error);
      toast.error('Failed to refresh deliveries');
    } finally {
      setLoading(false);
    }
  };

  // Start pickup process - request pickup code
  const handleStartPickup = async (delivery) => {
    setInProgress(true);
    setSelectedDelivery(delivery);
    try {
      const response = await axiosInstance.post(`/driver/delivery/${delivery._id}/start`, {
        driverId: user._id
      });
      
      if (response.data.success) {
        toast.success('Pickup initiated. Get the code from the restaurant.');
        setActionType('pickup');
        setShowCodeModal(true);
      } else {
        toast.error(response.data.message || 'Failed to start pickup process');
      }
    } catch (error) {
      console.error('Error starting pickup:', error);
      toast.error(error.response?.data?.message || 'Failed to start pickup process');
    } finally {
      setInProgress(false);
    }
  };

  // Verify pickup code and start delivery
  const handleVerifyPickupCode = async () => {
    if (!selectedDelivery || !verificationCode) return;
    
    setInProgress(true);
    try {
      const response = await axiosInstance.post(`/driver/delivery/${selectedDelivery._id}/pickup`, {
        driverId: user._id,
        pickupCode: verificationCode
      });
      
      if (response.data.success) {
        toast.success('Pickup verified! You can now start delivering the order.');
        setShowCodeModal(false);
        setVerificationCode('');
        refreshDeliveries();
      } else {
        toast.error(response.data.message || 'Invalid pickup code');
      }
    } catch (error) {
      console.error('Error verifying pickup code:', error);
      toast.error(error.response?.data?.message || 'Invalid pickup code');
    } finally {
      setInProgress(false);
    }
  };

  // Complete delivery with customer code
  const handleCompleteDelivery = async (delivery) => {
    setInProgress(true);
    try {
      // First, generate the delivery code
      const response = await axiosInstance.post(`/driver/delivery/${delivery._id}/complete/start`, {
        driverId: user._id
      });
      
      if (response.data.success) {
        toast.success('Code sent to customer. Ask for the code to complete delivery.');
        // Then show the code entry modal
        setSelectedDelivery(delivery);
        setActionType('delivery');
        setShowCodeModal(true);
      } else {
        toast.error(response.data.message || 'Failed to start delivery completion');
      }
    } catch (error) {
      console.error('Error starting delivery completion:', error);
      toast.error(error.response?.data?.message || 'Failed to start delivery completion');
    } finally {
      setInProgress(false);
    }
  };

  // Verify delivery code
  const handleVerifyDeliveryCode = async () => {
    if (!selectedDelivery || !verificationCode) return;
    
    setInProgress(true);
    try {
      const response = await axiosInstance.post(`/driver/delivery/${selectedDelivery._id}/complete`, {
        driverId: user._id,
        deliveryCode: verificationCode
      });
      
      if (response.data.success) {
        toast.success('Delivery completed successfully!');
        setShowCodeModal(false);
        setVerificationCode('');
        refreshDeliveries();
      } else {
        toast.error(response.data.message || 'Invalid delivery code');
      }
    } catch (error) {
      console.error('Error verifying delivery code:', error);
      toast.error(error.response?.data?.message || 'Invalid delivery code');
    } finally {
      setInProgress(false);
    }
  };

  // Handle verification for both pickup and delivery
  const handleVerifyCode = () => {
    if (actionType === 'pickup') {
      handleVerifyPickupCode();
    } else {
      handleVerifyDeliveryCode();
    }
  };

  // Get appropriate action button based on delivery status
  const getActionButton = (delivery) => {
    switch(delivery.deliveryStatus) {
      case 'driver_assigned':
        return (
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => handleStartPickup(delivery)}
            disabled={inProgress}
          >
            <FiShoppingBag className="mr-1" /> Start Pickup
          </button>
        );
      case 'pickup_ready':
        return (
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => handleStartPickup(delivery)}
            disabled={inProgress}
          >
            <FiShoppingBag className="mr-1" /> Enter Pickup Code
          </button>
        );
      case 'delivering':
        return (
          <button 
            className="btn btn-sm btn-success"
            onClick={() => handleCompleteDelivery(delivery)}
            disabled={inProgress}
          >
            <FiCheckCircle className="mr-1" /> Complete Delivery
          </button>
        );
      case 'delivered':
        return (
          <div className="badge badge-success">Delivered</div>
        );
      default:
        return null;
    }
  };

  // Get readable status for display
  const getStatusText = (status) => {
    switch(status) {
      case 'driver_assigned': return 'Ready for Pickup';
      case 'pickup_ready': return 'Awaiting Pickup';
      case 'picked_up': return 'Picked Up';
      case 'delivering': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  return (
    <>
      <HeaderMid />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FiTruck className="text-primary" />
              Driver Dashboard
            </h1>
            <p className="text-base-content/70 mt-1">
              Manage your deliveries and track your progress
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={refreshDeliveries} 
              className="btn btn-outline btn-sm"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Refresh'}
            </button>
            <Link 
              to="/requested-deliveries" 
              className="btn btn-primary"
            >
              <FiBell /> 
              View Requests
              {unreadCount > 0 && (
                <span className="badge badge-sm badge-accent">{unreadCount}</span>
              )}
            </Link>
          </div>
        </motion.div>

        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-base-100 rounded-lg shadow p-4 mb-6"
        >
          <h2 className="font-medium text-base-content mb-2">Driver Status</h2>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${user?.status === 'available' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
            <span className="font-medium">{user?.status === 'available' ? 'Available' : 'On Delivery'}</span>
          </div>
        </motion.div>
        
        {/* Current Deliveries */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-3">Current Deliveries</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : activeDeliveries.length === 0 ? (
            <div className="bg-base-100 rounded-lg shadow-md p-8 text-center">
              <FiPackage className="mx-auto text-base-300 mb-3" size={40} />
              <p className="text-base-content/70">No active deliveries at the moment.</p>
              <p className="text-sm text-base-content/50 mt-2">
                Check the notifications page for new delivery requests.
              </p>
              <div className="mt-4">
                <Link to="/requested-deliveries" className="btn btn-primary">
                  Check Requests
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDeliveries.map(delivery => (
                <motion.div 
                  key={delivery._id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card bg-base-100 shadow-md overflow-hidden"
                >
                  <div className="bg-primary text-primary-content p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Order #{delivery._id.substr(-6)}</h3>
                      <span className="badge badge-outline badge-sm">
                        {getStatusText(delivery.deliveryStatus)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {delivery.user && (
                      <div className="mb-3">
                        <p className="text-sm text-base-content/70">Customer</p>
                        <p className="font-medium">{delivery.user?.fullName || 'Customer'}</p>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <p className="text-sm text-base-content/70">Delivery Address</p>
                      <p className="font-medium">
                        {delivery.deliveryAddress?.street}, {delivery.deliveryAddress?.city}
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-base-content/70">Order</p>
                      <p className="font-medium">{delivery.quantity}x {delivery.foodSale?.name || 'Food Item'}</p>
                      <p className="text-sm">${delivery.totalPrice?.toFixed(2) || '0.00'}</p>
                    </div>
                    
                    {delivery.specialInstructions && (
                      <div className="mb-3">
                        <p className="text-sm text-base-content/70">Special Instructions</p>
                        <p className="italic text-sm">{delivery.specialInstructions}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-4">
                      <Link 
                        to={`/delivery-route/${delivery._id}`}
                        className="btn btn-sm btn-outline"
                      >
                        <FiNavigation className="mr-1" /> View Route
                      </Link>
                      
                      {getActionButton(delivery)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Verification Code Modal */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="modal-box"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  {actionType === 'pickup' ? (
                    <FiShoppingBag className="w-8 h-8" />
                  ) : (
                    <FiCheck className="w-8 h-8" />
                  )}
                </div>
              </div>
              <h3 className="font-bold text-xl text-center">
                Enter {actionType === 'pickup' ? 'Pickup' : 'Delivery'} Code
              </h3>
              <p className="py-4 text-center">
                {actionType === 'pickup' 
                  ? 'Please enter the pickup code provided by the restaurant.' 
                  : 'Please enter the delivery code provided by the customer.'}
              </p>
              <div className="form-control w-full max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="input input-bordered w-full text-center text-xl tracking-widest"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-action">
                <button className="btn" onClick={() => {
                  setShowCodeModal(false);
                  setVerificationCode('');
                }}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleVerifyCode}
                  disabled={inProgress || !verificationCode.trim()}
                >
                  {inProgress ? (
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                  ) : null}
                  Verify
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default DriverDashboard;


















