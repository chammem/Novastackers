import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import HeaderMid from "./HeaderMid";
import Footer from "./Footer";
import axiosInstance from "../config/axiosInstance";
import { useNotifications } from "../context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiTrash2, FiAlertCircle, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const NotificationsPage = () => {
  const { notifications, setNotifications } = useNotifications();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);

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
      setConfirmClear(false);
    } catch {
      toast.error("Error clearing notifications");
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const groups = {};
    if (!notifications) return groups;

    notifications.forEach((notification) => {
      const date = new Date(notification.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    return groups;
  };

  // Load notifications when component mounts
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        if (user?._id) {
          // Fetch notifications directly instead of using a non-existent function
          const response = await axiosInstance.get(
            `/notification?userId=${user._id}`
          );
          setNotifications(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user, setNotifications]);

  const groupedNotifications = groupNotificationsByDate();

  return (
    <>
      <HeaderMid />
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Rest of your component remains the same */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            className="text-3xl font-bold flex items-center gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FiBell className="text-primary" /> Notifications
          </motion.h1>

          {notifications?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <button
                className="btn btn-error btn-outline gap-2"
                onClick={() => setConfirmClear(true)}
              >
                <FiTrash2 /> Clear All
              </button>
            </motion.div>
          )}
        </div>

        {/* Confirmation modal */}
        {confirmClear && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className="font-bold text-lg mb-4">
                Clear all notifications?
              </h3>
              <p className="mb-6">This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-outline"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-error"
                  onClick={clearAllNotifications}
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-64 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FiAlertCircle className="w-16 h-16 text-base-300 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Notifications</h2>
            <p className="text-base-content/70">
              You don't have any notifications at the moment.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {Object.entries(groupedNotifications).map(
                ([date, dateNotifications]) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                  >
                    <div className="divider text-sm text-base-content/60 font-medium">
                      {date}
                    </div>

                    <ul className="space-y-3">
                      {dateNotifications.map((notification) => (
                        <motion.li
                          key={notification._id}
                          className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0 }}
                          transition={{ duration: 0.3 }}
                          layout
                        >
                          <div className="card-body p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-base">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-base-content/50 mt-2">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleTimeString()}
                                </p>
                              </div>
                              <button
                                className="btn btn-circle btn-sm btn-ghost hover:bg-error/20 hover:text-error"
                                onClick={() =>
                                  deleteNotification(notification._id)
                                }
                                title="Delete notification"
                              >
                                <FiX />
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default NotificationsPage;
