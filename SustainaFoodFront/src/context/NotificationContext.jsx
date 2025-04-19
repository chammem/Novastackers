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

    const socket = io('http://localhost:8082', {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });
    socket.emit("join", user._id);
    socket.on("new-notification", (data) => {
      toast.info(data.message);
      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === data._id);
        return exists ? prev : [data, ...prev];
      });
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
