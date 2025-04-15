import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage,
  FiClock,
  FiCheck,
  FiX,
  FiMapPin,
  FiBox,
  FiLayers,
  FiAlertCircle,
} from "react-icons/fi";

const RequestedAssignments = () => {
  const [requestedFoods, setRequestedFoods] = useState([]);
  const [requestedBatches, setRequestedBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState("items"); // "items" or "batches"

  const fetchRequested = async () => {
    try {
      setLoading(true);
      const userRes = await axiosInstance.get("/user-details");
      const volunteerId = userRes.data.data._id;

      // Fetch both individual items and batches
      const [foodRes, batchRes] = await Promise.all([
        axiosInstance.get(`/volunteer/${volunteerId}/assignments`),
        axiosInstance.get(`donations/${volunteerId}/batch-assignments`),
      ]);

      // Process batches first
      const pendingBatches = batchRes.data.filter(
        (b) => b.status === "requested" && b.assignmentStatus === "pending"
      );
      setRequestedBatches(pendingBatches);

      // Create a Set of item IDs that are in batches
      const batchItemIds = new Set();
      pendingBatches.forEach((batch) => {
        if (Array.isArray(batch.items)) {
          batch.items.forEach((item) => {
            // Handle both cases: if item is an object or just an ID string
            const itemId = typeof item === "object" ? item._id : item;
            batchItemIds.add(itemId);
          });
        }
      });

      console.log(`Found ${batchItemIds.size} items in batches to filter out`);

      // Filter pending foods to exclude those in batches
      const allPendingFoods = foodRes.data.filter(
        (f) => f.status === "requested" && f.assignmentStatus === "pending"
      );

      const filteredFoods = allPendingFoods.filter((food) => {
        const isInBatch = batchItemIds.has(food._id);
        return !isInBatch;
      });

      console.log(
        `Filtered ${
          allPendingFoods.length - filteredFoods.length
        } items that are in batches`
      );
      setRequestedFoods(filteredFoods);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequested();
  }, []);

  // Food item handlers
  const handleAccept = async (foodId) => {
    setProcessingId(foodId);
    try {
      await axiosInstance.patch(`/donations/accept-assignment/${foodId}`,{
        volunteerId: user._id // Send volunteer ID from context
      });
      toast.success("Assignment accepted");
      fetchRequested();
    } catch (err) {
      toast.error("Error accepting assignment");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (foodId) => {
    setProcessingId(foodId);
    try {
      await axiosInstance.patch(`/donations/decline-assignment/${foodId}`,{
        volunteerId: user._id // Send volunteer ID from context
      });
      toast.info("Assignment declined");
      fetchRequested();
    } catch (err) {
      toast.error("Error declining assignment");
    } finally {
      setProcessingId(null);
    }
  };

  // Batch handlers
  const handleAcceptBatch = async (batchId) => {
    setProcessingId(batchId);
    try {
      // Get the current user ID from the stored data or state
      const userRes = await axiosInstance.get("/user-details");
      const volunteerId = userRes.data.data._id;

      // Include volunteerId in the request body
      await axiosInstance.patch(
        `/donations/accept-batch-assignment/${batchId}`,
        {
          volunteerId: volunteerId,
        }
      );

      toast.success("Batch assignment accepted");
      fetchRequested();
    } catch (err) {
      toast.error("Error accepting batch assignment");
      console.error("Accept error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineBatch = async (batchId) => {
    setProcessingId(batchId);
    try {
      // Get the current user ID from the stored data or state
      const userRes = await axiosInstance.get("/user-details");
      const volunteerId = userRes.data.data._id;

      // Include volunteerId in the request body
      await axiosInstance.patch(
        `/donations/decline-batch-assignment/${batchId}`,
        {
          volunteerId: volunteerId,
        }
      );

      toast.info("Batch assignment declined");
      fetchRequested();
    } catch (err) {
      toast.error("Error declining batch assignment");
      console.error("Decline error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <HeaderMid />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-base-200 py-10 px-4"
      >
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
                <FiClock className="text-primary" />
                Assignment Requests
              </h1>
              <p className="text-base-content/70 mt-1">
                Accept or decline food delivery assignments
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={fetchRequested}
              className="btn btn-sm btn-outline"
            >
              Refresh
            </motion.button>
          </motion.div>

          {/* Tabs */}
          <div className="tabs tabs-boxed bg-base-100 mb-6 inline-flex">
            <button
              className={`tab gap-2 ${
                activeTab === "items" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("items")}
            >
              <FiPackage /> Individual Items
              {requestedFoods.length > 0 && (
                <span className="badge badge-sm badge-primary">
                  {requestedFoods.length}
                </span>
              )}
            </button>
            <button
              className={`tab gap-2 ${
                activeTab === "batches" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("batches")}
            >
              <FiLayers /> Batch Assignments
              {requestedBatches.length > 0 && (
                <span className="badge badge-sm badge-primary">
                  {requestedBatches.length}
                </span>
              )}
            </button>
          </div>

          {/* Content Section */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
              <p className="text-base-content/70">
                Loading assignment requests...
              </p>
            </motion.div>
          ) : activeTab === "items" ? (
            // Individual food items tab
            requestedFoods.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="card bg-base-100 shadow-lg max-w-md mx-auto text-center p-8"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center">
                    <FiPackage className="w-8 h-8 text-base-content/50" />
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-2">
                  No Item Requests Available
                </h2>
                <p className="text-base-content/70 mb-6">
                  There are no individual food item requests at the moment.
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requestedFoods.map((food, index) => (
                    <motion.div
                      key={food._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ y: -3 }}
                      className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-300"
                    >
                      <div className="card-body p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h2 className="card-title text-lg">
                            {food.name || "Unnamed Donation"}
                          </h2>
                          <div className="badge badge-primary">Requested</div>
                        </div>

                        <div className="space-y-2 mt-2 mb-4">
                          {food.category && (
                            <div className="flex items-center gap-2 text-sm">
                              <FiBox className="text-base-content/70" />
                              <span className="text-base-content/70">
                                Category:
                              </span>
                              <span className="font-medium">
                                {food.category}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <FiPackage className="text-base-content/70" />
                            <span className="text-base-content/70">
                              Quantity:
                            </span>
                            <span className="font-medium">
                              {food.quantity || "Not specified"}
                            </span>
                          </div>

                          {food.buisiness_id && (
                            <div className="flex items-center gap-2 text-sm">
                              <FiMapPin className="text-base-content/70" />
                              <span className="text-base-content/70">
                                From:
                              </span>
                              <span className="font-medium truncate">
                                {food.buisiness_id?.fullName ||
                                  food.buisiness_id?.organizationName ||
                                  "Business"}
                              </span>
                            </div>
                          )}

                          {food.address && (
                            <div className="text-sm mt-1 pl-5 text-base-content/70">
                              <span>{food.address}</span>
                            </div>
                          )}
                        </div>

                        <div className="divider my-2"></div>

                        <div className="flex gap-2 justify-between">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-sm btn-error flex-1"
                            onClick={() => handleDecline(food._id)}
                            disabled={processingId === food._id}
                          >
                            {processingId === food._id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <FiX className="mr-1" />
                            )}
                            Decline
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-sm btn-success flex-1"
                            onClick={() => handleAccept(food._id)}
                            disabled={processingId === food._id}
                          >
                            {processingId === food._id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <FiCheck className="mr-1" />
                            )}
                            Accept
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )
          ) : // Batches tab
          requestedBatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="card bg-base-100 shadow-lg max-w-md mx-auto text-center p-8"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center">
                  <FiLayers className="w-8 h-8 text-base-content/50" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">
                No Batch Requests Available
              </h2>
              <p className="text-base-content/70 mb-6">
                There are no batch assignment requests at the moment.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-6">
                {requestedBatches.map((batch, index) => (
                  <motion.div
                    key={batch._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="card bg-base-100 shadow-lg border border-base-300 overflow-hidden"
                  >
                    <div className="card-body">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <h3 className="card-title text-lg">
                          <span className="flex items-center gap-2">
                            <FiLayers className="text-primary" />
                            Batch Assignment
                          </span>
                          <div className="badge badge-primary">
                            {batch.items.length} items
                          </div>
                          <div
                            className={`badge ${
                              batch.requiredCapacity === "large"
                                ? "badge-warning"
                                : batch.requiredCapacity === "medium"
                                ? "badge-info"
                                : "badge-success"
                            }`}
                          >
                            {batch.requiredCapacity} capacity
                          </div>
                        </h3>
                      </div>

                      <div className="mt-4 alert alert-info">
                        <FiAlertCircle />
                        <span>
                          This batch requires {batch.requiredCapacity} transport
                          capacity.
                        </span>
                      </div>

                      <div className="divider my-2">Items in this batch</div>

                      <div className="overflow-x-auto">
                        <table className="table table-compact w-full">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Business</th>
                              <th>Category</th>
                              <th>Size</th>
                            </tr>
                          </thead>
                          <tbody>
                            {batch.items.map((item) => (
                              <tr key={item._id} className="hover:bg-base-200">
                                <td>{item.name}</td>
                                <td>{item.buisiness_id?.fullName}</td>
                                <td>{item.category}</td>
                                <td>
                                  <span className="badge badge-outline badge-info">
                                    {item.size}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="divider my-2"></div>

                      <div className="flex gap-4 justify-end mt-4">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-error"
                          onClick={() => handleDeclineBatch(batch._id)}
                          disabled={processingId === batch._id}
                        >
                          {processingId === batch._id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <FiX className="mr-1" />
                          )}
                          Decline Batch
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-success"
                          onClick={() => handleAcceptBatch(batch._id)}
                          disabled={processingId === batch._id}
                        >
                          {processingId === batch._id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <FiCheck className="mr-1" />
                          )}
                          Accept Batch
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      <Footer />
    </>
  );
};

export default RequestedAssignments;
