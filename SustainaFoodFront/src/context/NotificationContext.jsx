// src/context/NotificationContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axiosInstance from "../config/axiosInstance";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth(); // use user from AuthContext
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io();
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      // Log when user joins their room
      console.log(`📣 User ${user._id} joining socket room`);
    });

    socket.emit("join", user._id);

    socket.on("new-notification", (data) => {
      // Add detailed logging
      console.log("📬 Received notification via socket:", data);

      // Check if message exists before showing toast
      if (data && data.message) {
        toast.info(data.message);

        // Log the type for driver notifications
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
    });

    axiosInstance.get(`/notification?userId=${user._id}`).then((res) => {
      setNotifications(res.data.data || []);
    });

    return () => socket.disconnect();
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
