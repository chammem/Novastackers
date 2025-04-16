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
        className="min-h-screen bg-base-200"
      >
        {/* Hero Section with Stats */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-primary text-primary-content py-8 px-4"
        >
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Volunteer Dashboard</h1>
              <p>
                Welcome back, {user?.fullName || "Volunteer"}! You're making a
                difference.
              </p>
            </div>

            <div className="stats stats-vertical md:stats-horizontal shadow w-full bg-primary-content/10 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="stat"
              >
                <div className="stat-figure text-info">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full bg-info/30 flex items-center justify-center">
                      <FiPackage size={20} className="text-info" />
                    </div>
                  </div>
                </div>
                <div className="stat-title text-primary-content/80">
                  Assigned
                </div>
                <div className="stat-value text-info">{stats.assigned}</div>
                <div className="stat-desc text-primary-content/70">
                  Tasks waiting for pickup
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="stat"
              >
                <div className="stat-figure text-warning">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full bg-warning/30 flex items-center justify-center">
                      <FiTruck size={20} className="text-warning" />
                    </div>
                  </div>
                </div>
                <div className="stat-title text-primary-content/80">
                  Picked Up
                </div>
                <div className="stat-value text-warning">{stats.pickedUp}</div>
                <div className="stat-desc text-primary-content/70">
                  In transit to charity
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="stat"
              >
                <div className="stat-figure text-success">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full bg-success/30 flex items-center justify-center">
                      <FiCheck size={20} className="text-success" />
                    </div>
                  </div>
                </div>
                <div className="stat-title text-primary-content/80">
                  Delivered
                </div>
                <div className="stat-value text-success">{stats.delivered}</div>
                <div className="stat-desc text-primary-content/70">
                  Successfully completed
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-base-100 shadow py-4 sticky top-0 z-30"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Assignments</h2>

              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refreshFoodList()}
                  className="btn btn-sm btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <FiRefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-sm btn-outline"
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
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="form-control flex-1 min-w-[200px]">
                      <label className="label">
                        <span className="label-text">Status</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Statuses</option>
                        <option value="assigned">Assigned</option>
                        <option value="picked-up">Picked Up</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <div className="form-control flex-1 min-w-[300px]">
                      <label className="label">
                        <span className="label-text">Search</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-content">
                          <FiSearch />
                        </span>
                        <input
                          type="text"
                          placeholder="Search by name or category"
                          className="input input-bordered w-full pl-10"
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

        {/* Tabs */}
        <div className="tabs tabs-boxed justify-center max-w-md mx-auto my-4">
          <a
            className={`tab ${activeTab === "individual" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("individual")}
          >
            Individual Items
          </a>
          <a
            className={`tab ${activeTab === "batches" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("batches")}
          >
            Optimized Batches
          </a>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
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

      {/* Code Input Modal */}
      <AnimatePresence>
        {showCodeInput && (
          <div className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="modal-box"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  {actionType === "pickup" ? (
                    <FiTruck className="w-8 h-8" />
                  ) : (
                    <FiCheck className="w-8 h-8" />
                  )}
                </div>
              </div>
              <h3 className="font-bold text-xl text-center">
                Enter {actionType === "pickup" ? "Pickup" : "Delivery"} Code
              </h3>
              <p className="py-4 text-center">
                Please enter the code provided by the{" "}
                {actionType === "pickup" ? "business" : "charity"} to confirm
                the {actionType}.
              </p>
              <div className="form-control w-full max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="input input-bordered w-full text-center text-xl tracking-widest"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-action">
                <button className="btn" onClick={() => setShowCodeInput(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmCode}
                  disabled={inProgress || !code.trim()}
                >
                  {inProgress ? (
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                  ) : null}
                  Confirm
                </button>
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
