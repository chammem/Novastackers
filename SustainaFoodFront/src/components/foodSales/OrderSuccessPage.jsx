import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiHome, FiPackage, FiMapPin, FiCalendar, FiClock, FiBox, FiTruck } from 'react-icons/fi';
import HeaderMid from '../HeaderMid';
import axiosInstance from '../../config/axiosInstance';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [deliveryStage, setDeliveryStage] = useState(0);

  useEffect(() => {
    // Simulated delivery progress animation
    if (order) {
      const stages = [1, 2, 3];
      let currentIndex = 0;
      
      const progressInterval = setInterval(() => {
        if (currentIndex < stages.length) {
          setDeliveryStage(stages[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(progressInterval);
        }
      }, 1200);
      
      return () => clearInterval(progressInterval);
    }
  }, [order]);

  useEffect(() => {
    // Enhanced loading animation with steps
    if (loading) {
      const loadingSteps = ['Verifying payment', 'Fetching order details', 'Preparing order summary'];
      let currentStep = 0;
      
      const loadingInterval = setInterval(() => {
        if (currentStep < loadingSteps.length) {
          setLoadingStep(currentStep);
          currentStep++;
        } else {
          currentStep = 0;
          setLoadingStep(currentStep);
        }
      }, 800);
      
      return () => clearInterval(loadingInterval);
    }
  }, [loading]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        if (orderId !== 'completed') {
          // Always verify payment status first if this is a payment ID
          if (orderId.startsWith('pi_')) {
            // This call should update the order status if needed
            const paymentResponse = await axiosInstance.get(`/payment/status/${orderId}`);
            
            if (paymentResponse.data.success && paymentResponse.data.orderId) {
              // Get order details using the orderId from the payment response
              const orderResponse = await axiosInstance.get(`/orders/${paymentResponse.data.orderId}`);
              setOrder(orderResponse.data.data);
              
              // Force refresh of order if still pending
              if (orderResponse.data.data?.status === 'pending') {
                setTimeout(async () => {
                  // Try one more time after a short delay
                  const refreshedOrderResponse = await axiosInstance.get(`/orders/${paymentResponse.data.orderId}`);
                  setOrder(refreshedOrderResponse.data.data);
                }, 2000);
              }
            }
          } else {
            // Direct order ID
            const response = await axiosInstance.get(`/orders/${orderId}`);
            setOrder(response.data.data);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order:", err);
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    const loadingMessages = [
      'Verifying payment details',
      'Securing your order information',
      'Preparing your receipt'
    ];
    
    return (
      <>
        <HeaderMid />
        <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-4">
          <motion.div 
            className="bg-base-100 rounded-2xl shadow-xl p-8 max-w-md w-full relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Animated background elements */}
            <motion.div 
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-success/5"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="relative z-10">
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  className="w-24 h-24 relative mb-6"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-success/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div 
                    className="w-full h-full rounded-full bg-base-100 flex items-center justify-center border-4 border-success"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <FiCheckCircle className="text-success text-4xl" />
                  </motion.div>
                </motion.div>
                
                <motion.h1 
                  className="text-2xl font-bold mb-3"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Processing Your Order
                </motion.h1>
                
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={loadingStep}
                    className="text-base-content/70 max-w-xs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {loadingMessages[loadingStep]}
                  </motion.p>
                </AnimatePresence>
                
                {/* Animated progress bar */}
                <motion.div 
                  className="w-full h-2 bg-base-200 rounded-full mt-6 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div 
                    className="h-full bg-success rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: ["0%", "30%", "60%", "90%", "95%"] }}
                    transition={{ 
                      duration: 3, 
                      times: [0, 0.2, 0.4, 0.6, 0.95],
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <HeaderMid />
        <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-4">
          <motion.div 
            className="bg-base-100 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <motion.div 
              className="w-20 h-20 rounded-full bg-success flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <FiCheckCircle className="text-white text-3xl" />
            </motion.div>
            
            <motion.h1 
              className="text-2xl font-bold mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Order Completed
            </motion.h1>
            
            <motion.p
              className="text-base-content/70 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Thank you for your order!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button 
                className="btn btn-primary btn-block"
                onClick={() => navigate('/')}
              >
                <FiHome className="mr-2" /> Return to Home
              </button>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  // Calculate estimated delivery date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  
  const deliveryStages = [
    { icon: <FiCheckCircle />, text: "Order Confirmed", complete: true },
    { icon: <FiBox />, text: "Preparing Food", complete: deliveryStage >= 1 },
    { icon: <FiTruck />, text: "Out for Delivery", complete: deliveryStage >= 2 },
    { icon: <FiHome />, text: "Delivered", complete: deliveryStage >= 3 }
  ];

  return (
    <>
      <HeaderMid />
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-base-100 rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Success header */}
            <div className="bg-gradient-to-r from-success to-success/80 text-success-content p-8 relative">
              <motion.div 
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <motion.div 
                  className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                >
                  <FiCheckCircle className="text-white text-5xl" />
                </motion.div>
                
                <div className="text-center md:text-left">
                  <motion.h1 
                    className="text-3xl font-bold"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Order Successful!
                  </motion.h1>
                  <motion.p 
                    className="text-success-content/80 mt-2 max-w-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Your order has been confirmed and will be on its way to you shortly.
                  </motion.p>
                </div>
              </div>
            </div>
            
            {/* Order progress tracker */}
            <div className="p-6 border-b border-base-200">
              <h2 className="font-bold text-lg mb-4 flex items-center">
                <FiTruck className="mr-2" /> Delivery Status
              </h2>
              
              <div className="flex flex-col md:flex-row justify-between relative mb-2">
                {/* Progress line */}
                <div className="hidden md:block absolute top-5 left-0 right-0 h-1 bg-base-200 z-0">
                  <motion.div 
                    className="h-full bg-success"
                    initial={{ width: "0%" }}
                    animate={{ width: deliveryStage === 0 ? "0%" : 
                              deliveryStage === 1 ? "33%" : 
                              deliveryStage === 2 ? "66%" : 
                              "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                {/* Stages */}
                {deliveryStages.map((stage, index) => (
                  <motion.div 
                    key={index}
                    className="flex flex-row md:flex-col items-center mb-4 md:mb-0 relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <motion.div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${stage.complete ? 'bg-success text-success-content' : 'bg-base-200 text-base-content/50'}`}
                      whileHover={{ scale: 1.1 }}
                      animate={stage.complete ? { 
                        scale: [1, 1.1, 1],
                        transition: { duration: 0.3, delay: 0.2 * index }
                      } : {}}
                    >
                      {stage.icon}
                    </motion.div>
                    <div className={`ml-3 md:ml-0 md:mt-2 text-sm font-medium ${stage.complete ? 'text-success' : 'text-base-content/50'}`}>
                      {stage.text}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                className="bg-success/10 rounded-lg p-4 mt-4 flex items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <FiCalendar className="text-success mr-3 flex-shrink-0" />
                <div>
                  <div className="text-sm text-base-content/70">Estimated Delivery</div>
                  <div className="font-medium">
                    {deliveryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Order details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order summary */}
                <motion.div 
                  className="bg-base-200/50 rounded-xl p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center">
                    <FiPackage className="mr-2" /> Order Summary
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Item</span>
                      <span className="font-medium">{order.foodSale.foodItem.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Quantity</span>
                      <span>{order.quantity}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Total Amount</span>
                      <motion.span 
                        className="font-bold text-primary"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        ${order.totalAmount}
                      </motion.span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Payment ID</span>
                      <span className="font-mono text-xs">{order.paymentId.substring(0, 12)}...</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Order Date</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Delivery address */}
                <motion.div 
                  className="bg-base-200/50 rounded-xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center">
                    <FiMapPin className="mr-2" /> Delivery Address
                  </h3>
                  
                  <div className="bg-base-100 rounded-lg p-4 relative">
                    <motion.div 
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center text-success-content shadow-md"
                      whileHover={{ rotate: 10 }}
                    >
                      <FiMapPin size={14} />
                    </motion.div>
                    
                    <p className="leading-relaxed">
                      {order.deliveryAddress.street}<br />
                      {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}<br />
                      {order.deliveryAddress.country}
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-2 flex items-center">
                      <FiClock className="mr-2" /> Delivery Instructions
                    </h4>
                    <p className="text-base-content/70 text-sm">
                      {order.specialInstructions || "No special instructions provided."}
                    </p>
                  </div>
                </motion.div>
              </div>
              
              {/* Action buttons */}
              <motion.div 
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <motion.button 
                  className="btn btn-primary flex-1 gap-2"
                  whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ y: 0 }}
                  onClick={() => navigate('/orders')}
                >
                  <FiPackage /> View My Orders
                </motion.button>
                
                <motion.button 
                  className="btn btn-outline flex-1 gap-2"
                  whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ y: 0 }}
                  onClick={() => navigate('/')}
                >
                  <FiHome /> Back to Home
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccessPage;