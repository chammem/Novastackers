import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import HeaderMid from "./HeaderMid";
import Footer from "./Footer";
import axiosInstance from "../config/axiosInstance";
import { useNotifications } from "../context/NotificationContext";

const NotificationsPage = () => {
  const { notifications, setNotifications, user } = useNotifications();
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get(`/notification?userId=${user._id}`);
      setNotifications(res.data.data || []);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axiosInstance.delete(`/notification/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Notification deleted");
    } catch {
      toast.error("Error deleting notification");
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axiosInstance.delete(`/notification/clear-all/${user._id}`);
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch {
      toast.error("Error clearing notifications");
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <>
      <HeaderMid />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>

        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500">You have no notifications.</p>
        ) : (
          <>
            <button
              className="btn btn-sm btn-error mb-4"
              onClick={clearAllNotifications}
            >
              Clear All
            </button>

            <ul className="space-y-3">
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className="flex justify-between items-center bg-base-100 shadow px-4 py-2 rounded"
                >
                  <span>{n.message}</span>
                  <button
                    className="btn btn-xs btn-outline btn-error"
                    onClick={() => deleteNotification(n._id)}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default NotificationsPage;
