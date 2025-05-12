import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axiosInstance";
import { FiArrowLeft, FiLock, FiCheckCircle, FiCreditCard, FiShoppingBag, FiMapPin, FiDollarSign } from "react-icons/fi";
import HeaderMid from "../HeaderMid";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "../../context/AuthContext";

// Load Stripe
const stripePromise = loadStripe(
  "pk_test_51PBvGnLL07YA4hLR0uA32N74XSqQe7t0vNYs1LECso1AdojU6hS4FDisCqLcuFYkBSKHLjDcWLfQk0Ofe7Ofgl9i00Fdsetk5J"
);

// Enhanced CheckoutForm component
const CheckoutForm = ({ orderDetails, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const paymentIntentRequested = useRef(false); // Add this ref to prevent duplicate API calls

  useEffect(() => {
    // Create payment intent when component loads
    const createPaymentIntent = async () => {
      // Use ref to prevent duplicate calls across renders
      if (paymentIntentRequested.current || !orderDetails) return;
      paymentIntentRequested.current = true;

      try {
        setLoading(true);
        console.log("Creating payment intent for order:", orderDetails);

        // Create unique identifier for this order
        const orderIdentifier = `${orderDetails.foodId}_${orderDetails.userId || "guest"}_${Date.now()}`;

        const response = await axiosInstance.post("/payment/create-payment-intent", {
          foodSaleId: orderDetails.foodId,
          quantity: orderDetails.quantity,
          userId: orderDetails.userId,
          deliveryAddress: orderDetails.deliveryAddress,
          specialInstructions: orderDetails.specialInstructions,
          orderIdentifier: orderIdentifier, // Add this to prevent duplicates
        });

        console.log("Payment intent created:", response.data);
        setClientSecret(response.data.clientSecret);
        setPaymentIntentId(response.data.paymentIntentId);
        setLoading(false);
      } catch (err) {
        console.error("Payment error details:", err.response?.data || err);
        setError(err.response?.data?.message || "Failed to initialize payment");
        setLoading(false);
        toast.error("Payment initialization failed. Please try again.");
        paymentIntentRequested.current = false; // Reset flag on error
      }
    };

    createPaymentIntent();

    // Cleanup function to cancel payment intent if component unmounts
    return () => {
      if (paymentIntentId && !clientSecret) {
        // Cancel payment intent if it was created but not used
        axiosInstance
          .post(`/payment/cancel-payment-intent/${paymentIntentId}`)
          .catch((err) => console.error("Error cancelling payment intent:", err));
      }
    };
  }, [orderDetails]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: orderDetails.deliveryAddress?.name || 'Customer',
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        setError(error.message);
        toast.error("Payment failed: " + error.message);
      } else {
        if (paymentIntent.status === 'succeeded') {
          console.log('Payment succeeded!', paymentIntent);

          // Important: Explicitly check payment status to update order
          await axiosInstance.get(`/payment/status/${paymentIntentId}`);

          // Call onSuccess callback to notify parent component
          onSuccess(paymentIntentId);
        } else {
          setError(`Payment status: ${paymentIntent.status}. Please try again.`);
          toast.warning("Payment is pending or requires additional steps");
        }
      }
    } catch (err) {
      console.error("Payment error details:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to process payment");
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await axiosInstance.get(`/payment/status/${paymentIntentId}`);

      if (response.data.status === "succeeded") {
        // Payment confirmed, call success handler
        onSuccess(paymentIntentId);
      } else {
        setError("Payment is still processing. Please wait.");
        toast.info("Your payment is processing. We'll notify you when it's complete.");
      }
    } catch (err) {
      setError("Failed to verify payment status");
      toast.error("Could not verify payment status. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative mb-8">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-focus rounded-full"></div>
        <label className="text-base-content font-medium mb-2 block pl-2">
          Card Details
        </label>
        <motion.div 
          className="bg-base-200 p-6 rounded-xl border border-base-300 shadow-sm"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-3">
            <FiCreditCard className="text-primary mr-2" />
            <span className="text-sm text-base-content/70">Enter your card information</span>
          </div>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-family)",
                  "::placeholder": {
                    color: "var(--color-text-placeholder)",
                  },
                  iconColor: "var(--color-primary)",
                },
                invalid: {
                  color: "var(--color-error)",
                  iconColor: "var(--color-error)",
                },
              },
              hidePostalCode: true,
            }}
            className="py-2"
          />
        </motion.div>
      </div>

      {error && (
        <motion.div 
          className="bg-error/10 border border-error/20 text-error rounded-lg p-4 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-center my-4 text-base-content/60">
        <div className="bg-base-200/50 backdrop-blur-sm px-4 py-2 rounded-full flex items-center shadow-sm">
          <FiLock className="mr-2 text-success" />
          <span className="text-sm">Payments are secure and encrypted</span>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="w-full py-4 bg-gradient-to-r from-primary to-primary-focus text-primary-content rounded-xl font-medium shadow-lg relative overflow-hidden group"
        whileHover={{ y: -2, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        whileTap={{ y: 0, boxShadow: "0 5px 10px -5px rgba(0, 0, 0, 0.1)" }}
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-primary-content/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
        {loading ? (
          <div className="flex items-center justify-center">
            <motion.div 
              className="w-5 h-5 border-3 border-primary-content border-t-transparent rounded-full mr-3"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span>Processing Payment...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <FiDollarSign className="mr-2" />
            <span>Pay ${orderDetails.totalAmount}</span>
          </div>
        )}
      </motion.button>
    </form>
  );
};

const OrderPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth(); // Use AuthContext instead of localStorage
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  // Add these new states for enhanced tracking and feedback
  const [orderStep, setOrderStep] = useState(1); // Track payment flow step
  const [orderNumber, setOrderNumber] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);

  useEffect(() => {
    // Only proceed if auth is done loading
    if (!isLoading) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        toast.error("Please log in to complete your order");
        navigate("/login");
        return;
      }

      // Get order details from location state
      if (location.state) {
        setOrderDetails({
          ...location.state,
          userId: user._id, // Get userId from AuthContext
        });
      } else {
        // No order details found, redirect back to food sales
        toast.error("Order information is missing");
        navigate("/food-sales");
      }
    }
  }, [location, navigate, isLoading, isAuthenticated, user]);

  // Enhanced success handler with more details
  const handlePaymentSuccess = (paymentIntentId) => {
    setPaymentSuccess(true);
    setPaymentId(paymentIntentId);
    
    // Generate a random order number for better user experience
    const randomOrderNumber = `ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setOrderNumber(randomOrderNumber);
    
    // Set estimated delivery date (3-5 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3 + Math.floor(Math.random() * 3));
    setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    }));
    
    // Animated toast notification
    toast.success("Payment successful! Your order has been placed.", {
      icon: "🎉",
      progressStyle: { background: 'linear-gradient(to right, #4ade80, #22c55e)' }
    });

    // Show an animated step transition
    setOrderStep(2);
    
    // Redirect with more detailed information
    setTimeout(() => {
      navigate(`/order-success/${paymentIntentId}`, {
        state: {
          paymentId: paymentIntentId,
          orderDetails,
          orderNumber: randomOrderNumber,
          estimatedDelivery: deliveryDate
        },
      });
    }, 3000);
  };

  if (!orderDetails) {
    return (
      <>
        <HeaderMid />
        <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex justify-center items-center">
          <motion.div
            className="flex flex-col items-center relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="w-24 h-24 relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="absolute top-0 left-0 w-8 h-8 bg-primary rounded-full blur-sm opacity-80"
                animate={{ 
                  top: ["0%", "100%", "0%"],
                  left: ["0%", "100%", "0%"],
                }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-8 h-8 bg-secondary rounded-full blur-sm opacity-80"
                animate={{ 
                  bottom: ["0%", "100%", "0%"],
                  right: ["0%", "100%", "0%"],
                }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <FiShoppingBag className="w-12 h-12 text-primary-focus" />
              </div>
            </motion.div>
            <motion.p
              className="mt-6 text-base-content/70 font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Preparing your order...
            </motion.p>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderMid />
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Order Progress Tracker */}
          <div className="mb-10">
            <div className="flex justify-between items-center max-w-md mx-auto">
              <motion.div 
                className={`flex flex-col items-center ${orderStep >= 1 ? 'text-primary' : 'text-base-content/50'}`}
                animate={orderStep >= 1 ? { scale: [1, 1.1, 1], transition: { duration: 0.5 } } : {}}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${orderStep >= 1 ? 'bg-primary text-primary-content' : 'bg-base-300'}`}>
                  <span>1</span>
                </div>
                <span className="text-xs">Review</span>
              </motion.div>
              
              <div className={`h-1 flex-1 mx-2 ${orderStep >= 2 ? 'bg-primary' : 'bg-base-300'}`}></div>
              
              <motion.div 
                className={`flex flex-col items-center ${orderStep >= 2 ? 'text-primary' : 'text-base-content/50'}`}
                animate={orderStep >= 2 ? { scale: [1, 1.1, 1], transition: { duration: 0.5 } } : {}}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${orderStep >= 2 ? 'bg-primary text-primary-content' : 'bg-base-300'}`}>
                  <span>2</span>
                </div>
                <span className="text-xs">Payment</span>
              </motion.div>
              
              <div className={`h-1 flex-1 mx-2 ${orderStep >= 3 ? 'bg-primary' : 'bg-base-300'}`}></div>
              
              <motion.div 
                className={`flex flex-col items-center ${orderStep >= 3 ? 'text-primary' : 'text-base-content/50'}`}
                animate={orderStep >= 3 ? { scale: [1, 1.1, 1], transition: { duration: 0.5 } } : {}}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${orderStep >= 3 ? 'bg-primary text-primary-content' : 'bg-base-300'}`}>
                  <span>3</span>
                </div>
                <span className="text-xs">Confirmation</span>
              </motion.div>
            </div>
          </div>

          <motion.button
            className="group flex items-center text-base-content/70 hover:text-primary mb-8 py-2 px-4 rounded-lg hover:bg-base-200 transition-colors"
            onClick={() => navigate(-1)}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ x: -5 }}
          >
            <FiArrowLeft className="mr-2 group-hover:animate-pulse" /> 
            <span>Return to Food Selection</span>
          </motion.button>

          <motion.h1 
            className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Complete Your Order
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Order summary */}
            <motion.div
              className="md:col-span-2 bg-base-100 rounded-2xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-primary/90 to-primary-focus/90 text-primary-content p-6">
                <div className="flex items-center">
                  <FiShoppingBag className="w-6 h-6 mr-3" />
                  <h2 className="text-xl font-bold">Order Summary</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="text-sm text-base-content/70">Item</span>
                      <h3 className="text-lg font-medium text-base-content">
                        {orderDetails.foodSale.foodItem.name}
                      </h3>
                    </div>
                    <div className="flex-none ml-4 bg-base-200 px-3 py-1 rounded-lg">
                      <span className="text-sm font-medium">x{orderDetails.quantity}</span>
                    </div>
                  </div>

                  <div className="py-4 border-t border-base-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base-content/70">Price per item</span>
                      <span className="font-medium">${(orderDetails.foodSale.discountedPrice || orderDetails.foodSale.price).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-base-content/70">Quantity</span>
                      <span>{orderDetails.quantity}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 pb-1 border-t border-base-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-xl font-bold text-primary">${orderDetails.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-base-200">
                  <div className="flex items-start">
                    <FiMapPin className="text-primary mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-base-content mb-2">Delivery Address</h3>
                      <p className="text-sm text-base-content/70 leading-relaxed">
                        {orderDetails.deliveryAddress.street}<br />
                        {orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state} {orderDetails.deliveryAddress.zipCode}<br />
                        {orderDetails.deliveryAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-base-200/50 rounded-xl p-4 text-xs text-base-content/60 text-center">
                  <p>Your order will be processed immediately after payment</p>
                </div>
              </div>
            </motion.div>

            {/* Payment form */}
            <motion.div
              className="md:col-span-3 bg-base-100 rounded-2xl shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {paymentSuccess ? (
                    <motion.div 
                      className="flex flex-col items-center justify-center py-10"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <motion.div 
                        className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                      >
                        <FiCheckCircle className="text-success text-4xl" />
                      </motion.div>
                      
                      <motion.h3 
                        className="text-2xl font-bold mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        Payment Successful!
                      </motion.h3>
                      
                      {/* Enhanced success information */}
                      <motion.div
                        className="bg-base-200/50 rounded-xl p-4 w-full max-w-xs mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-base-content/70">Order Number:</span>
                          <span className="font-medium">{orderNumber}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-base-content/70">Est. Delivery:</span>
                          <span className="font-medium">{estimatedDelivery}</span>
                        </div>
                      </motion.div>
                      
                      <motion.p 
                        className="text-center text-base-content/70 max-w-xs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        Your order has been placed successfully. Redirecting to confirmation...
                      </motion.p>
                      
                      <motion.div 
                        className="w-full max-w-xs h-1 bg-base-200 rounded-full mt-8 overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3, ease: "easeInOut" }}
                        />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <h2 className="text-xl font-bold text-base-content mb-6 flex items-center">
                        <FiCreditCard className="mr-3 text-primary" />
                        Payment Details
                      </h2>
                      <Elements stripe={stripePromise}>
                        <CheckoutForm
                          orderDetails={orderDetails}
                          onSuccess={handlePaymentSuccess}
                        />
                      </Elements>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
          
          {/* Additional help section */}
          <motion.div 
            className="mt-10 bg-base-100 rounded-xl p-6 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-base-200/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Delivery Questions</h4>
                <p className="text-base-content/70">For questions about delivery timeframes or special instructions.</p>
              </div>
              <div className="bg-base-200/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Payment Issues</h4>
                <p className="text-base-content/70">Having trouble with your payment? Our team is ready to help.</p>
              </div>
              <div className="bg-base-200/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Contact Support</h4>
                <p className="text-base-content/70">Email us at support@sustainafood.com or call (555) 123-4567.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OrderPaymentPage;
