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
      // Get the current user ID first
      const userRes = await axiosInstance.get("/user-details");
      const volunteerId = userRes.data.data._id;
      
      // Then include it in the request body
      await axiosInstance.patch(`/donations/accept-assignment/${foodId}`, {
        volunteerId: volunteerId
      });
      toast.success("Assignment accepted");
      fetchRequested();
    } catch (err) {
      console.error("Accept error:", err);
      toast.error("Error accepting assignment");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (foodId) => {
    setProcessingId(foodId);
    try {
      // Get the current user ID first
      const userRes = await axiosInstance.get("/user-details");
      const volunteerId = userRes.data.data._id;
      
      // Then include it in the request body
      await axiosInstance.patch(`/donations/decline-assignment/${foodId}`, {
        volunteerId: volunteerId
      });
      toast.info("Assignment declined");
      fetchRequested();
    } catch (err) {
      console.error("Decline error:", err);
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
        className="min-h-screen bg-gradient-to-br from-green-50 to-white py-10 px-4 relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-40 right-10 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Creative Header with visual impact */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 relative bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl overflow-hidden shadow-lg"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute right-0 bottom-0 w-80 h-80 bg-white rounded-full transform translate-x-1/3 translate-y-1/3"></div>
              <div className="absolute right-20 top-10 w-16 h-16 bg-white rounded-full"></div>
              <div className="absolute left-20 top-20 w-24 h-24 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FiClock className="text-white h-6 w-6" />
                  </div>
                  Assignment Requests
                </h1>
                <p className="text-green-50 mt-1 max-w-xl">
                  Review and manage food delivery opportunities. Each assignment helps connect surplus food with those in need.
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchRequested}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg shadow hover:bg-white/30 transition-colors flex items-center gap-2 font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </motion.button>
            </div>
          </motion.div>

          {/* Enhanced Tabs */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex p-1 rounded-xl bg-gray-100 shadow-md">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`py-2 px-5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === "items" 
                    ? 'bg-white text-green-700 shadow-md' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab("items")}
              >
                <FiPackage /> Individual Items
                {requestedFoods.length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full font-bold">
                    {requestedFoods.length}
                  </span>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`py-2 px-5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === "batches" 
                    ? 'bg-white text-green-700 shadow-md' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab("batches")}
              >
                <FiLayers /> Batch Assignments
                {requestedBatches.length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full font-bold">
                    {requestedBatches.length}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-green-200 border-t-green-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {activeTab === "items" ? (
                    <FiPackage className="w-8 h-8 text-green-600" />
                  ) : (
                    <FiLayers className="w-8 h-8 text-green-600" />
                  )}
                </div>
              </div>
              <p className="mt-6 text-gray-600 font-medium">Loading assignment requests...</p>
            </motion.div>
          ) : activeTab === "items" ? (
            // Individual food items tab - Empty State
            requestedFoods.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-lg max-w-md mx-auto text-center p-10 border border-gray-100"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-24 h-24 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6"
                >
                  <FiPackage className="w-12 h-12 text-gray-300" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-3 text-gray-800">No Item Requests</h2>
                <p className="text-gray-600 mb-6 max-w-xs mx-auto">
                  You don't have any individual food item requests at the moment.
                </p>
                <div className="w-32 h-1 bg-gradient-to-r from-green-300 to-green-500 mx-auto rounded-full"></div>
              </motion.div>
            ) : (
              // Individual food items tab - With Items
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requestedFoods.map((food, index) => (
                    <motion.div
                      key={food._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                      className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 group"
                    >
                      <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h2 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                            {food.name || "Unnamed Donation"}
                          </h2>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Requested</span>
                        </div>

                        <div className="space-y-3 mt-4 mb-6">
                          {food.category && (
                            <div className="flex items-center text-gray-600">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                <FiBox className="w-4 h-4 text-gray-500" />
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Category</span>
                                <p className="font-medium">{food.category}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center text-gray-600">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                              <FiPackage className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Quantity</span>
                              <p className="font-medium">{food.quantity || "Not specified"}</p>
                            </div>
                          </div>

                          {food.buisiness_id && (
                            <div className="flex items-center text-gray-600">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                <FiMapPin className="w-4 h-4 text-gray-500" />
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Source</span>
                                <p className="font-medium truncate max-w-[200px]">
                                  {food.buisiness_id?.fullName ||
                                    food.buisiness_id?.organizationName ||
                                    "Business"}
                                </p>
                                {food.address && <p className="text-xs text-gray-500 mt-0.5">{food.address}</p>}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 mt-6">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1 font-medium"
                            onClick={() => handleDecline(food._id)}
                            disabled={processingId === food._id}
                          >
                            {processingId === food._id ? (
                              <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <FiX className="mr-1" />
                            )}
                            Decline
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 font-medium"
                            onClick={() => handleAccept(food._id)}
                            disabled={processingId === food._id}
                          >
                            {processingId === food._id ? (
                              <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
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
          ) : (
            // Batches tab - Empty State or With Items
            requestedBatches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-lg max-w-md mx-auto text-center p-10 border border-gray-100"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-24 h-24 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6"
                >
                  <FiLayers className="w-12 h-12 text-gray-300" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-3 text-gray-800">No Batch Requests</h2>
                <p className="text-gray-600 mb-6 max-w-xs mx-auto">
                  You don't have any batch assignment requests at the moment.
                </p>
                <div className="w-32 h-1 bg-gradient-to-r from-green-300 to-green-500 mx-auto rounded-full"></div>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-8">
                  {requestedBatches.map((batch, index) => (
                    <motion.div
                      key={batch._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ y: -3 }}
                      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden group"
                    >
                      <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                      
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <FiLayers className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                                Batch Assignment
                              </h3>
                              <div className="flex gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                  {batch.items.length} items
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  batch.requiredCapacity === "large"
                                    ? "bg-amber-100 text-amber-800"
                                    : batch.requiredCapacity === "medium"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {batch.requiredCapacity} capacity
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100 mb-6">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <FiAlertCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-blue-800">
                            This batch requires <span className="font-semibold">{batch.requiredCapacity}</span> transport
                            capacity. Please ensure your vehicle is suitable before accepting.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                              <FiPackage className="w-3 h-3 text-gray-500" />
                            </div>
                            Items in this batch
                          </h4>
                          
                          <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-100 text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Item</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Business</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Size</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {batch.items.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-100 transition-colors">
                                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{item.name}</td>
                                      <td className="px-4 py-3 text-sm text-gray-600">{item.buisiness_id?.fullName}</td>
                                      <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                                      <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                                          {item.size}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end mt-6">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-5 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium"
                            onClick={() => handleDeclineBatch(batch._id)}
                            disabled={processingId === batch._id}
                          >
                            {processingId === batch._id ? (
                              <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <FiX className="w-4 h-4" />
                            )}
                            Decline Batch
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
                            onClick={() => handleAcceptBatch(batch._id)}
                            disabled={processingId === batch._id}
                          >
                            {processingId === batch._id ? (
                              <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <FiCheck className="w-4 h-4" />
                            )}
                            Accept Batch
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )
          )}
        </div>
      </motion.div>

      <Footer />
    </>
  );
};

export default RequestedAssignments;
