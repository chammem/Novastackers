// ViewCampaignProgress.jsx

import React, { useEffect, useState } from "react";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage,
  FiUsers,
  FiShoppingBag,
  FiFilter,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiUserPlus,
  FiLayers,
  FiRefreshCw,
  FiMap,
} from "react-icons/fi";

const ViewCampaignProgress = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [foods, setFoods] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("food");
  const [volunteers, setVolunteers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [batches, setBatches] = useState([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [availableBatchVolunteers, setAvailableBatchVolunteers] = useState([]);
  const [selectedBatchVolunteer, setSelectedBatchVolunteer] = useState("");

  const fetchCampaign = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/donations/${id}/details`);
      setCampaign(res.data.donation);
    } catch (err) {
      toast.error("Failed to load campaign");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFoods = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/donations/${id}/foods/paginated`, {
        params: {
          page,
          limit: 10,
          status: filterStatus !== "all" ? filterStatus : undefined,
          search: searchTerm || undefined,
        },
      });
      setFoods(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to load food items");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/donations/${id}/batches`);
      setBatches(res.data || []);
    } catch (err) {
      toast.error("Failed to load batches");
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewBatches = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.post(`/donations/${id}/batches/generate`);
      toast.success("Batch suggestions generated");
      fetchBatches();
    } catch (err) {
      toast.error("Failed to generate batch suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  async function generateAndAssignBatches(campaignId) {
    try {
      // Step 1: Generate batches
      const generateResponse = await axiosInstance.post(
        `/donations/${campaignId}/batches/generate`
      );

      console.log("Batches generated:", generateResponse.data);

      // Step 2: Immediately call auto-assign if batches were generated
      if (generateResponse.data.batches && generateResponse.data.batches.length > 0) {
        const assignResponse = await axiosInstance.post(
          `/donations/campaigns/${campaignId}/auto-assign`
        );

        console.log("Auto-assignment results:", assignResponse.data);

        // Return combined results
        return {
          batchesGenerated: generateResponse.data.batches.length,
          batchesAssigned: assignResponse.data.assignedCount,
          message: `Generated ${generateResponse.data.batches.length} batches and assigned ${assignResponse.data.assignedCount} to volunteers.`,
        };
      } else {
        return {
          batchesGenerated: 0,
          batchesAssigned: 0,
          message: generateResponse.data.message,
        };
      }
    } catch (error) {
      console.error("Error in batch generation and assignment:", error);
      throw error;
    }
  }

  const handleGenerateBatches = async () => {
    setIsLoading(true);
    try {
      const result = await generateAndAssignBatches(id);
      toast.success(result.message);
      // Refresh your data or update UI as needed
      fetchBatches(); // assuming you have a function to refresh batch data
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openBatchAssignModal = async (batchId) => {
    setSelectedBatch(batchId);
    setSelectedBatchVolunteer("");

    try {
      const res = await axiosInstance.get(`/donations/batches/${batchId}/available-volunteers`);
      setAvailableBatchVolunteers(res.data.volunteers || []);
      setBatchModalOpen(true);
    } catch (err) {
      toast.error("Failed to fetch compatible volunteers");
    }
  };

  const assignVolunteerToBatch = async () => {
    if (!selectedBatchVolunteer) {
      return toast.warning("Please select a volunteer");
    }

    try {
      await axiosInstance.post(`/donations/batches/${selectedBatch}/assign`, {
        volunteerId: selectedBatchVolunteer,
      });
      toast.success("Batch assignment requested! Volunteer will need to accept or decline.");
      setBatchModalOpen(false);
      fetchBatches();
    } catch (err) {
      toast.error("Failed to request batch assignment");
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  useEffect(() => {
    if (view === "food") {
      fetchFoods();
    } else if (view === "volunteers") {
      setIsLoading(true);
      axiosInstance
        .get(`/donations/${id}/volunteer`)
        .then((res) => {
          setVolunteers(res.data.volunteers || []);
          setIsLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load volunteers");
          setIsLoading(false);
        });
    } else if (view === "businesses") {
      setIsLoading(true);
      axiosInstance
        .get(`/donations/${id}/businesses`)
        .then((res) => {
          setBusinesses(res.data.businesses || []);
          setIsLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load businesses");
          setIsLoading(false);
        });
    } else if (view === "batches") {
      fetchBatches();
    }
  }, [view, id, page, filterStatus, searchTerm]);

  const openAssignModal = async (foodId) => {
    console.log("Opening modal for food ID:", foodId);
    setSelectedFoodId(foodId);
    setSelectedVolunteer("");
    try {
      const res = await axiosInstance.get(`/donations/campaign/${id}/available-volunteers?foodId=${foodId}`);
      setAvailableVolunteers(res.data.volunteers || []);
      setModalOpen(true);
    } catch {
      toast.error("Failed to fetch volunteers");
    }
  };

  const assignVolunteer = async () => {
    if (!selectedVolunteer) return toast.warning("Please select a volunteer");
    try {
      await axiosInstance.post(
        `/donations/assign-volunteer/${selectedFoodId}`,
        {
          volunteerId: selectedVolunteer,
        }
      );
      toast.success("Volunteer assigned!");
      setModalOpen(false);
      fetchFoods();
    } catch {
      toast.error("Failed to assign volunteer");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "badge-info";
      case "picked-up":
        return "badge-warning";
      case "delivered":
        return "badge-success";
      default:
        return "badge-neutral";
    }
  };

  const tabVariants = {
    inactive: { opacity: 0.6 },
    active: { opacity: 1, scale: 1.05 },
  };

  return (
    <>
      <HeaderMid />

      {/* Campaign Header with Enhanced UI */}
      <AnimatePresence mode="wait">
        {isLoading && !campaign ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-20"
          >
            <div className="flex space-x-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-4 h-4 rounded-full bg-primary" 
                     style={{ animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite both` }} />
              ))}
            </div>
          </motion.div>
        ) : campaign ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative py-10 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary blur-3xl"></div>
              <div className="absolute bottom-40 -left-10 w-40 h-40 rounded-full bg-secondary blur-3xl"></div>
            </div>
            
            <div className="max-w-6xl mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="md:w-2/5">
                  <div className="relative overflow-hidden rounded-3xl shadow-xl border border-base-content/5">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      src={`http://localhost:8082/${campaign.imageUrl}`}
                      alt={campaign.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/90 flex items-end">
                      <div className="p-6 w-full">
                        <div className="flex flex-col gap-1">
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-3/5">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 rounded-2xl border border-base-content/5 hover-lift backdrop-blur-sm relative overflow-hidden"
                  >
                    {/* Background decorative elements */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/10 blur-xl"></div>
                    <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-secondary/10 blur-xl"></div>
                    
                    {/* Campaign title and badges */}
                    <div className="relative">
                     
                      
                      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
                        {campaign.name}
                      </h2>

                      {/* Campaign timing information */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="badge badge-outline badge-secondary p-3 flex items-center gap-2">
                          <FiCalendar className="h-4 w-4" />
                          <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="badge badge-outline badge-primary p-3 flex items-center gap-2">
                          <FiClock className="h-4 w-4" />
                          <span>
                            {(() => {
                              const endDate = new Date(campaign.endingDate);
                              const now = new Date();
                              const diff = endDate - now;
                              
                              if (diff <= 0) return "Campaign has ended";
                              
                              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                              const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                              
                              return `Ends in: ${days}d ${hours}h ${minutes}m`;
                            })()}
                          </span>
                        </div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="relative z-10"
                      >
                        <p className="text-base-content/80 text-lg leading-relaxed border-l-4 border-primary/20 pl-3">
                          {campaign.description || "Help us make a difference with your generous donations of food items."}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {/* Interactive Tabbed Navigation */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="sticky top-16 z-30 py-3 bg-base-100/80 backdrop-blur-md shadow-sm border-y border-base-300"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="tabs tabs-boxed bg-base-200/50 p-1 inline-flex mx-auto relative">
            <div className="absolute inset-0 bg-base-200/50 backdrop-blur-sm rounded-lg"></div>
            {[
              { id: "food", icon: <FiPackage />, label: "Food Items" },
              { id: "businesses", icon: <FiShoppingBag />, label: "Businesses" },
              { id: "volunteers", icon: <FiUsers />, label: "Volunteers" },
              { id: "batches", icon: <FiLayers />, label: "Batch Pickup" }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                variants={tabVariants}
                animate={view === tab.id ? "active" : "inactive"}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`tab gap-2 relative z-10 ${view === tab.id ? "tab-active" : ""}`}
                onClick={() => setView(tab.id)}
              >
                {view === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon} {tab.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {/* FOOD VIEW */}
        {view === "food" && (
          <motion.div
            key="food-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <section className="bg-base-100 py-6">
              <div className="max-w-6xl mx-auto px-4">
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col sm:flex-row gap-4 items-end justify-between"
                >
                  <div className="form-control w-full sm:w-64">
                    <label className="label">
                      <span className="label-text flex items-center gap-1">
                        <FiFilter className="text-primary" />
                        <span className="font-medium">Filter by Status</span>
                      </span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="picked-up">Picked Up</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>

                  <div className="form-control w-full sm:w-64">
                    <label className="label">
                      <span className="label-text flex items-center gap-1">
                        <FiSearch className="text-primary" />
                        <span className="font-medium">Search</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Search food / business"
                      className="input input-bordered w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </motion.div>
              </div>
            </section>

            <section className="py-6 px-4 max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center py-12"
                  >
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </motion.div>
                ) : foods.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="card bg-base-100 overflow-hidden shadow-lg border border-base-300"
                  >
                    <div className="overflow-x-auto">
                      <table className="table table-zebra w-full">
                        <thead>
                          <tr>
                            <th className="bg-primary/10">Item</th>
                            <th className="bg-primary/10">Qty</th>
                            <th className="bg-primary/10">Category</th>
                            <th className="bg-primary/10">Size</th>
                            <th className="bg-primary/10">Business</th>
                            <th className="bg-primary/10">Status</th>
                            <th className="bg-primary/10">Volunteer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {foods.map((item, i) => (
                            <motion.tr
                              key={item._id || i}
                              initial={{
                                opacity: 0,
                                backgroundColor: "rgba(var(--p), 0.05)",
                              }}
                              animate={{
                                opacity: 1,
                                backgroundColor: "rgba(var(--b1), 1)",
                              }}
                              transition={{ delay: i * 0.05, duration: 0.3 }}
                              className="hover:bg-base-200"
                            >
                              <td className="font-medium">{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>{item.category}</td>
                              {/* Add this new cell for size */}
                              <td>
                                <span className={`badge ${item.size ? "badge-outline badge-info" : ""}`}>
                                  {item.size ? 
                                    item.size.charAt(0).toUpperCase() + item.size.slice(1) : 
                                    "N/A"}
                                </span>
                              </td>
                              <td>
                                {item.buisiness_id?.fullName || "Unknown"}
                              </td>
                              <td>
                                <span
                                  className={`badge badge-outline ${getStatusColor(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td>
                                {item.assignedVolunteer ? (
                                  <span className="badge badge-outline badge-success gap-1">
                                    <FiUsers className="h-3 w-3" />
                                    {item.assignedVolunteer.fullName}
                                  </span>
                                ) : (
                                  <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="btn btn-xs btn-outline btn-primary gap-1"
                                    onClick={() => openAssignModal(item._id)}
                                  >
                                    <FiUserPlus className="h-3 w-3" /> Assign
                                  </motion.button>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="py-4 flex justify-center items-center gap-2 border-t border-base-300">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-sm btn-circle"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <FiChevronLeft />
                      </motion.button>

                      <span className="text-sm font-medium px-2">
                        Page {page} of {totalPages}
                      </span>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-sm btn-circle"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        <FiChevronRight />
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center">
                        <FiPackage className="w-8 h-8 text-base-content/50" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-xl font-bold">
                      No food items found
                    </h3>
                    <p className="text-base-content/70 mt-2">
                      {searchTerm || filterStatus !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "No food items have been added to this campaign yet."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </motion.div>
        )}

        {/* BUSINESS VIEW */}
        {view === "businesses" && (
          <motion.section
            key="business-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="py-10 max-w-6xl mx-auto px-4"
          >
            <motion.h2
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-bold mb-8 flex items-center gap-2"
            >
              <FiShoppingBag className="text-primary" />
              <span>Contributing Businesses</span>
            </motion.h2>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center py-12"
                >
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </motion.div>
              ) : businesses.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {businesses.map((b, index) => (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ y: -5 }}
                      className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-300"
                    >
                      <div className="card-body p-5">
                        <h3 className="card-title text-lg text-primary">
                          {b.fullName || b.organizationName}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <span className="font-medium text-base-content/70">
                              Email:
                            </span>
                            {b.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="font-medium text-base-content/70">
                              Role:
                            </span>
                            <span className="badge badge-outline">
                              {b.role}
                            </span>
                          </p>
                          {b.phone && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium text-base-content/70">
                                Phone:
                              </span>
                              {b.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center">
                      <FiShoppingBag className="w-8 h-8 text-base-content/50" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-bold">
                    No businesses found
                  </h3>
                  <p className="text-base-content/70 mt-2">
                    No businesses have contributed to this campaign yet.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* VOLUNTEERS VIEW */}
        {view === "volunteers" && (
          <motion.section
            key="volunteer-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="py-10 max-w-6xl mx-auto px-4"
          >
            <motion.h2
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0 }}
              className="text-2xl font-bold mb-8 flex items-center gap-2"
            >
              <FiUsers className="text-primary" />
              <span>Volunteers Who Joined</span>
            </motion.h2>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center py-12"
                >
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                </motion.div>
              ) : volunteers.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {volunteers.map((v, index) => (
                    <motion.div
                      key={v._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ y: -5 }}
                      className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-300"
                    >
                      <div className="card-body p-5">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content">
                              {v.fullName?.charAt(0).toUpperCase() || "V"}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{v.fullName}</h3>
                            <p className="text-sm text-base-content/70">
                              {v.email}
                            </p>
                          </div>
                        </div>

                        <div className="divider my-2"></div>

                        <div className="mt-2 space-y-1 text-sm">
                          <p className="flex items-center gap-2">
                            <span className="font-medium text-base-content/70">
                              Role:
                            </span>
                            <span className="badge badge-outline">
                              {v.role}
                            </span>
                          </p>
                          {v.phone && (
                            <p className="flex items-center gap-2">
                              <span className="font-medium text-base-content/70">
                                Phone:
                              </span>
                              {v.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center">
                      <FiUsers className="w-8 h-8 text-base-content/50" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-bold">
                    No volunteers found
                  </h3>
                  <p className="text-base-content/70 mt-2">
                    No volunteers have joined this campaign yet.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* Batch View */}
        {view === "batches" && (
          <motion.div
            key="batch-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <section className="bg-base-100 py-6">
              <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FiLayers className="text-primary" />
                    <span>Smart Batching</span>
                  </h2>

                  <button
                    className="btn btn-primary mt-4 sm:mt-0"
                    onClick={handleGenerateBatches}
                  >
                    <FiRefreshCw className="mr-2" /> Generate and Assign Batches
                  </button>
                </div>

                <p className="text-base-content/70 mb-6">
                  Smart batches group nearby food items for efficient pickup. One volunteer can handle multiple items in a single trip.
                </p>
              </div>
            </section>

            <section className="py-6 px-4 max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center py-12"
                  >
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </motion.div>
                ) : batches.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    {batches.map((batch, index) => (
                      <motion.div
                        key={batch._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="card bg-base-100 shadow-lg border border-base-300 overflow-hidden"
                      >
                        <div className="card-body">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <h3 className="card-title text-lg">
                              <span className="flex items-center gap-2">
                                <FiLayers className="text-primary" />
                                Batch #{index + 1}
                              </span>
                              <div className="badge badge-primary">{batch.items.length} items</div>
                              <div className={`badge ${
                                batch.requiredCapacity === 'large' ? 'badge-warning' : 
                                batch.requiredCapacity === 'medium' ? 'badge-info' : 'badge-success'
                              }`}>
                                {batch.requiredCapacity} capacity
                              </div>

                              {/* Add batch status badge */}
                              {(() => {
                                // Determine batch status
                                let status = "pending";
                                let badgeClass = "badge-neutral";

                                if (batch.assignedVolunteer) {
                                  status = "assigned";
                                  badgeClass = "badge-info";

                                  // Check if all items are delivered
                                  const allDelivered = batch.items.every(item => item.status === "delivered");
                                  if (allDelivered) {
                                    status = "completed";
                                    badgeClass = "badge-success";
                                  }
                                }

                                return (
                                  <div className={`badge ${badgeClass}`}>
                                    {status}
                                  </div>
                                );
                              })()}
                            </h3>

                            <div className="mt-4 md:mt-0">
                              {batch.assignedVolunteer ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">Assigned to:</span>
                                  <span className="badge badge-outline badge-success">
                                    {batch.assignedVolunteer.fullName}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => openBatchAssignModal(batch._id)}
                                >
                                  Assign Volunteer
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="divider my-2"></div>

                          <div className="overflow-x-auto">
                            <table className="table table-compact w-full">
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th>Business</th>
                                  <th>Category</th>
                                  <th>Size</th>
                                  <th>Status</th>
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
                                    <td>
                                      <span className={`badge badge-outline ${getStatusColor(item.status)}`}>
                                        {item.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center mx-auto">
                      <FiLayers className="w-8 h-8 text-base-content/50" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold">
                      No batches available
                    </h3>
                    <p className="text-base-content/70 mt-2 mb-6">
                      Generate batches to group nearby food items for efficient pickup.
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={handleGenerateBatches}
                    >
                      Generate and Assign Batches
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Volunteer Assignment Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="modal-box p-0 overflow-hidden max-w-md w-full"
            >
              <div className="bg-primary text-primary-content p-4">
                <h3 className="font-bold text-lg">Assign Volunteer</h3>
              </div>

              <div className="p-6">
                <p className="mb-4 text-sm text-base-content/70">
                  Select a volunteer to assign to this food item for pickup and
                  delivery.
                </p>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Choose Volunteer</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedVolunteer}
                    onChange={(e) => setSelectedVolunteer(e.target.value)}
                  >
                    <option value="">Select a volunteer</option>
                    {availableVolunteers.map((vol) => (
                      <option key={vol._id} value={vol._id}>
                        {vol.fullName || vol.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-action">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setModalOpen(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={assignVolunteer}
                    className="btn btn-primary"
                    disabled={!selectedVolunteer}
                  >
                    Assign
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Batch Assignment Modal */}
      <AnimatePresence>
        {batchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="modal-box p-0 overflow-hidden max-w-md w-full"
            >
              <div className="bg-primary text-primary-content p-4">
                <h3 className="font-bold text-lg">Assign Volunteer to Batch</h3>
              </div>

              <div className="p-6">
                <p className="mb-4 text-sm text-base-content/70">
                  Select a volunteer with suitable transport capacity for this batch of items.
                </p>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Choose Volunteer</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={selectedBatchVolunteer}
                    onChange={(e) => setSelectedBatchVolunteer(e.target.value)}
                  >
                    <option value="">Select a volunteer</option>
                    {availableBatchVolunteers.map((vol) => (
                      <option key={vol._id} value={vol._id}>
                        {vol.fullName} - {vol.transportCapacity} capacity
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-action">
                  <button
                    onClick={() => setBatchModalOpen(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={assignVolunteerToBatch}
                    className="btn btn-primary"
                    disabled={!selectedBatchVolunteer}
                  >
                    Assign
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

export default ViewCampaignProgress;

// Add the following CSS at the end of your file or in a separate CSS file
// This adds custom animations and effects for enhanced UI experience
const style = document.createElement('style');
style.textContent = `
  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  }
  
  .animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .text-gradient {
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    background-image: linear-gradient(to right, var(--p), var(--s));
  }
  
  .border-gradient {
    border: 2px solid transparent;
    background-image: linear-gradient(var(--b1), var(--b1)), 
                      linear-gradient(to right, var(--p), var(--s));
    background-origin: border-box;
    background-clip: padding-box, border-box;
  }
  
  .card-glass {
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  .animate-float {
    animation: float 5s ease-in-out infinite;
  }
  
  .btn-glow:hover {
    box-shadow: 0 0 15px var(--p);
  }
`;
document.head.appendChild(style);