import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiHome, FiPackage } from 'react-icons/fi';
import HeaderMid from '../HeaderMid';
import axiosInstance from '../../config/axiosInstance';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

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
    return (
      <>
        <HeaderMid />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">
            <FiCheckCircle className="mx-auto text-6xl text-success mb-4" />
            <h1 className="text-3xl font-bold mb-2">Loading Order...</h1>
            <p>Please wait while we fetch your order details.</p>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <HeaderMid />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">
            <FiCheckCircle className="mx-auto text-6xl text-success mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Completed</h1>
            <p>Redirecting to home page...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderMid />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <motion.div
          className="card bg-base-100 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card-body items-center text-center">
            <div className="mb-6">
              <motion.div 
                className="w-24 h-24 rounded-full bg-success flex items-center justify-center mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              >
                <FiCheckCircle className="text-white text-5xl" />
              </motion.div>
              
              <h1 className="text-3xl font-bold mt-4">Order Successful!</h1>
              <p className="opacity-70 mt-2">Your food will be prepared and ready for delivery soon.</p>
            </div>
            
            <div className="bg-base-200 rounded-lg p-6 w-full text-left mb-6">
              <h2 className="font-bold text-lg mb-4">Order Summary</h2>
              
              <div className="flex justify-between mb-2">
                <span>Item:</span>
                <span className="font-medium">{order.foodSale.foodItem.name}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span>Quantity:</span>
                <span>{order.quantity}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span>Total Amount:</span>
                <span className="font-bold">${order.totalAmount}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span>Payment ID:</span>
                <span className="font-mono text-sm">{order.paymentId.substring(0, 16)}...</span>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium">Delivery Address:</h3>
                <p className="text-sm opacity-70 mt-1">
                  {order.deliveryAddress.street}<br />
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}<br />
                  {order.deliveryAddress.country}
                </p>
              </div>
            </div>
            
            <div className="card-actions justify-center gap-4">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/orders')}
              >
                <FiPackage className="mr-2" /> View My Orders
              </button>
              
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/')}
              >
                <FiHome className="mr-2" /> Back to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OrderSuccessPage;