import React, { useState, useEffect } from "react";
import MapView2 from "../MapView2";
import { motion, AnimatePresence } from "framer-motion";
import { FiMapPin, FiBox, FiHome, FiInfo, FiNavigation } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext"; // Import auth context

const RouteDetails = ({ food, destinationUser, userLocation }) => {
  const { user } = useAuth(); // Get current user
  const isPickup = food.status === "assigned" || food.status === "pending";
  const [transportMode, setTransportMode] = useState("driving-car");
  const destinationAvailable =
    destinationUser?.lat !== undefined && destinationUser?.lng !== undefined;

  // Transport mode options with icons
  const transportOptions = [
    { value: "driving-car", label: "Car", emoji: "🚗" },
    { value: "cycling-regular", label: "Bike", emoji: "🚲" },
    { value: "foot-walking", label: "Walking", emoji: "🚶" },
    { value: "cycling-electric", label: "Scooter", emoji: "🛵" },
  ];

  // Map user transport type to route transport mode on component mount
  useEffect(() => {
    if (user?.transportType) {
      switch (user.transportType) {
        case "walking":
          setTransportMode("foot-walking");
          break;
        case "bicycle":
          setTransportMode("cycling-regular");
          break;
        case "motor":
          setTransportMode("cycling-electric");
          break;
        case "car":
        case "truck":
          setTransportMode("driving-car");
          break;
        default:
          // Keep default "driving-car"
          break;
      }
      console.log(`Set transport mode to ${transportMode} based on user preference: ${user.transportType}`);
    }
  }, [user]);

  // Get status badge color based on food status
  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "badge-info";
      case "picked-up":
        return "badge-warning";
      case "delivered":
        return "badge-success";
      case "pending":
        return "badge-secondary";
      default:
        return "badge-neutral";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto py-6 px-4"
    >
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold">
            {isPickup ? "Pickup Route" : "Delivery Route"}
          </h1>
          <p className="text-base-content/70 mt-1">
            View the optimal route to your destination
          </p>
        </motion.div>

        <div className="card bg-base-100 shadow-lg overflow-hidden">
          {/* Info Tabs */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="card-body"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Food Information Card */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="rounded-lg border border-base-300 p-4"
              >
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <FiBox size={20} />
                  <h3 className="text-lg font-semibold">Food Information</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Name:</span>
                    <span className="font-medium">{food.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Quantity:</span>
                    <span className="font-medium">{food.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Category:</span>
                    <span className="font-medium">
                      {food.category || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">Status:</span>
                    <span className={`badge ${getStatusColor(food.status)}`}>
                      {food.status}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Destination Information Card */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="rounded-lg border border-base-300 p-4"
              >
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <FiHome size={20} />
                  <h3 className="text-lg font-semibold">Destination</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Name:</span>
                    <span className="font-medium">
                      {destinationUser?.fullName ||
                        destinationUser?.organizationName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Address:</span>
                    <span className="font-medium text-right">
                      {destinationUser?.address}
                    </span>
                  </div>
                  {destinationUser?.phone && (
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Phone:</span>
                      <span className="font-medium">
                        {destinationUser.phone}
                      </span>
                    </div>
                  )}
                  {!destinationAvailable && (
                    <div className="alert alert-warning mt-2">
                      <FiInfo />
                      <span>Location coordinates not available</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Transport Mode Section */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <FiNavigation className="text-primary" size={20} />
                <h3 className="text-lg font-semibold">
                  Transport Mode
                  {user?.transportType && (
                    <span className="ml-2 text-sm font-normal text-base-content/60">
                      (Default: {user.transportType})
                    </span>
                  )}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {transportOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileTap={{ scale: 0.95 }}
                    className={`btn btn-outline ${
                      transportMode === option.value ? "btn-primary" : ""
                    }`}
                    onClick={() => setTransportMode(option.value)}
                  >
                    <span className="mr-2">{option.emoji}</span>
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Map Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full h-80 sm:h-96 md:h-[500px] relative"
          >
            {destinationAvailable ? (
              <div className="h-full w-full overflow-hidden rounded-b-lg">
                <MapView2
                  destination={[destinationUser.lat, destinationUser.lng]}
                  transportMode={transportMode}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-base-200">
                <div className="avatar">
                  <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center">
                    <FiMapPin size={24} className="text-base-content/50" />
                  </div>
                </div>
                <p className="mt-4 text-lg font-medium">
                  Destination coordinates not available
                </p>
                <p className="text-base-content/70">
                  Please ensure the destination has a valid location
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Back button or additional actions could go here */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex justify-center mt-6"
        >
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline btn-primary"
          >
            Back to Assignments
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RouteDetails;
