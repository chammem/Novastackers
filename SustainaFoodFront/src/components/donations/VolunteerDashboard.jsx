import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage,
  FiTruck,
  FiCheck,
  FiMap,
  FiSearch,
  FiFilter,
  FiClock,
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "assigned":
        return <FiPackage className="text-info" />;
      case "picked-up":
        return <FiTruck className="text-warning" />;
      case "delivered":
        return <FiCheck className="text-success" />;
      default:
        return <FiClock className="text-neutral" />;
    }
  };

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
            filteredFoods.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFoods.map((food, index) => (
                    <motion.div
                      key={food._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                        <div className="card-body p-5">
                          <div className="flex justify-between">
                            <h3 className="card-title text-lg">
                              {food.name || "Unnamed Donation"}
                            </h3>
                            <div
                              className={`badge badge-outline badge-${getStatusColor(
                                food.status
                              )}`}
                            >
                              {food.status}
                            </div>
                          </div>

                          <div className="mt-2 space-y-2">
                            <div className="text-sm flex gap-1">
                              <span className="font-medium text-neutral">
                                Category:
                              </span>
                              {food.category || "Uncategorized"}
                            </div>

                            <div className="text-sm flex gap-1">
                              <span className="font-medium text-neutral">
                                Quantity:
                              </span>
                              {food.quantity || "N/A"}
                            </div>

                            {food.restaurantId && (
                              <div className="text-sm flex gap-1">
                                <span className="font-medium text-neutral">
                                  From:
                                </span>
                                {food.restaurantName || "Restaurant"}
                              </div>
                            )}

                            {food.charityId && (
                              <div className="text-sm flex gap-1">
                                <span className="font-medium text-neutral">
                                  To:
                                </span>
                                {food.charityName || "Charity"}
                              </div>
                            )}

                            {food.volunteerPickedUpAt && (
                              <div className="text-sm text-success">
                                <span className="font-medium text-neutral">
                                  Picked up:
                                </span>
                                {new Date(
                                  food.volunteerPickedUpAt
                                ).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <div className="divider my-2"></div>

                          <div className="card-actions justify-end gap-2">
                            {!food.volunteerPickedUpAt &&
                              food.status === "assigned" && (
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  className="btn btn-sm btn-primary gap-1"
                                  onClick={() =>
                                    handleStartAction(food, "pickup")
                                  }
                                  disabled={inProgress}
                                >
                                  <FiTruck className="h-4 w-4" /> Start Pickup
                                </motion.button>
                              )}

                            {food.status === "picked-up" && (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-sm btn-success gap-1"
                                onClick={() =>
                                  handleStartAction(food, "delivery")
                                }
                                disabled={inProgress}
                              >
                                <FiCheck className="h-4 w-4" /> Deliver
                              </motion.button>
                            )}

                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              className="btn btn-sm btn-outline gap-1"
                              onClick={() => navigate(`/route/${food._id}`)}
                            >
                              <FiMap className="h-4 w-4" /> Route
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredFoods.length > 0 && (
                  <div className="text-center mt-8 text-base-content/70">
                    Showing {filteredFoods.length} of {assignedFoods.length}{" "}
                    assignments
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="card bg-base-100 shadow-lg mx-auto max-w-md"
              >
                <div className="card-body items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
                    <FiPackage size={28} className="text-base-content/50" />
                  </div>
                  <h2 className="card-title">No Assignments Found</h2>
                  <p className="text-base-content/70 mb-4">
                    Try changing your filter settings or check back later
                  </p>
                  <div className="card-actions">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                        refreshFoodList();
                      }}
                      className="btn btn-primary"
                    >
                      Reset Filters
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          ) : (
            <div className="max-w-6xl mx-auto px-4">
              {batchesLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                  <p className="text-lg font-medium">
                    Loading your batch assignments...
                  </p>
                </div>
              ) : assignedBatches.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                    {assignedBatches.map((batch, index) => (
                      <motion.div
                        key={batch._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                          <div className="card-body p-5">
                            <div className="flex justify-between items-center">
                              <h3 className="card-title text-lg">
                                Batch #{index + 1} - {batch.items?.length || 0}{" "}
                                Items
                              </h3>
                              <div
                                className={`badge badge-outline badge-${
                                  batch.status === "assigned"
                                    ? "info"
                                    : batch.status === "requested"
                                    ? "warning"
                                    : batch.status === "completed"
                                    ? "success"
                                    : batch.status === "in-progress"
                                    ? "primary"
                                    : "neutral"
                                }`}
                              >
                                {batch.status}
                              </div>
                            </div>

                            {batch.status === "completed" && (
                              <div className="flex items-center mt-2 text-success text-sm">
                                <FiCheck className="mr-1" /> All items
                                successfully delivered!
                              </div>
                            )}

                            <div className="mt-4 mb-2">
                              <div className="font-semibold mb-2">
                                Pickup Locations:
                              </div>
                              <div className="space-y-4 max-h-80 overflow-y-auto p-3 bg-base-200 rounded-md">
                                {batch.items?.map((item, i) => (
                                  <div
                                    key={item._id}
                                    className="bg-base-100 rounded-md p-3 shadow-sm"
                                  >
                                    <div className="flex gap-3 items-start">
                                      <span className="bg-primary text-primary-content w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                      </span>
                                      <div className="flex-1">
                                        <div className="flex justify-between">
                                          <div className="font-medium">
                                            {item.name || "Item"}
                                          </div>
                                          <div
                                            className={`badge badge-outline badge-${getStatusColor(
                                              item.status || "assigned"
                                            )}`}
                                          >
                                            {item.status || "assigned"}
                                          </div>
                                        </div>
                                        <div className="text-xs mt-1">
                                          {item.buisiness_id?.address ||
                                            "No address"}
                                        </div>

                                        {/* Item category and quantity */}
                                        <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                                          <div>
                                            <span className="font-medium">
                                              Category:{" "}
                                            </span>
                                            {item.category || "Uncategorized"}
                                          </div>
                                          <div>
                                            <span className="font-medium">
                                              Quantity:{" "}
                                            </span>
                                            {item.quantity || "N/A"}
                                          </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex justify-end gap-2 mt-3">
                                          {!item.volunteerPickedUpAt &&
                                            item.status === "assigned" && (
                                              <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                className="btn btn-xs btn-primary gap-1"
                                                onClick={() =>
                                                  handleStartAction(
                                                    item,
                                                    "pickup"
                                                  )
                                                }
                                                disabled={inProgress}
                                              >
                                                <FiTruck className="h-3 w-3" />{" "}
                                                Start Pickup
                                              </motion.button>
                                            )}

                                          {item.status === "picked-up" && (
                                            <motion.button
                                              whileTap={{ scale: 0.95 }}
                                              className="btn btn-xs btn-success gap-1"
                                              onClick={() =>
                                                handleStartAction(
                                                  item,
                                                  "delivery"
                                                )
                                              }
                                              disabled={inProgress}
                                            >
                                              <FiCheck className="h-3 w-3" />{" "}
                                              Deliver
                                            </motion.button>
                                          )}

                                          <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            className="btn btn-xs btn-outline gap-1"
                                            onClick={() =>
                                              navigate(`/route/${item._id}`)
                                            }
                                          >
                                            <FiMap className="h-3 w-3" /> Route
                                          </motion.button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="card-actions justify-end mt-4">
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              className="btn btn-sm btn-primary gap-1"
                              onClick={() => navigate(`/test-map/${batch._id}`)}
                            >
                              <FiMap className="h-4 w-4" /> View Optimized Route
                            </motion.button>

                              {batch.status === "requested" &&
                                batch.assignmentStatus === "pending" && (
                                  <>
                                    <motion.button
                                      whileTap={{ scale: 0.95 }}
                                      className="btn btn-sm btn-success gap-1"
                                      onClick={() =>
                                        handleAcceptBatch(batch._id)
                                      }
                                    >
                                      <FiCheck className="h-4 w-4" /> Accept
                                    </motion.button>
                                    <motion.button
                                      whileTap={{ scale: 0.95 }}
                                      className="btn btn-sm btn-error gap-1"
                                      onClick={() =>
                                        handleDeclineBatch(batch._id)
                                      }
                                    >
                                      Decline
                                    </motion.button>
                                  </>
                                )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="card bg-base-100 shadow-lg mx-auto max-w-md"
                >
                  <div className="card-body items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
                      <FiPackage size={28} className="text-base-content/50" />
                    </div>
                    <h2 className="card-title">No Batch Assignments Found</h2>
                    <p className="text-base-content/70 mb-4">
                      You don't have any batch assignments yet
                    </p>
                    <div className="card-actions">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={refreshBatches}
                        className="btn btn-primary"
                      >
                        Refresh Batches
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
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
