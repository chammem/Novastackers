import { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { socket } from "../../utils/socket";

const DriverLocationInitializer = ({ orderId }) => {
  const { user } = useAuth();
  const [locationStatus, setLocationStatus] = useState("idle");

  const updateLocation = async (latitude, longitude) => {
    if (!user?._id || !latitude || !longitude) return;

    try {
      // First update via API for persistence
      await axiosInstance.post(`/driver/${user._id}/location`, {
        lat: latitude,
        lng: longitude,
        orderId: orderId,
      });

      // Then emit via socket for real-time updates
      // This ensures immediate updates even if API call is slow
      if (orderId) {
        socket.emit("driver-location-update", {
          driverId: user._id,
          orderId: orderId,
          location: { lat: latitude, lng: longitude },
          timestamp: new Date(),
        });
      }

      console.log("Location updated:", { lat: latitude, lng: longitude });
    } catch (err) {
      console.error("Error updating location:", err);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "driver") return;

    const initializeLocation = async () => {
      try {
        setLocationStatus("getting");

        // Get current position from browser
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              await updateLocation(latitude, longitude);
              setLocationStatus("success");
              console.log("Driver location initialized:", {
                lat: latitude,
                lng: longitude,
              });
            } catch (err) {
              console.error("Error sending location to server:", err);
              setLocationStatus("failed");
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setLocationStatus("failed");
          },
          { enableHighAccuracy: true }
        );

        // Set up continuous tracking
        const watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              await updateLocation(latitude, longitude);
            } catch (err) {
              console.error("Error updating location:", err);
            }
          },
          (error) => {
            console.error("Geolocation tracking error:", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000, // Update if position is older than 10 seconds
          }
        );

        // Clean up when component unmounts
        return () => {
          if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            console.log("Location tracking stopped");
          }
        };
      } catch (err) {
        console.error("Location initialization error:", err);
        setLocationStatus("failed");
      }
    };

    initializeLocation();
  }, [user, orderId]);

  // This component doesn't render any UI
  return null;
};

export default DriverLocationInitializer;
