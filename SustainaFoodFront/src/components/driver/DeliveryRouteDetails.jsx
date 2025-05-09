import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axiosInstance";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import {
  FiArrowLeft,
  FiMapPin,
  FiUser,
  FiPackage,
  FiCheckCircle,
  FiInfo,
  FiNavigation,
  FiClock,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import DeliveryRouteMap from "./DeliveryRouteMap";

const DeliveryRouteDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [routeMode, setRouteMode] = useState("pickup"); // 'pickup' or 'delivery'
  const [watchId, setWatchId] = useState(null); // Add this state

  // Add states for code verification modal
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [actionType, setActionType] = useState(""); // 'pickup' or 'delivery'
  const [processing, setProcessing] = useState(false);

  // Replace your existing geolocation code with this
  useEffect(() => {
    // Get initial location
    setLoading(true);
    
    // First get a single position with less strict requirements
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLoading(false);
      },
      (error) => {
        console.warn("Initial location error:", error);
        // Fallback to a default location for Tunisia
        setUserLocation([36.8065, 10.1815]);
        setLoading(false);
      },
      { timeout: 10000 } // More generous initial timeout
    );
    
    // Then start watching with more relaxed settings
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.warn("Location update error:", error);
        // Don't reset the location here, just log the error
      },
      { 
        enableHighAccuracy: false, // Set to false to reduce timeout errors
        maximumAge: 30000,         // Accept positions up to 30 seconds old
        timeout: 15000             // More generous timeout
      }
    );
    
    setWatchId(id);
    
    return () => {
      if (id) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, []);

  // Fetch delivery details
  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/driver/delivery/${orderId}/details`
        );
        setDelivery(response.data.delivery);
      } catch (error) {
        console.error("Error fetching delivery details:", error);
        toast.error("Failed to load delivery details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchDeliveryDetails();
    }
  }, [orderId]);

  // Determine which route mode to show based on the delivery status
  useEffect(() => {
    if (delivery) {
      if (
        delivery.deliveryStatus === "driver_assigned" ||
        delivery.deliveryStatus === "pickup_ready"
      ) {
        setRouteMode("pickup");
      } else if (
        delivery.deliveryStatus === "picked_up" ||
        delivery.deliveryStatus === "delivering"
      ) {
        setRouteMode("delivery");
      }
    }
  }, [delivery]);

  // Handle starting pickup process
  const handleStartPickup = async () => {
    if (!user || !delivery) return;

    setProcessing(true);
    try {
      // Use POST to match your backend routes.js definition
      const response = await axiosInstance.post(
        `/driver/delivery/${orderId}/start`,
        {
          driverId: user._id,
        }
      );

      if (response.data.success) {
        toast.success("Pickup code sent to restaurant");
        setVerificationCode("");
        setShowCodeModal(true);
        setActionType("pickup");
      } else {
        toast.error(response.data.message || "Failed to start pickup process");
      }
    } catch (error) {
      console.error("Error starting pickup:", error);
      toast.error(error.response?.data?.message || "Failed to start pickup");
    } finally {
      setProcessing(false);
    }
  };

  // Handle verification code submission for pickup
  const handleVerifyPickupCode = async () => {
    if (!verificationCode.trim() || !user?._id) return;

    setProcessing(true);
    try {
      const response = await axiosInstance.post(
        `/driver/delivery/${orderId}/pickup`,
        {
          driverId: user._id,
          pickupCode: verificationCode,
        }
      );

      if (response.data.success) {
        toast.success("Pickup confirmed! Now delivering to customer.");
        setShowCodeModal(false);
        setVerificationCode("");
        setRouteMode("delivery");

        // Refresh delivery data
        const orderResponse = await axiosInstance.get(
          `/driver/delivery/${orderId}/details`
        );
        if (orderResponse.data.success) {
          setDelivery(orderResponse.data.delivery);
        }
      } else {
        toast.error(response.data.message || "Invalid pickup code");
      }
    } catch (error) {
      console.error("Error verifying pickup code:", error);
      toast.error(error.response?.data?.message || "Invalid pickup code");
    } finally {
      setProcessing(false);
    }
  };

  // Handle start delivery completion
  const handleStartDeliveryCompletion = async () => {
    if (!user || !delivery) return;

    setProcessing(true);
    try {
      const response = await axiosInstance.post(
        `/driver/delivery/${orderId}/complete/start`,
        {
          driverId: user._id,
        }
      );

      if (response.data.success) {
        toast.success("Delivery code sent to customer. Ask for the code.");
        setVerificationCode("");
        setShowCodeModal(true);
        setActionType("delivery");
      } else {
        toast.error(
          response.data.message || "Failed to start delivery completion"
        );
      }
    } catch (error) {
      console.error("Error starting delivery completion:", error);
      toast.error(
        error.response?.data?.message || "Failed to start delivery completion"
      );
    } finally {
      setProcessing(false);
    }
  };

  // Handle verification code submission for delivery
  const handleVerifyDeliveryCode = async () => {
    if (!verificationCode.trim() || !user?._id) return;

    setProcessing(true);
    try {
      const response = await axiosInstance.post(
        `/driver/delivery/${orderId}/complete`,
        {
          driverId: user._id,
          deliveryCode: verificationCode,
        }
      );

      if (response.data.success) {
        toast.success("Delivery completed successfully!");
        setShowCodeModal(false);
        setVerificationCode("");

        // Return to dashboard after a short delay
        setTimeout(() => {
          navigate("/driver-dashboard");
        }, 2000);
      } else {
        toast.error(response.data.message || "Invalid delivery code");
      }
    } catch (error) {
      console.error("Error verifying delivery code:", error);
      toast.error(error.response?.data?.message || "Invalid delivery code");
    } finally {
      setProcessing(false);
    }
  };

  // Handle verify button click based on action type
  const handleVerifyCode = () => {
    if (actionType === "pickup") {
      handleVerifyPickupCode();
    } else {
      handleVerifyDeliveryCode();
    }
  };

  if (loading) {
    return (
      <>
        <HeaderMid />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-60">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!delivery) {
    return (
      <>
        <HeaderMid />
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error shadow-lg">
            <FiInfo className="h-6 w-6" />
            <span>Failed to load delivery information</span>
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate("/driver-dashboard")}
              className="btn btn-outline"
            >
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderMid />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <FiNavigation className="text-primary" />
              {routeMode === "pickup" ? "Pickup Route" : "Delivery Route"}
            </h1>
            <button
              onClick={() => navigate("/driver-dashboard")}
              className="btn btn-outline btn-sm"
            >
              <FiArrowLeft className="mr-1" /> Back
            </button>
          </div>
          <p className="text-base-content/70 mt-1">
            Order #{delivery._id.substr(-6)}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Route Map - 2/3 of width on large screens */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-base-100 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-4 border-b border-base-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Navigation</h2>
                  <div className="tabs tabs-boxed">
                    <a
                      className={`tab ${
                        routeMode === "pickup" ? "tab-active" : ""
                      }`}
                      onClick={() => setRouteMode("pickup")}
                    >
                      To Pickup
                    </a>
                    <a
                      className={`tab ${
                        routeMode === "delivery" ? "tab-active" : ""
                      }`}
                      onClick={() => setRouteMode("delivery")}
                    >
                      To Customer
                    </a>
                  </div>
                </div>
              </div>

              <div className="h-[450px]">
                {userLocation ? (
                  <DeliveryRouteMap
                    delivery={delivery}
                    userLocation={userLocation}
                    routeMode={routeMode}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="loading loading-spinner text-primary mb-4"></div>
                      <p>Getting your location...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick External Navigation Links */}
              <div className="p-4 border-t border-base-200">
                <p className="text-sm mb-2">External Navigation:</p>
                {routeMode === "pickup" &&
                  delivery.foodSale?.businessDetails?.location && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.foodSale.businessDetails.location.lat},${delivery.foodSale.businessDetails.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                    >
                      <FiMapPin className="mr-1" /> Open in Google Maps
                    </a>
                  )}
                {routeMode === "delivery" && delivery.deliveryAddress && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.deliveryAddress.lat},${delivery.deliveryAddress.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline"
                  >
                    <FiMapPin className="mr-1" /> Open in Google Maps
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Delivery Info - 1/3 of width on large screens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Order Status */}
            <div className="bg-base-100 rounded-lg shadow-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <FiClock className="text-primary" /> Order Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Status:</span>
                  <span className="badge badge-primary">
                    {delivery.deliveryStatus.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Estimated Time:</span>
                  <span>
                    {delivery.estimatedDeliveryTime
                      ? new Date(
                          delivery.estimatedDeliveryTime
                        ).toLocaleTimeString()
                      : "Not available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-base-100 rounded-lg shadow-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <FiUser className="text-primary" /> Customer Info
              </h3>
              <div className="space-y-2">
                {delivery.user && (
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Name:</span>
                    <span className="font-medium">
                      {delivery.user.fullName}
                    </span>
                  </div>
                )}
                {delivery.user?.phone && (
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Phone:</span>
                    <a
                      href={`tel:${delivery.user.phone}`}
                      className="font-medium text-primary"
                    >
                      {delivery.user.phone}
                    </a>
                  </div>
                )}
                <div className="pt-2">
                  <p className="text-base-content/70 mb-1">Delivery Address:</p>
                  <p className="font-medium">
                    {delivery.deliveryAddress?.street},{" "}
                    {delivery.deliveryAddress?.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-base-100 rounded-lg shadow-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <FiPackage className="text-primary" /> Order Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Item:</span>
                  <span className="font-medium">
                    {delivery.foodSale?.name || "Food item"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Restaurant:</span>
                  <span className="font-medium">
                    {/* Multiple fallbacks to ensure restaurant name is displayed */}
                    {delivery.foodSale?.businessDetails?.fullName ||
                      delivery.foodSale?.foodItemDetails?.buisiness_id
                        ?.fullName ||
                      delivery.foodSale?.foodItemDetails?.name ||
                      "Restaurant name not available"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Quantity:</span>
                  <span>{delivery.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Price:</span>
                  <span>${delivery.totalPrice?.toFixed(2) || "0.00"}</span>
                </div>
                {delivery.specialInstructions && (
                  <div className="pt-2">
                    <p className="text-base-content/70 mb-1">
                      Special Instructions:
                    </p>
                    <p className="italic text-sm bg-base-200 p-2 rounded">
                      {delivery.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-base-100 rounded-lg shadow-lg p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <FiCheckCircle className="text-primary" /> Actions
              </h3>
              <div className="space-y-3">
                {/* Show appropriate action buttons based on delivery status */}
                {delivery.deliveryStatus === "driver_assigned" && (
                  <button
                    className="btn btn-primary w-full"
                    onClick={handleStartPickup}
                    disabled={processing}
                  >
                    {processing ? (
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                    ) : (
                      <FiPackage className="mr-2" />
                    )}
                    Start Pickup
                  </button>
                )}

                {delivery.deliveryStatus === "pickup_ready" && (
                  <button
                    className="btn btn-primary w-full"
                    onClick={handleStartPickup}
                    disabled={processing}
                  >
                    {processing ? (
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                    ) : (
                      <FiPackage className="mr-2" />
                    )}
                    Enter Pickup Code
                  </button>
                )}

                {delivery.deliveryStatus === "delivering" && (
                  <button
                    className="btn btn-success w-full"
                    onClick={handleStartDeliveryCompletion}
                    disabled={processing}
                  >
                    {processing ? (
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                    ) : (
                      <FiCheckCircle className="mr-2" />
                    )}
                    Complete Delivery
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Verification Code Modal */}
      {showCodeModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-xl text-center">
              {actionType === "pickup"
                ? "Enter Pickup Code"
                : "Enter Delivery Code"}
            </h3>
            <p className="py-4 text-center">
              {actionType === "pickup"
                ? "Please enter the pickup code provided by the restaurant."
                : "Please enter the delivery code provided by the customer."}
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
              <button
                className="btn"
                onClick={() => {
                  setShowCodeModal(false);
                  setVerificationCode("");
                }}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleVerifyCode}
                disabled={processing || !verificationCode.trim()}
              >
                {processing ? (
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                ) : null}
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default DeliveryRouteDetails;
