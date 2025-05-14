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
  FiTruck,
  FiShoppingBag,
  FiNavigation,
  FiRefreshCw,
  FiUser,
  FiClock,
  FiX,
  FiBell,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../config/axiosInstance";
import { socket } from "../../utils/socket";
import { toast } from "react-toastify";

const AllDeliveriesMap = () => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [actionType, setActionType] = useState("");
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  const lastLocationUpdateRef = useRef(null);
  const watchIdRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  const updateDriverLocation = useCallback(
    async (latitude, longitude) => {
      if (!user?._id) return;

      try {
        const orderId = activeDelivery?._id;

        const now = Date.now();
        if (
          lastLocationUpdateRef.current &&
          now - lastLocationUpdateRef.current < 5000
        ) {
          return;
        }

        lastLocationUpdateRef.current = now;

        await axiosInstance.post(`/driver/${user._id}/location`, {
          lat: latitude,
          lng: longitude,
          orderId: orderId,
        });

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
      } catch (err) {
        console.error("Error updating driver location:", err);
      }
    },
    [user, activeDelivery]
  );

  useEffect(() => {
    const active = deliveries.find(
      (d) => d.status !== "delivered" && d.assignedDriver === user?._id
    );

    setActiveDelivery(active);
  }, [deliveries, user]);

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
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
    };
  }, [activeDelivery]);

  useEffect(() => {
    if (!user?._id) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        updateDriverLocation(latitude, longitude);
      },
      (error) => {
        console.error("Error getting initial position:", error);
        setUserLocation([36.8065, 10.1815]);
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
      }
    };
  }, [user, updateDriverLocation]);

  const activeDeliveries = deliveries.filter(
    (del) => del.status !== "delivered"
  );

  useEffect(() => {
    if (!user?._id || !userLocation || activeDeliveries.length === 0) return;

    const intervalId = setInterval(() => {
      if (!userLocation) return;

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

      axiosInstance
        .post(`/driver/${user._id}/location`, {
          lat: userLocation[0],
          lng: userLocation[1],
        })
        .catch((err) => console.error("API update error:", err));
    }, 15000);

    return () => clearInterval(intervalId);
  }, [user, userLocation, activeDeliveries]);

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

        setMapRefreshKey((prevKey) => prevKey + 1);

        toast.success(
          `${
            actionType === "pickup" ? "Pickup" : "Delivery"
          } confirmed successfully!`
        );

        setShowVerificationModal(false);
      } else {
        setVerificationError(
          response.data?.message || "Unknown error occurred"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || `Failed to confirm ${actionType}`;
      setVerificationError(errorMessage);
    }
  };

  const refreshMap = async () => {
    if (!user || !user._id) return;
    setRefreshing(true);
    try {
      const response = await axiosInstance.get(
        `/driver/${user._id}/map-deliveries`
      );

      if (response.data.success && response.data.data) {
        setDeliveries(response.data.data);
        setMapRefreshKey((prev) => prev + 1);
        toast.success("Map refreshed with latest delivery status!");
      }
    } catch (error) {
      toast.error("Failed to refresh map data");
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <>
      <HeaderMid />
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8 px-4">
        <div className="container mx-auto relative">
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
            className="mb-10 relative z-10"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-5">
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
                  <FiMap className="text-primary w-6 h-6 md:w-8 md:h-8" />
                </motion.div>
                Delivery Route Map
              </motion.h1>

              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshMap}
                  className="btn btn-outline btn-sm gap-2"
                  disabled={refreshing}
                >
                  {refreshing ? (
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
                    to="/driver-dashboard"
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <FiArrowLeft className="mr-1" /> Back to Dashboard
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 bg-base-100 rounded-xl p-4 shadow-md border border-base-200"
            >
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-primary/10 p-2 rounded-full">
                  <FiCompass className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">Optimized Route Guide</p>
                  <p className="text-base-content/70">
                    Follow the numbered markers in sequence for the most
                    efficient route. Current location is shown in blue.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {!loading && activeDeliveries.length === 0 && deliveries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-success/10 border border-success/20 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center gap-4">
                <div className="bg-success text-white p-3 rounded-full">
                  <FiCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-success">
                    All Deliveries Completed!
                  </h2>
                  <p className="text-sm opacity-80">
                    You've finished all your assigned deliveries for today.
                  </p>
                </div>
              </div>

              <div className="stats shadow mt-4 w-full bg-white">
                <div className="stat">
                  <div className="stat-figure text-success">
                    <FiPackage size={24} />
                  </div>
                  <div className="stat-title">Completed Today</div>
                  <div className="stat-value text-success">
                    {deliveries.filter((d) => d.status === "delivered").length}
                  </div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-primary">
                    <FiTruck size={24} />
                  </div>
                  <div className="stat-title">Total Distance</div>
                  <div className="stat-value text-primary">
                    {(deliveries.filter((d) => d.status === "delivered").length *
                      2).toFixed(1)}
                    km
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-4 justify-end">
                <Link to="/requested-deliveries" className="btn btn-success gap-2">
                  <FiBell className="mr-1" /> Find New Deliveries
                </Link>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-base-100 rounded-xl shadow-lg overflow-hidden border border-base-200"
              whileHover={{
                y: -5,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div className="p-4 border-b border-base-200">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <FiNavigation className="text-primary" />
                  Your Optimized Route
                </h2>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[500px] flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="relative w-20 h-20 mb-4 mx-auto">
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
                          <FiMapPin className="text-primary text-xl" />
                        </div>
                      </div>
                      <p className="text-primary-focus font-medium">
                        Getting your location...
                      </p>
                    </div>
                  </motion.div>
                ) : activeDeliveries.length === 0 ? (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[500px] flex flex-col items-center justify-center bg-base-200/50 text-center"
                  >
                    <motion.div
                      className="w-20 h-20 bg-success text-white rounded-full flex items-center justify-center mb-6"
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
                        <FiCheck size={36} />
                      </motion.div>
                    </motion.div>

                    <motion.h3
                      className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      All Deliveries Completed!
                    </motion.h3>

                    <motion.p
                      className="text-base-content/70 mb-6 max-w-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Great job! You've completed all your assigned deliveries
                      for now. Check for new delivery requests to continue.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex gap-4"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to="/requested-deliveries"
                          className="btn btn-primary gap-2"
                        >
                          <FiBell className="mr-1" /> Find New Deliveries
                        </Link>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to="/driver-dashboard"
                          className="btn btn-outline gap-2"
                        >
                          <FiArrowLeft className="mr-1" /> Back to Dashboard
                        </Link>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="map"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[500px] relative"
                  >
                    <DriverRouteMap
                      key={`route-map-${mapRefreshKey}`}
                      driverId={user._id}
                      userLocation={userLocation}
                      deliveries={activeDeliveries}
                    />

                    {mapRefreshKey > 0 && (
                      <motion.div
                        initial={{ opacity: 1, y: -30 }}
                        animate={{ opacity: 0, y: 0 }}
                        transition={{ duration: 2 }}
                        className="absolute top-0 left-0 right-0 bg-success text-white text-center py-1 z-[1000]"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <FiCheck size={16} />
                          Map updated with latest delivery status
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 border-t border-base-200">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3">
                    <span className="badge badge-sm badge-primary gap-1">
                      <FiMapPin size={10} /> Pickups
                    </span>
                    <span className="badge badge-sm badge-secondary gap-1">
                      <FiMapPin size={10} /> Deliveries
                    </span>
                  </div>

                  <Link
                    to="/driver-dashboard"
                    className="btn btn-sm btn-ghost btn-outline gap-2"
                  >
                    <FiList size={14} /> View as List
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-base-100 rounded-xl shadow-lg overflow-hidden border border-base-200"
              whileHover={{
                y: -5,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div className="p-4 border-b border-base-200">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <FiTruck className="text-primary" />
                  Your Active Deliveries
                </h2>
              </div>

              <div className="overflow-y-auto max-h-[500px]">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-8 text-center"
                    >
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FiTruck className="text-primary text-lg" />
                        </div>
                      </div>
                      <p className="text-primary-focus font-medium">
                        Loading deliveries...
                      </p>
                    </motion.div>
                  ) : activeDeliveries.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-8 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <motion.div
                          className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-3"
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
                          <FiCheck size={24} className="text-success" />
                        </motion.div>
                        <h3 className="font-medium text-lg mb-2">All Done!</h3>
                        <p className="text-base-content/70 mb-4">
                          You've successfully completed all your deliveries.
                        </p>
                        <div className="stats shadow mt-2 bg-base-100">
                          <div className="stat">
                            <div className="stat-title">Today's Deliveries</div>
                            <div className="stat-value text-success">
                              {
                                deliveries.filter(
                                  (d) => d.status === "delivered"
                                ).length
                              }
                            </div>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="mt-6"
                        >
                          <Link
                            to="/requested-deliveries"
                            className="btn btn-primary btn-sm gap-2"
                          >
                            <FiTruck className="mr-1" /> Check for New
                            Deliveries
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      className="divide-y divide-base-200"
                    >
                      {activeDeliveries.map((delivery, index) => (
                        <motion.div
                          key={delivery._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 hover:bg-base-200 transition-colors"
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex gap-2">
                              <motion.div
                                className={`badge ${
                                  delivery.pickedUp
                                    ? "badge-secondary"
                                    : "badge-primary"
                                }`}
                                animate={
                                  delivery.pickedUp
                                    ? { scale: [1, 1.05, 1] }
                                    : {}
                                }
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                {delivery.pickedUp ? (
                                  <>
                                    <FiTruck size={10} className="mr-1" /> In
                                    Transit
                                  </>
                                ) : (
                                  <>
                                    <FiPackage size={10} className="mr-1" />{" "}
                                    Pickup
                                  </>
                                )}
                              </motion.div>
                              <div className="font-medium">
                                #
                                {delivery.orderNumber ||
                                  delivery._id.slice(-6)}
                              </div>
                            </div>
                            <div className="text-sm opacity-70">
                              {new Date(delivery.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="mb-3">
                            <h3 className="font-medium text-sm flex items-center gap-1">
                              <FiShoppingBag
                                size={12}
                                className="text-primary"
                              />
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
                            <h3 className="font-medium text-sm flex items-center gap-1">
                              <FiUser size={12} className="text-primary" />
                              {delivery.user?.fullName || "Customer"}
                            </h3>
                            <p className="text-xs opacity-70">
                              {delivery.deliveryAddress?.street},{" "}
                              {delivery.deliveryAddress?.city}
                            </p>
                          </div>

                          <div className="flex justify-between gap-2 mt-3">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className={`btn ${
                                !delivery.pickedUp
                                  ? "btn-primary"
                                  : "btn-secondary"
                              } btn-sm flex-1 gap-1`}
                              onClick={() =>
                                handleConfirmAction(
                                  delivery,
                                  delivery.pickedUp ? "delivery" : "pickup"
                                )
                              }
                            >
                              {!delivery.pickedUp ? (
                                <>
                                  <FiPackage size={12} /> Confirm Pickup
                                </>
                              ) : (
                                <>
                                  <FiHome size={12} /> Confirm Delivery
                                </>
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showVerificationModal && (
          <div className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="modal-box relative overflow-hidden bg-base-100 p-0 max-w-md"
            >
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
                      setShowVerificationModal(false);
                      setVerificationCode("");
                    }}
                  >
                    <FiX className="mr-2" /> Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`btn flex-1 ${
                      actionType === "pickup" ? "btn-warning" : "btn-success"
                    }`}
                    onClick={submitVerification}
                    disabled={!verificationCode || verificationCode.length < 4}
                  >
                    <FiCheck className="mr-2" /> Verify Code
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

export default AllDeliveriesMap;
