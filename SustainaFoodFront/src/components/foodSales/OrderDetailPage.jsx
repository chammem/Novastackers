import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiClock,
  FiCheck,
  FiX,
  FiPackage,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiAlertCircle,
  FiUser,
} from "react-icons/fi";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import HeaderMid from "../HeaderMid";
import axiosInstance from "../../config/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import OrderTrackingMap from "../customer/OrderTrackingMap";
import React from 'react'; // Ensure this is the correct import
import { useLocation } from "react-router-dom"; // Import useLocation if needed
const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast.error("Please log in to view order details");
        navigate("/login");
        return;
      }
      fetchOrderDetails();
    }
  }, [isAuthenticated, isLoading, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(`/orders/${orderId}`);

      // Debug log to see the actual order data
      console.log("Order details raw:", response.data);
      
      if (!response.data || !response.data.success || !response.data.data) {
        setError("Order not found or no data available");
        setLoading(false);
        return;
      }

      // Extract the actual order data from the nested structure
      const orderData = response.data.data;
      console.log("Order status:", orderData.status);

      // Normalize the status field to handle inconsistencies
      if (orderData.status) {
        orderData.status = orderData.status.toLowerCase().trim();
      }

      setOrder(orderData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details. Please try again.");
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    // Normalize status to handle case and whitespace differences
    const normalizedStatus = status?.toLowerCase().trim();

    console.log("Checking status:", normalizedStatus); // Debug log

    // Handle various status values
    switch (normalizedStatus) {
      case "pending":
        return 0;
      case "paid":
      case "payment_completed":
      case "processed":
      case "completed":
        return 1; // All payment-related statuses return 1
      case "fulfilled":
      case "delivered":
      case "complete":
        return 2;
      case "cancelled":
      case "canceled":
        return -1;
      default:
        return 0;
    }
  };

  const formatDate = (dateString) => {
    try {
      // Handle both ISO strings and raw Date objects
      if (!dateString) return "No date available";

      // If it's already a Date object
      if (dateString instanceof Date) {
        return format(dateString, "MMM dd, yyyy • h:mm a");
      }

      // Try parsing as ISO
      const date = parseISO(dateString);
      if (isNaN(date.getTime())) {
        // Try alternative date parsing if ISO parsing fails
        const fallbackDate = new Date(dateString);
        if (isNaN(fallbackDate.getTime())) {
          return "Invalid Date";
        }
        return format(fallbackDate, "MMM dd, yyyy • h:mm a");
      }

      return format(date, "MMM dd, yyyy • h:mm a");
    } catch (err) {
      console.error("Date formatting error:", err, "for date:", dateString);
      return "Invalid Date";
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  return (
    <>
      <HeaderMid />
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        className="container mx-auto px-4 py-8"
      >
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate("/orders")}
            className="btn btn-ghost btn-circle mr-4"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error shadow-lg">
            <div>
              <FiAlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        ) : !order ? (
          <div className="text-center py-12">
            <div className="text-3xl text-gray-400 mb-4">
              <FiPackage className="mx-auto" size={48} />
            </div>
            <h3 className="text-lg font-medium mb-2">Order not found</h3>
            <p className="text-sm text-gray-500 mb-4">
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/orders/my-orders" className="btn btn-primary">
              View My Orders
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card bg-base-100 shadow-lg mb-8">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Order Status</h2>

                  {/* Add this right before the steps to verify the status */}
                  <div className="text-xs text-gray-400 mb-2">
                    Debug - Status: {order.status}, Step Value: {getStatusStep(order.status)}
                  </div>

                  {order.status === "cancelled" ? (
                    <div className="alert alert-error mb-6">
                      <FiX size={20} />
                      <span>This order has been cancelled.</span>
                    </div>
                  ) : (
                    <ul className="steps steps-vertical lg:steps-horizontal w-full">
                      <li
                        className={`step ${
                          getStatusStep(order.status) >= 0 ? "step-primary" : ""
                        }`}
                      >
                        Order Placed
                      </li>
                      <li
                        className={`step ${
                          getStatusStep(order.status) >= 1 ? "step-primary" : ""
                        }`}
                      >
                        Payment Completed
                      </li>
                      <li
                        className={`step ${
                          getStatusStep(order.status) >= 2 ? "step-primary" : ""
                        }`}
                      >
                        Order Fulfilled
                      </li>
                    </ul>
                  )}

                  <div className="mt-8">
                    <h3 className="font-semibold text-lg mb-3">
                      Order Timeline
                    </h3>
                    <div className="relative pl-8 border-l-2 border-base-300">
                      <div className="mb-6 relative">
                        <div className="absolute -left-[25px] p-1 rounded-full bg-primary">
                          <FiClock className="text-white" size={16} />
                        </div>
                        <h4 className="font-medium">Order Created</h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      {order.status !== "pending" && (
                        <div className="mb-6 relative">
                          <div className="absolute -left-[25px] p-1 rounded-full bg-primary">
                            <FiCheck className="text-white" size={16} />
                          </div>
                          <h4 className="font-medium">Payment Completed</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.updatedAt)}
                          </p>
                        </div>
                      )}

                      {order.status === "fulfilled" && (
                        <div className="mb-6 relative">
                          <div className="absolute -left-[25px] p-1 rounded-full bg-primary">
                            <FiPackage className="text-white" size={16} />
                          </div>
                          <h4 className="font-medium">Order Fulfilled</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.updatedAt)}
                          </p>
                        </div>
                      )}

                      {order.status === "cancelled" && (
                        <div className="mb-6 relative">
                          <div className="absolute -left-[25px] p-1 rounded-full bg-error">
                            <FiX className="text-white" size={16} />
                          </div>
                          <h4 className="font-medium">Order Cancelled</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.updatedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card bg-base-100 shadow-lg mb-8">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{order._id}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Item:</span>
                      <span>
                        {order.foodSale?.foodItem?.name || "Food Item"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span>{order.quantity}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per unit:</span>
                      <span>${order.unitPrice?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${order.totalPrice?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title text-xl mb-4">
                    Delivery Information
                  </h2>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <FiMapPin className="mt-1 text-primary" />
                      <div>
                        <h4 className="font-medium">Delivery Address</h4>
                        <p className="text-sm">
                          {order.deliveryAddress?.street}
                          <br />
                          {order.deliveryAddress?.city},{" "}
                          {order.deliveryAddress?.state}{" "}
                          {order.deliveryAddress?.zipCode}
                          <br />
                          {order.deliveryAddress?.country}
                        </p>
                      </div>
                    </div>

                    {order.specialInstructions && (
                      <div className="mt-4">
                        <h4 className="font-medium">Special Instructions</h4>
                        <p className="text-sm mt-1 bg-base-200 p-2 rounded">
                          {order.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Driver Tracking Section - only when driver is assigned and delivery is active */}
              {order &&
                order.assignedDriver &&
                [
                  "driver_assigned",
                  "pickup_ready",
                  "picked_up",
                  "delivering",
                ].includes(order.deliveryStatus) && (
                  <div className="card bg-base-100 shadow-lg mt-6">
                    <div className="card-body">
                      <h2 className="card-title text-xl mb-4 flex items-center">
                        <FiMapPin className="mr-2 text-primary" /> Live Delivery
                        Tracking
                      </h2>

                      <div className="mb-4">
                        <OrderTrackingMap orderId={orderId} />
                      </div>

                      <div className="flex items-center justify-between bg-base-200 rounded-lg p-3 mt-4">
                        <div className="flex items-center">
                          <div className="avatar mr-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                              <FiUser />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">
                              {order.driverDetails?.name || "Your Driver"}
                            </div>
                            {order.driverDetails?.phone && (
                              <div className="text-sm text-gray-600">
                                {order.driverDetails.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="badge badge-primary">
                            {order.deliveryStatus === "driver_assigned" &&
                              "Assigned"}
                            {order.deliveryStatus === "pickup_ready" &&
                              "At Restaurant"}
                            {order.deliveryStatus === "picked_up" &&
                              "Order Picked Up"}
                            {order.deliveryStatus === "delivering" &&
                              "On The Way"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
        {order &&
          console.log("Date formats:", {
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            typeCreatedAt: typeof order.createdAt,
            typeUpdatedAt: typeof order.updatedAt,
          })}
      </motion.div>
    </>
  );
};

export default OrderDetailPage;
