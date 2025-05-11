// Create new file: src/components/driver/AllDeliveriesMap.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import DriverRouteMap from "./DriverRouteMap";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiMap,
  FiList,
  FiMapPin,
  FiCompass,
  FiCheck,
  FiPackage,
  FiHome,
} from "react-icons/fi";
import { motion } from "framer-motion";
import axiosInstance from "../../config/axiosInstance";
import { socket } from "../../utils/socket"; // Import socket

const AllDeliveriesMap = () => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [actionType, setActionType] = useState(""); // 'pickup' or 'delivery'
  const [activeDelivery, setActiveDelivery] = useState(null); // Separate activeDelivery state
  const lastLocationUpdateRef = useRef(null);
  const watchIdRef = useRef(null);

  // Function to update driver location on server - use useCallback to prevent recreation
  const updateDriverLocation = useCallback(
    async (latitude, longitude) => {
      if (!user?._id) return;

      try {
        const orderId = activeDelivery?._id;

        // Throttle updates to prevent excessive API calls (once every 5 seconds)
        const now = Date.now();
        if (
          lastLocationUpdateRef.current &&
          now - lastLocationUpdateRef.current < 5000
        ) {
          return;
        }

        lastLocationUpdateRef.current = now;

        console.log("Sending location update:", {
          lat: latitude,
          lng: longitude,
          orderId,
        });

        // Update via API
        await axiosInstance.post(`/driver/${user._id}/location`, {
          lat: latitude,
          lng: longitude,
          orderId: orderId,
        });

        // Also emit via socket for real-time updates if we have an active delivery
        if (orderId) {
          socket.emit("driver-location-update", {
            driverId: user._id,
            orderId: orderId,
            location: {
              lat: latitude,
              lng: longitude,
            },
            timestamp: new Date(),
          });
        }

        console.log("Driver location updated successfully");
      } catch (err) {
        console.error("Error updating driver location:", err);
      }
    },
    [user, activeDelivery]
  );

  // Update activeDelivery whenever deliveries change
  useEffect(() => {
    const active = deliveries.find(
      (d) => d.status !== "delivered" && d.assignedDriver === user?._id
    );

    setActiveDelivery(active);
    console.log("Active delivery updated:", active?._id);
  }, [deliveries, user]);

  // Separate useEffect for socket connection management
  useEffect(() => {
    if (socket.disconnected) {
      socket.connect();
    }

    const handleConnect = () => console.log("Socket connected:", socket.id);
    const handleDisconnect = () => console.log("Socket disconnected");
    const handleError = (error) => console.error("Socket error:", error);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);

    if (activeDelivery?._id) {
      socket.emit("join-order-room", activeDelivery._id);
      console.log("Joined order room:", activeDelivery._id);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
    };
  }, [activeDelivery]);

  // Set up location tracking - separate from the deliveries dependency
  useEffect(() => {
    if (!user?._id) return;

    console.log("Setting up location tracking for driver:", user._id);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        updateDriverLocation(latitude, longitude);
        console.log("Initial position obtained:", {
          lat: latitude,
          lng: longitude,
        });
      },
      (error) => {
        console.error("Error getting initial position:", error);
        setUserLocation([36.8065, 10.1815]); // Default location
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        updateDriverLocation(latitude, longitude);
      },
      (error) => {
        console.error("Error watching position:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        console.log("Location tracking stopped");
      }
    };
  }, [user, updateDriverLocation]);

  const activeDeliveries = deliveries.filter(
    (del) => del.status !== "delivered"
  );

  useEffect(() => {
    if (!user?._id || !userLocation || activeDeliveries.length === 0) return;

    console.log(
      `Setting up location updates for ${activeDeliveries.length} active deliveries`
    );

    // Set up interval for periodic updates
    const intervalId = setInterval(() => {
      if (!userLocation) return;

      // Update location for each active delivery
      activeDeliveries.forEach((delivery) => {
        if (delivery.status === "delivered") return;

        socket.emit("driver-location-update", {
          driverId: user._id,
          orderId: delivery._id,
          location: {
            lat: userLocation[0],
            lng: userLocation[1],
          },
          timestamp: new Date(),
        });
      });

      // Also update via API (once for the driver)
      axiosInstance
        .post(`/driver/${user._id}/location`, {
          lat: userLocation[0],
          lng: userLocation[1],
        })
        .catch((err) => console.error("API update error:", err));
    }, 15000); // Every 15 seconds

    return () => clearInterval(intervalId);
  }, [user, userLocation, activeDeliveries]);

  // Fetch driver's deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      if (!user || !user._id) return;

      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/driver/${user._id}/map-deliveries`
        );

        if (response.data.success && response.data.data) {
          setDeliveries(response.data.data);
        } else {
          console.error("No delivery data returned from API");
          setDeliveries([]);
        }
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [user]);

  const handleConfirmAction = async (delivery, type) => {
    setSelectedDelivery(delivery);
    setActionType(type);
    setVerificationCode("");
    setVerificationError("");

    try {
      const generateEndpoint =
        type === "pickup"
          ? `/driver/delivery/${delivery._id}/start`
          : `/driver/delivery/${delivery._id}/complete/start`;

      await axiosInstance.post(generateEndpoint, {
        driverId: user._id,
      });

      setShowVerificationModal(true);
    } catch (error) {
      console.error(`Error starting ${type}:`, error);
      setVerificationError(
        error.response?.data?.message || `Failed to start ${type} process`
      );
      setShowVerificationModal(true);
    }
  };

  const submitVerification = async () => {
    if (!verificationCode.trim()) {
      setVerificationError("Please enter the verification code");
      return;
    }

    try {
      const endpoint =
        actionType === "pickup"
          ? `/driver/delivery/${selectedDelivery._id}/pickup`
          : `/driver/delivery/${selectedDelivery._id}/complete`;

      const requestData = {
        driverId: user._id,
        ...(actionType === "pickup"
          ? { pickupCode: verificationCode.trim() }
          : { deliveryCode: verificationCode.trim() }),
      };

      console.log("Submitting verification with data:", requestData);

      const response = await axiosInstance.post(endpoint, requestData);

      if (response.data && response.data.success) {
        setDeliveries((prev) =>
          prev.map((del) =>
            del._id === selectedDelivery._id
              ? {
                  ...del,
                  status: actionType === "pickup" ? "in-transit" : "delivered",
                  pickedUp: actionType === "pickup" ? true : del.pickedUp,
                }
              : del
          )
        );

        setShowVerificationModal(false);
      } else {
        setVerificationError(
          response.data?.message || "Unknown error occurred"
        );
      }
    } catch (error) {
      console.error(`Error confirming ${actionType}:`, error);
      const errorMessage =
        error.response?.data?.message || `Failed to confirm ${actionType}`;
      setVerificationError(errorMessage);
    }
  };

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <>
      <HeaderMid />
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FiMap className="text-primary" />
              All Deliveries Route
            </h1>
            <Link to="/driver-dashboard" className="btn btn-outline btn-sm">
              <FiArrowLeft className="mr-1" /> Back to Dashboard
            </Link>
          </div>

          <div className="mb-4 bg-base-100 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-2 text-sm">
              <FiCompass className="text-primary" />
              <span>
                This map shows the optimized route for all your active
                deliveries. Follow the blue line for the most efficient route.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-base-100 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-base-200">
                <h2 className="font-semibold">Your Optimized Route</h2>
              </div>

              {userLocation ? (
                <DriverRouteMap
                  driverId={user._id}
                  userLocation={userLocation}
                  deliveries={activeDeliveries}
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-3"></div>
                    <p>Getting your location...</p>
                  </div>
                </div>
              )}

              <div className="p-4 border-t border-base-200">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="badge badge-sm badge-primary">
                      <FiMapPin className="mr-1" /> Pickups
                    </span>
                    <span className="badge badge-sm badge-secondary">
                      <FiMapPin className="mr-1" /> Deliveries
                    </span>
                  </div>

                  <Link
                    to="/driver-dashboard"
                    className="btn btn-sm btn-primary"
                  >
                    <FiList className="mr-1" /> View as List
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-base-100 rounded-lg shadow-lg">
              <div className="p-4 border-b border-base-200">
                <h2 className="font-semibold">Your Active Deliveries</h2>
              </div>

              <div className="overflow-y-auto max-h-[500px]">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="loading loading-spinner loading-md text-primary mb-3"></div>
                    <p>Loading deliveries...</p>
                  </div>
                ) : activeDeliveries.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No active deliveries found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-base-200">
                    {activeDeliveries.map((delivery) => (
                      <div
                        key={delivery._id}
                        className="p-4 hover:bg-base-200 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex gap-2">
                            <div
                              className={`badge ${
                                delivery.pickedUp
                                  ? "badge-secondary"
                                  : "badge-primary"
                              }`}
                            >
                              {delivery.pickedUp ? "In Transit" : "Pickup"}
                            </div>
                            <div className="font-medium">
                              Order #
                              {delivery.orderNumber || delivery._id.slice(-6)}
                            </div>
                          </div>
                          <div className="text-sm opacity-70">
                            {new Date(delivery.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="mb-3">
                          <h3 className="font-medium text-sm">
                            {delivery.foodSale?.businessDetails?.fullName ||
                              "Restaurant"}
                          </h3>
                          <p className="text-xs opacity-70">
                            {
                              delivery.foodSale?.businessDetails?.address
                                ?.street
                            }
                            ,{delivery.foodSale?.businessDetails?.address?.city}
                          </p>
                        </div>

                        <div className="mb-3">
                          <h3 className="font-medium text-sm">
                            {delivery.user?.fullName || "Customer"}
                          </h3>
                          <p className="text-xs opacity-70">
                            {delivery.deliveryAddress?.street},{" "}
                            {delivery.deliveryAddress?.city}
                          </p>
                        </div>

                        <div className="flex justify-between gap-2 mt-3">
                          {!delivery.pickedUp ? (
                            <button
                              className="btn btn-primary btn-sm flex-1"
                              onClick={() =>
                                handleConfirmAction(delivery, "pickup")
                              }
                            >
                              <FiPackage className="mr-1" /> Confirm Pickup
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm flex-1"
                              onClick={() =>
                                handleConfirmAction(delivery, "delivery")
                              }
                            >
                              <FiHome className="mr-1" /> Confirm Delivery
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full relative">
            <div className="p-5 border-b border-base-200">
              <h3 className="font-bold text-lg">
                Confirm {actionType === "pickup" ? "Pickup" : "Delivery"}
              </h3>
            </div>

            <div className="p-5">
              {verificationError ? (
                <div className="text-error mb-4">{verificationError}</div>
              ) : (
                <>
                  <p className="mb-4">
                    Please enter the verification code provided by the{" "}
                    {actionType === "pickup" ? "restaurant staff" : "customer"}.
                  </p>

                  <div className="form-control mb-4">
                    <input
                      type="text"
                      placeholder="Enter verification code"
                      className="input input-bordered w-full text-center text-xl font-medium"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  <p className="mt-2 text-sm text-center opacity-70">
                    A code has been sent to the{" "}
                    {actionType === "pickup" ? "restaurant" : "customer"}.
                  </p>
                </>
              )}
            </div>

            <div className="p-5 border-t border-base-200 flex justify-end gap-3">
              <button
                className="btn btn-ghost"
                onClick={() => setShowVerificationModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={submitVerification}
                disabled={!verificationCode || verificationCode.length < 4}
              >
                <FiCheck className="mr-1" /> Verify
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AllDeliveriesMap;
