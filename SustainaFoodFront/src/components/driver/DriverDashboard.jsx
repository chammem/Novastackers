import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../config/axiosInstance";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import {
  FiPackage,
  FiNavigation,
  FiCheckCircle,
  FiClock,
  FiBell,
  FiTruck,
  FiShoppingBag,
  FiCheck,
  FiCalendar,
  FiMapPin,
  FiClipboard,
  FiUser,
  FiRefreshCw,
  FiAlertCircle,
  FiMap,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../context/NotificationContext";
import DriverLocationInitializer from "./DriverLocationInitializer";

const DriverDashboard = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [hoverCard, setHoverCard] = useState(null);

  // Code verification state
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [actionType, setActionType] = useState(""); // 'pickup' or 'delivery'
  const [inProgress, setInProgress] = useState(false);

  // Pending requests count state
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    if (!user || !user._id) return;

    const fetchActiveDeliveries = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/driver/assignments/${user._id}`
        );
        setActiveDeliveries(response.data.assignments || []);
      } catch (error) {
        console.error("Error fetching active deliveries:", error);
        toast.error("Failed to load active deliveries");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveDeliveries();

    // Refresh every 30 seconds
    const intervalId = setInterval(fetchActiveDeliveries, 30000);

    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (!user || !user._id) return;

    const fetchPendingRequests = async () => {
      try {
        const response = await axiosInstance.get(
          `/driver/assignment-requests/${user._id}`
        );
        if (response.data.success) {
          // Set the count from the actual delivery requests
          setPendingRequestsCount(response.data.requests?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching pending request count:", error);
        // Don't reset count on error to prevent flickering
      }
    };

    // Call immediately
    fetchPendingRequests();

    // Refresh every 30 seconds (matching your other refresh interval)
    const interval = setInterval(fetchPendingRequests, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const refreshDeliveries = async () => {
    if (!user || !user._id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/driver/assignments/${user._id}`
      );
      setActiveDeliveries(response.data.assignments || []);
      toast.success("Deliveries refreshed!");
    } catch (error) {
      console.error("Error refreshing deliveries:", error);
      toast.error("Failed to refresh deliveries");
    } finally {
      setLoading(false);
    }
  };

  // Start pickup process - request pickup code
  const handleStartPickup = async (delivery) => {
    setInProgress(true);
    setSelectedDelivery(delivery);
    try {
      const response = await axiosInstance.post(
        `/driver/delivery/${delivery._id}/start`,
        {
          driverId: user._id,
        }
      );

      if (response.data.success) {
        toast.success("Pickup initiated. Get the code from the restaurant.");
        setActionType("pickup");
        setShowCodeModal(true);
      } else {
        toast.error(response.data.message || "Failed to start pickup process");
      }
    } catch (error) {
      console.error("Error starting pickup:", error);
      toast.error(
        error.response?.data?.message || "Failed to start pickup process"
      );
    } finally {
      setInProgress(false);
    }
  };

  // Verify pickup code and start delivery
  const handleVerifyPickupCode = async () => {
    if (!selectedDelivery || !verificationCode) return;

    setInProgress(true);
    try {
      const response = await axiosInstance.post(
        `/driver/delivery/${selectedDelivery._id}/pickup`,
        {
          driverId: user._id,
          pickupCode: verificationCode,
        }
      );

      if (response.data.success) {
        toast.success(
          "Pickup verified! You can now start delivering the order."
        );
        setShowCodeModal(false);
        setVerificationCode("");
        refreshDeliveries();
      } else {
        toast.error(response.data.message || "Invalid pickup code");
      }
    } catch (error) {
      console.error("Error verifying pickup code:", error);
      toast.error(error.response?.data?.message || "Invalid pickup code");
    } finally {
      setInProgress(false);
    }
  };

  // Complete delivery with customer code
  const handleCompleteDelivery = async (delivery) => {
    setInProgress(true);
    try {
      // First, generate the delivery code
      const response = await axiosInstance.post(
        `/driver/delivery/${delivery._id}/complete/start`,
        {
          driverId: user._id,
        }
      );

      if (response.data.success) {
        toast.success(
          "Code sent to customer. Ask for the code to complete delivery."
        );
        // Then show the code entry modal
        setSelectedDelivery(delivery);
        setActionType("delivery");
        setShowCodeModal(true);
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
      setInProgress(false);
    }
  };

  // Verify delivery code
  const handleVerifyDeliveryCode = async () => {
    if (!selectedDelivery || !verificationCode) return;

    setInProgress(true);
    try {
      const response = await axiosInstance.post(
        `/driver/delivery/${selectedDelivery._id}/complete`,
        {
          driverId: user._id,
          deliveryCode: verificationCode,
        }
      );

      if (response.data.success) {
        toast.success("Delivery completed successfully!");
        setShowCodeModal(false);
        setVerificationCode("");
        refreshDeliveries();
      } else {
        toast.error(response.data.message || "Invalid delivery code");
      }
    } catch (error) {
      console.error("Error verifying delivery code:", error);
      toast.error(error.response?.data?.message || "Invalid delivery code");
    } finally {
      setInProgress(false);
    }
  };

  // Handle verification for both pickup and delivery
  const handleVerifyCode = () => {
    if (actionType === "pickup") {
      handleVerifyPickupCode();
    } else {
      handleVerifyDeliveryCode();
    }
  };

  // Get appropriate action button based on delivery status
  const getActionButton = (delivery) => {
    switch (delivery.deliveryStatus) {
      case "driver_assigned":
        return (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleStartPickup(delivery)}
            disabled={inProgress}
          >
            <FiShoppingBag className="mr-1" /> Start Pickup
          </button>
        );
      case "pickup_ready":
        return (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleStartPickup(delivery)}
            disabled={inProgress}
          >
            <FiShoppingBag className="mr-1" /> Enter Pickup Code
          </button>
        );
      case "delivering":
        return (
          <button
            className="btn btn-sm btn-success"
            onClick={() => handleCompleteDelivery(delivery)}
            disabled={inProgress}
          >
            <FiCheckCircle className="mr-1" /> Complete Delivery
          </button>
        );
      case "delivered":
        return <div className="badge badge-success">Delivered</div>;
      default:
        return null;
    }
  };

  // Get readable status for display
  const getStatusText = (status) => {
    switch (status) {
      case "driver_assigned":
        return "Ready for Pickup";
      case "pickup_ready":
        return "Awaiting Pickup";
      case "picked_up":
        return "Picked Up";
      case "delivering":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      default:
        return status
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  };

  // Add loading animation phases
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % 3);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <>
      <HeaderMid />
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8 px-4">
        <div className="container mx-auto relative">
          {/* Animated background elements */}
          <motion.div
            className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-primary/5 filter blur-xl"
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute bottom-40 left-[5%] w-80 h-80 rounded-full bg-success/5 filter blur-xl"
            animate={{
              y: [0, 30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1,
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 relative z-10"
          >
            <div>
              <motion.h1
                className="text-2xl md:text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <motion.div
                  className="bg-primary/10 p-2 rounded-full"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <FiTruck className="text-primary w-6 h-6 md:w-8 md:h-8" />
                </motion.div>
                Driver Dashboard
              </motion.h1>
              <motion.p
                className="text-base-content/70 mt-2 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Manage your deliveries, track routes, and update delivery
                statuses
              </motion.p>
            </div>

            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshDeliveries}
                className="btn btn-outline btn-sm gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                    }}
                  >
                    <FiRefreshCw />
                  </motion.div>
                )}
                Refresh
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/requested-deliveries"
                  className="btn btn-primary btn-sm gap-2 relative"
                >
                  <FiBell />
                  <span>Delivery Requests</span>
                  <AnimatePresence>
                    {pendingRequestsCount > 0 && (
                      <motion.div
                        className="absolute -top-2 -right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <motion.div
                          className="badge badge-sm badge-accent"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {pendingRequestsCount}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Enhanced Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-base-100 rounded-xl shadow-md p-6 border border-base-200 overflow-hidden relative"
              whileHover={{
                y: -5,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <motion.div
                className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -mr-10 -mt-10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <FiUser className="text-primary" />
                Driver Status
              </h2>

              <div className="flex items-center bg-base-200/50 p-3 rounded-lg">
                <motion.div
                  className={`w-4 h-4 rounded-full mr-3 ${
                    user?.status === "available" ? "bg-success" : "bg-info"
                  }`}
                  animate={{
                    boxShadow: [
                      `0 0 0 0 ${
                        user?.status === "available"
                          ? "rgba(34, 197, 94, 0.4)"
                          : "rgba(59, 130, 246, 0.4)"
                      }`,
                      `0 0 0 8px ${
                        user?.status === "available"
                          ? "rgba(34, 197, 94, 0)"
                          : "rgba(59, 130, 246, 0)"
                      }`,
                      `0 0 0 0 ${
                        user?.status === "available"
                          ? "rgba(34, 197, 94, 0)"
                          : "rgba(59, 130, 246, 0)"
                      }`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="font-medium">
                  {user?.status === "available"
                    ? "Available for Deliveries"
                    : "On Active Delivery"}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4 text-sm text-base-content/70">
                <div className="flex items-center gap-1">
                  <FiCalendar size={14} />
                  <span>
                    {new Date().toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <FiClock size={14} />
                  <span>
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Stats Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 grid grid-cols-2 gap-4"
            >
              {/* Quick Stats Cards */}
              <motion.div
                className="bg-base-100 rounded-xl shadow-md p-6 border border-base-200 flex flex-col items-center justify-center text-center"
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-2"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <FiPackage size={24} />
                </motion.div>
                <div className="text-3xl font-bold text-accent mb-1">
                  {activeDeliveries.length}
                </div>
                <div className="text-sm text-base-content/70">
                  Active Deliveries
                </div>
              </motion.div>

              <motion.div
                className="bg-base-100 rounded-xl shadow-md p-6 border border-base-200 flex flex-col items-center justify-center text-center"
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success mb-2"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <FiBell size={24} />
                </motion.div>
                <div className="text-3xl font-bold text-success mb-1">
                  {pendingRequestsCount}
                </div>
                <div className="text-sm text-base-content/70">New Requests</div>
              </motion.div>

              <motion.div
                className="bg-base-100 rounded-xl shadow-md p-6 border border-base-200 flex flex-col items-center justify-center text-center"
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-2"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  <FiClipboard size={24} />
                </motion.div>
                <div className="text-3xl font-bold text-warning mb-1">
                  {pendingRequestsCount}
                </div>
                <div className="text-sm text-base-content/70">
                  Pending Requests
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"
              >
                <div className="card-body p-5">
                  <div className="flex justify-between items-center">
                    <h3 className="card-title m-0 text-lg">Route Map</h3>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <FiMap className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm mt-2 text-blue-100">
                    View all your deliveries on an optimized route map
                  </p>
                  <div className="card-actions justify-end mt-3">
                    <Link
                      to="/deliveries-map"
                      className="btn btn-sm bg-white text-blue-700 hover:bg-blue-50 border-none gap-2"
                    >
                      <FiNavigation /> View Map
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Current Deliveries Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiTruck className="text-primary" />
                Current Deliveries
              </h2>

              {activeDeliveries.length > 0 && (
                <motion.div
                  className="badge badge-primary badge-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {activeDeliveries.length} Active
                </motion.div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="relative w-20 h-20 mb-4">
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <motion.div
                      className="absolute inset-4 rounded-full border-4 border-accent border-b-transparent"
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiTruck className="text-primary text-xl" />
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingPhase}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-primary-focus font-medium"
                    >
                      {
                        [
                          "Loading deliveries...",
                          "Fetching updates...",
                          "Almost ready...",
                        ][loadingPhase]
                      }
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              ) : activeDeliveries.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-base-100 rounded-xl shadow-md p-8 text-center relative overflow-hidden"
                >
                  <motion.div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-base-200"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  <div className="relative z-10">
                    <motion.div
                      className="w-20 h-20 bg-base-200 rounded-full mx-auto mb-6 flex items-center justify-center"
                      animate={{
                        y: [0, -10, 0],
                        boxShadow: [
                          "0 0 0 rgba(0,0,0,0.1)",
                          "0 10px 20px rgba(0,0,0,0.15)",
                          "0 0 0 rgba(0,0,0,0.1)",
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FiPackage className="text-base-content/30" size={36} />
                      </motion.div>
                    </motion.div>

                    <motion.h3
                      className="text-xl font-bold mb-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      No Active Deliveries
                    </motion.h3>

                    <motion.p
                      className="text-base-content/70 mb-6 max-w-md mx-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      You don't have any active deliveries at the moment. Check
                      for new delivery requests and start delivering!
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-block"
                    >
                      <Link
                        to="/requested-deliveries"
                        className="btn btn-primary gap-2"
                      >
                        <FiBell className="animate-bounce" />
                        View Delivery Requests
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="deliveries"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {activeDeliveries.map((delivery, index) => (
                    <motion.div
                      key={delivery._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`card bg-base-100 shadow-lg overflow-hidden border border-base-200 transition-all duration-300 ${
                        hoverCard === delivery._id ? "ring-2 ring-primary" : ""
                      }`}
                      whileHover={{
                        y: -5,
                        boxShadow:
                          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      }}
                      onHoverStart={() => setHoverCard(delivery._id)}
                      onHoverEnd={() => setHoverCard(null)}
                    >
                      <div className="bg-gradient-to-r from-primary to-primary-focus text-primary-content p-4 relative overflow-hidden">
                        <motion.div
                          className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />

                        <div className="flex justify-between items-center relative z-10">
                          <h3 className="font-medium flex items-center gap-2">
                            <FiClipboard size={16} />
                            Order #{delivery._id.substr(-6)}
                          </h3>
                          <motion.span
                            className="badge backdrop-blur-sm bg-white/20 gap-1"
                            animate={
                              delivery.deliveryStatus === "delivering"
                                ? { scale: [1, 1.05, 1] }
                                : {}
                            }
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            {delivery.deliveryStatus === "driver_assigned" && (
                              <FiClock size={12} />
                            )}
                            {delivery.deliveryStatus === "pickup_ready" && (
                              <FiShoppingBag size={12} />
                            )}
                            {delivery.deliveryStatus === "picked_up" && (
                              <FiCheck size={12} />
                            )}
                            {delivery.deliveryStatus === "delivering" && (
                              <FiTruck size={12} />
                            )}
                            {getStatusText(delivery.deliveryStatus)}
                          </motion.span>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        {delivery.user && (
                          <motion.div
                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-base-200/50 transition-colors"
                            whileHover={{ x: 3 }}
                          >
                            <motion.div
                              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                              whileHover={{
                                backgroundColor: "rgba(59, 130, 246, 0.2)",
                              }}
                            >
                              <FiUser className="text-primary" size={16} />
                            </motion.div>
                            <div>
                              <p className="text-sm text-base-content/70">
                                Customer
                              </p>
                              <p className="font-medium">
                                {delivery.user?.fullName || "Customer"}
                              </p>
                            </div>
                          </motion.div>
                        )}

                        <motion.div
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-base-200/50 transition-colors"
                          whileHover={{ x: 3 }}
                        >
                          <motion.div
                            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                            whileHover={{
                              backgroundColor: "rgba(59, 130, 246, 0.2)",
                            }}
                          >
                            <FiMapPin className="text-primary" size={16} />
                          </motion.div>
                          <div>
                            <p className="text-sm text-base-content/70">
                              Delivery Address
                            </p>
                            <p className="font-medium">
                              {delivery.deliveryAddress?.street},{" "}
                              {delivery.deliveryAddress?.city}
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-base-200/50 transition-colors"
                          whileHover={{ x: 3 }}
                        >
                          <motion.div
                            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                            whileHover={{
                              backgroundColor: "rgba(59, 130, 246, 0.2)",
                            }}
                          >
                            <FiPackage className="text-primary" size={16} />
                          </motion.div>
                          <div>
                            <p className="text-sm text-base-content/70">
                              Order
                            </p>
                            <p className="font-medium">
                              {delivery.quantity}x{" "}
                              {delivery.foodSale?.name || "Food Item"}
                            </p>
                            <p className="text-sm text-primary font-bold">
                              ${delivery.totalPrice?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </motion.div>

                        {delivery.specialInstructions && (
                          <motion.div
                            className="bg-warning/10 p-3 rounded-lg border border-warning/20"
                            initial={{ opacity: 0.9 }}
                            whileHover={{
                              backgroundColor: "rgba(250, 204, 21, 0.15)",
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                              >
                                <FiAlertCircle
                                  className="text-warning mt-0.5"
                                  size={16}
                                />
                              </motion.div>
                              <div>
                                <p className="text-sm font-medium text-warning-content/90 mb-1">
                                  Special Instructions
                                </p>
                                <p className="text-sm italic text-base-content/80">
                                  {delivery.specialInstructions}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-3 mt-2 border-t border-base-200">
                          <motion.div
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1"
                          >
                            <Link
                              to={`/delivery-route/${delivery._id}`}
                              className="btn btn-outline btn-sm w-full gap-2"
                            >
                              <FiNavigation /> View Route
                            </Link>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1"
                          >
                            {getActionButton(delivery)}
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Initialize driver location */}
      <DriverLocationInitializer orderId={currentOrder?._id} />

      {/* Enhanced Verification Code Modal */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="modal-box relative overflow-hidden bg-base-100 p-0 max-w-md"
            >
              {/* Top gradient banner */}
              <div
                className={`bg-gradient-to-r ${
                  actionType === "pickup"
                    ? "from-amber-500 to-amber-600"
                    : "from-green-500 to-green-600"
                } h-24 w-full relative overflow-hidden`}
              >
                <motion.div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Floating icon */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.2,
                  }}
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
                >
                  <motion.div
                    className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center ${
                      actionType === "pickup" ? "bg-amber-500" : "bg-green-500"
                    }`}
                    animate={{
                      y: [0, -5, 0],
                      boxShadow: [
                        "0 4px 6px rgba(0,0,0,0.1)",
                        "0 10px 15px rgba(0,0,0,0.2)",
                        "0 4px 6px rgba(0,0,0,0.1)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {actionType === "pickup" ? (
                      <FiShoppingBag className="text-white w-8 h-8" />
                    ) : (
                      <FiCheck className="text-white w-8 h-8" />
                    )}
                  </motion.div>
                </motion.div>
              </div>

              <div className="p-6 pt-12 text-center">
                <motion.h3
                  className="font-bold text-2xl mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Enter {actionType === "pickup" ? "Pickup" : "Delivery"} Code
                </motion.h3>
                <motion.p
                  className="text-base-content/70 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {actionType === "pickup"
                    ? "Please enter the pickup code provided by the restaurant."
                    : "Please enter the delivery code provided by the customer."}
                </motion.p>

                <motion.div
                  className="form-control w-full max-w-xs mx-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="relative">
                    <motion.input
                      type="text"
                      placeholder="Enter code"
                      className="input input-lg input-bordered w-full text-center text-2xl tracking-widest"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      autoFocus
                      animate={{
                        boxShadow:
                          verificationCode.length > 0
                            ? [
                                "0 0 0 0 rgba(59, 130, 246, 0)",
                                "0 0 0 4px rgba(59, 130, 246, 0.3)",
                                "0 0 0 0 rgba(59, 130, 246, 0)",
                              ]
                            : "none",
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className={`absolute bottom-0 left-0 h-1 bg-primary transition-all`}
                      animate={{ width: verificationCode ? "100%" : "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>

                <div className="flex justify-between items-center gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-outline flex-1"
                    onClick={() => {
                      setShowCodeModal(false);
                      setVerificationCode("");
                    }}
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`btn flex-1 ${
                      actionType === "pickup" ? "btn-warning" : "btn-success"
                    }`}
                    onClick={handleVerifyCode}
                    disabled={inProgress || !verificationCode.trim()}
                  >
                    {inProgress ? (
                      <motion.div
                        className="flex items-center gap-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <span className="loading loading-spinner loading-sm"></span>
                        <span>Verifying...</span>
                      </motion.div>
                    ) : (
                      <>
                        <span>Verify Code</span>
                      </>
                    )}
                  </motion.button>
                </div>
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
