import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axiosInstance";
import { FiArrowLeft, FiLock, FiCheckCircle } from "react-icons/fi";
import HeaderMid from "../HeaderMid";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAuth } from "../../context/AuthContext"; // Add this import

// Load Stripe
const stripePromise = loadStripe(
  "pk_test_51PBvGnLL07YA4hLR0uA32N74XSqQe7t0vNYs1LECso1AdojU6hS4FDisCqLcuFYkBSKHLjDcWLfQk0Ofe7Ofgl9i00Fdsetk5J"
); // Replace with your public key

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
      <div className="form-control">
        <label className="label">
          <span className="label-text">Card Details</span>
        </label>
        <div className="card-details bg-base-200 p-4 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-center mt-4">
        <FiLock className="mr-2" />
        <span className="text-sm opacity-70">Payments are secure and encrypted</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="btn btn-primary btn-block mt-6"
      >
        {loading ? (
          <>
            <span className="loading loading-spinner loading-sm mr-2"></span>
            Processing...
          </>
        ) : (
          `Pay $${orderDetails.totalAmount}`
        )}
      </button>
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

  const handlePaymentSuccess = (paymentIntentId) => {
    setPaymentSuccess(true);
    setPaymentId(paymentIntentId);
    toast.success("Payment successful! Your order has been placed.");

    // Modified: Include the paymentId in the URL path
    setTimeout(() => {
      navigate(`/order-success/${paymentIntentId}`, {
        state: {
          paymentId: paymentIntentId,
          orderDetails,
        },
      });
    }, 2000);
  };

  if (!orderDetails) {
    return (
      <>
        <HeaderMid />
        <div className="flex justify-center items-center h-screen">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderMid />
      <div className="container mx-auto px-4 py-8">
        <motion.button
          className="btn btn-ghost btn-sm flex items-center mb-6"
          onClick={() => navigate(-1)}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ x: -5 }}
        >
          <FiArrowLeft className="mr-2" /> Back
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Order summary */}
          <motion.div
            className="card bg-base-100 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Order Summary</h2>

              <div className="flex items-center justify-between mb-2">
                <span>Item:</span>
                <span className="font-medium">
                  {orderDetails.foodSale.foodItem.name}
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span>Quantity:</span>
                <span>{orderDetails.quantity}</span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span>Price per item:</span>
                <span>
                  $
                  {(
                    orderDetails.foodSale.discountedPrice ||
                    orderDetails.foodSale.price
                  ).toFixed(2)}
                </span>
              </div>

              <div className="divider my-2"></div>

              <div className="flex items-center justify-between font-bold">
                <span>Total:</span>
                <span className="text-primary">
                  ${orderDetails.totalAmount}
                </span>
              </div>

              <div className="divider my-2"></div>

              <div>
                <h3 className="font-medium mb-2">Delivery Address:</h3>
                <p className="text-sm opacity-70">
                  {orderDetails.deliveryAddress.street}
                  <br />
                  {orderDetails.deliveryAddress.city},{" "}
                  {orderDetails.deliveryAddress.state}{" "}
                  {orderDetails.deliveryAddress.zipCode}
                  <br />
                  {orderDetails.deliveryAddress.country}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment form */}
          <motion.div
            className="card bg-base-100 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Payment Details</h2>

              {paymentSuccess ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <FiCheckCircle className="text-success text-5xl mb-4" />
                  <h3 className="text-xl font-bold">Payment Successful!</h3>
                  <p className="text-center mt-2">
                    Your order has been placed. Redirecting to confirmation...
                  </p>
                </div>
              ) : (
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    orderDetails={orderDetails}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default OrderPaymentPage;
