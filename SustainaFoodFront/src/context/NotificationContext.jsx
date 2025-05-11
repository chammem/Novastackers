// src/context/NotificationContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../utils/socket"; // Import the shared socket
import axiosInstance from "../config/axiosInstance";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?._id) return;

    // Log when user joins their room
    console.log(`📣 User ${user._id} joining notification room`);
    
    // Join the user's notification room
    socket.emit("join", user._id);

    // Setup notification listener
    const handleNewNotification = (data) => {
      console.log("📬 Received notification via socket:", data);

      if (data && data.message) {
        toast.info(data.message);

        if (data.type === 'assignment-request') {
          console.log("🚚 Driver assignment notification received");
        }

        setNotifications((prev) => {
          const exists = prev.some((n) => n._id === data._id);
          return exists ? prev : [data, ...prev];
        });
      } else {
        console.error("Received notification without message:", data);
      }
    };

    // Attach the event listener
    socket.on("new-notification", handleNewNotification);

    // Fetch existing notifications
    axiosInstance.get(`/notification?userId=${user._id}`).then((res) => {
      setNotifications(res.data.data || []);
    });

    // Clean up event listener - BUT DON'T DISCONNECT
    return () => {
      socket.off("new-notification", handleNewNotification);
      console.log("🧹 Cleaned up notification listener");
    };
  }, [user?._id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
