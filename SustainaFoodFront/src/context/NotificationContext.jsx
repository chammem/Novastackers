// src/context/NotificationContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axiosInstance from "../config/axiosInstance";
import { toast } from "react-toastify";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  console.log("NotificationProvider loaded");

  // Fetch user and notifications on mount
  useEffect(() => {
    const init = async () => {
      const res = await axiosInstance.get("/user-details");
      setUser(res.data.data);
    };
    init();
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io();
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
        user,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
