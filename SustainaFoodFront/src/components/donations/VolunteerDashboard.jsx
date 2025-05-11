import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import IndividualItemsList from "./IndividualItemsList";
import BatchesList from "./BatchesList";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage,
  FiTruck,
  FiCheck,
  FiSearch,
  FiFilter,
  FiRefreshCw,
} from "react-icons/fi";

const VolunteerDashboard = () => {
  const [user, setUser] = useState(null);
  const [assignedFoods, setAssignedFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    pickedUp: 0,
    delivered: 0,
  });
  const [selectedFood, setSelectedFood] = useState(null);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [actionType, setActionType] = useState("pickup");
  const [inProgress, setInProgress] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [assignedBatches, setAssignedBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("individual"); // "individual" or "batches"

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axiosInstance.get("/user-details");
        setUser(userRes.data.data);

        const foodRes = await axiosInstance.get(
          `/volunteer/${userRes.data.data._id}/assignments`
        );
        const sorted = foodRes.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setAssignedFoods(sorted);
        setFilteredFoods(sorted);

        // Calculate statistics
        const assigned = sorted.filter((f) => f.status === "assigned").length;
        const pickedUp = sorted.filter((f) => f.status === "picked-up").length;
        const delivered = sorted.filter((f) => f.status === "delivered").length;
        setStats({ assigned, pickedUp, delivered });
      } catch (error) {
        toast.error("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!user) return;
      setBatchesLoading(true);
      try {
        const res = await axiosInstance.get(
          `/donations/${user._id}/batch-assignments`
        );
        setAssignedBatches(res.data);
      } catch (error) {
        toast.error("Failed to load batch assignments");
      } finally {
        setBatchesLoading(false);
      }
    };

    if (user) fetchBatches();
  }, [user]);

  useEffect(() => {
    let filtered = assignedFoods;

    if (filterStatus !== "all") {
      filtered = filtered.filter((food) => food.status === filterStatus);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (food) =>
          food.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          food.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFoods(filtered);
  }, [searchTerm, filterStatus, assignedFoods]);

  const refreshFoodList = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/volunteer/${user._id}/assignments`);
      const sorted = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAssignedFoods(sorted);

      // Recalculate stats
      const assigned = sorted.filter((f) => f.status === "assigned").length;
      const pickedUp = sorted.filter((f) => f.status === "picked-up").length;
      const delivered = sorted.filter((f) => f.status === "delivered").length;
      setStats({ assigned, pickedUp, delivered });

      toast.success("Assignments refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh assignments");
    } finally {
      setLoading(false);
    }
  };

  const refreshBatches = async () => {
    if (!user) return;
    setBatchesLoading(true);
    try {
      const res = await axiosInstance.get(
        `/donations/${user._id}/batch-assignments`
      );
      setAssignedBatches(res.data);
      toast.success("Batch assignments refreshed!");
    } catch (error) {
      toast.error("Failed to refresh batch assignments");
    } finally {
      setBatchesLoading(false);
    }
  };

  const refreshAllData = async () => {
    if (user) {
      await Promise.all([refreshFoodList(), refreshBatches()]);
    }
  };

  const handleStartAction = async (food, type) => {
    setInProgress(true);
    setSelectedFood(food);
    setActionType(type);
    try {
      const endpoint = type === "pickup" ? "start-pickup" : "start-delivery";
      await axiosInstance.patch(`/food/${food._id}/${endpoint}`);
      toast.info(`${type === "pickup" ? "Pickup" : "Delivery"} code sent!`, {
        icon: type === "pickup" ? "🚚" : "📦",
      });
      setShowCodeInput(true);
    } catch (error) {
      toast.error(`Failed to start ${type}`);
    } finally {
      setInProgress(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!selectedFood) return;
    setInProgress(true);
    try {
      const endpoint =
        actionType === "pickup" ? "verify-pickup" : "verify-delivery";
      await axiosInstance.post(`/food/${selectedFood._id}/${endpoint}`, {
        code,
      });
      toast.success(
        `${actionType === "pickup" ? "Pickup" : "Delivery"} confirmed!`,
        {
          icon: "✅",
        }
      );
      setShowCodeInput(false);
      setCode("");

      // Refresh both individual and batch data
      await refreshAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid code");
    } finally {
      setInProgress(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
        return "info";
      case "picked-up":
        return "warning";
      case "delivered":
        return "success";
      default:
        return "neutral";
    }
  };

  const countItemsByStatus = (items, status) => {
    return items?.filter((item) => item.status === status).length || 0;
  };

  if (loading && !user) {
    return (
      <>
        <HeaderMid />
        <div className="min-h-screen flex justify-center items-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderMid />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-12"
      >
        {/* Modern Hero Section with Animated Elements */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-500 text-white py-10 px-4"
        >
          {/* Animated decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute right-0 bottom-0 w-96 h-96 bg-white rounded-full transform translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute right-20 top-10 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute left-20 top-20 w-32 h-32 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Volunteer Dashboard</h1>
              <p className="text-green-50 md:text-lg">
                Welcome back, {user?.fullName || "Volunteer"}! You're making a difference.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <FiPackage size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold">{stats.assigned}</div>
                    <div className="text-green-50">Assigned</div>
                  </div>
                </div>
                <p className="text-green-50 text-sm">Tasks waiting for pickup</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <FiTruck size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold">{stats.pickedUp}</div>
                    <div className="text-green-50">Picked Up</div>
                  </div>
                </div>
                <p className="text-green-50 text-sm">In transit to charity</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <FiCheck size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold">{stats.delivered}</div>
                    <div className="text-green-50">Delivered</div>
                  </div>
                </div>
                <p className="text-green-50 text-sm">Successfully completed</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Modern Filter Section */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-white shadow-md py-4 sticky top-0 z-30 border-b border-gray-100"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Your Assignments</h2>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refreshFoodList()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <FiRefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiFilter className="h-4 w-4" />
                  Filter
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="flex flex-wrap gap-4 items-end p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="assigned">Assigned</option>
                        <option value="picked-up">Picked Up</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <div className="flex-1 min-w-[300px]">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <FiSearch />
                        </span>
                        <input
                          type="text"
                          placeholder="Search by name or category"
                          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Enhanced Tabs */}
        <div className="max-w-6xl mx-auto px-4 my-8">
          <div className="flex justify-center">
            <div className="inline-flex p-1 rounded-xl bg-gray-100">
              <button
                className={`py-2 px-5 rounded-lg font-medium transition-all ${
                  activeTab === "individual" 
                    ? 'bg-white text-green-700 shadow-md' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab("individual")}
              >
                <FiPackage className="inline mr-2" /> Individual Items
              </button>
              <button
                className={`py-2 px-5 rounded-lg font-medium transition-all ${
                  activeTab === "batches" 
                    ? 'bg-white text-green-700 shadow-md' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab("batches")}
              >
                <FiTruck className="inline mr-2" /> Optimized Batches
              </button>
            </div>
          </div>
        </div>

        {/* Content - keep existing IndividualItemsList and BatchesList */}
        <div className="max-w-6xl mx-auto px-4">
          {activeTab === "individual" ? (
            <IndividualItemsList
              filteredFoods={filteredFoods}
              assignedFoods={assignedFoods}
              handleStartAction={handleStartAction}
              inProgress={inProgress}
              getStatusColor={getStatusColor}
            />
          ) : (
            <BatchesList
              assignedBatches={assignedBatches}
              batchesLoading={batchesLoading}
              refreshBatches={refreshBatches}
              getStatusColor={getStatusColor}
              countItemsByStatus={countItemsByStatus}
              handleStartAction={handleStartAction}
            />
          )}
        </div>
      </motion.div>

      {/* Improved Code Input Modal */}
      <AnimatePresence>
        {showCodeInput && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal header with gradient */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <div className="absolute right-10 bottom-10 w-32 h-32 bg-white rounded-full transform translate-x-1/3 translate-y-1/3"></div>
                </div>
                <div className="relative z-10 flex items-center justify-center">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 text-white">
                    {actionType === "pickup" ? (
                      <FiTruck className="w-8 h-8" />
                    ) : (
                      <FiCheck className="w-8 h-8" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-xl text-center text-gray-800 mb-2">
                  Enter {actionType === "pickup" ? "Pickup" : "Delivery"} Code
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Please enter the code provided by the{" "}
                  {actionType === "pickup" ? "business" : "charity"} to confirm
                  the {actionType}.
                </p>
                
                <div className="form-control w-full max-w-xs mx-auto">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-xl tracking-widest"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div className="flex justify-end space-x-3 mt-8">
                  <button 
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={() => setShowCodeInput(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                    onClick={handleConfirmCode}
                    disabled={inProgress || !code.trim()}
                  >
                    {inProgress ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default VolunteerDashboard;
