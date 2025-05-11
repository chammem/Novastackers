// ViewCampaignProgress.jsx

import React, { useEffect, useState, useRef } from "react";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axiosInstance";
import { motion, AnimatePresence, useInView } from "framer-motion";
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
  FiBarChart2,
  FiPieChart,
  FiCheckCircle,
  FiTrendingUp,
  FiAward,
  FiShare2,
  FiDownload,
  FiAlertCircle,
  FiUser,
  FiHeart,
  FiCloud,
  FiDroplet,
  FiLink
} from "react-icons/fi";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

  // Add new state variables for enhanced features
  const [campaignStats, setCampaignStats] = useState({
    totalItems: 0,
    pendingItems: 0,
    pickedUpItems: 0,
    deliveredItems: 0,
    completionPercentage: 0
  });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [businessContributions, setBusinessContributions] = useState([]);
  const reportRef = useRef(null);
  const progressSectionRef = useRef(null);
  const isProgressInView = useInView(progressSectionRef, { once: true });
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });
  const [campaignImpact, setCampaignImpact] = useState({ 
    mealsSaved: 0,
    co2Reduction: 0,
    waterSaved: 0,
    peopleHelped: 0
  });
  const [showMap, setShowMap] = useState(false);

  const fetchCampaign = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/donations/${id}/details`);
      const campaignData = res.data.donation;
      setCampaign(campaignData);
      
      // Calculate time remaining
      if (campaignData.endingDate) {
        calculateTimeRemaining(campaignData.endingDate);
        
        // Setup interval to update timer
        const timerInterval = setInterval(() => {
          calculateTimeRemaining(campaignData.endingDate);
        }, 60000); // Update every minute
        
        return () => clearInterval(timerInterval);
      }
    } catch (err) {
      toast.error("Failed to load campaign");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced fetchFoods function - Fixed API endpoint
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
      
      const foodItems = res.data.data;
      setFoods(foodItems);
      setTotalPages(res.data.totalPages);
      
      // Get all foods for statistics (not just the current page)
      // Fix the API endpoint by removing /api prefix since axiosInstance likely already includes it
      const allFoodsRes = await axiosInstance.get(`/donations/${id}/foods`);
      const allFoods = allFoodsRes.data.data || [];
      
      // Calculate statistics
      calculateCampaignStats(allFoods);
      calculateBusinessContributions(allFoods);
      calculateCampaignImpact(allFoods);
      
    } catch (err) {
      console.error("Error fetching foods:", err);
      // Fallback - generate mock stats if API fails
      const mockFoods = foods.length > 0 ? foods : [];
      calculateCampaignStats(mockFoods);
      calculateBusinessContributions(mockFoods);
      calculateCampaignImpact(mockFoods);
      
      toast.error("Failed to load all food items");
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

  // Calculate campaign statistics
  const calculateCampaignStats = (foodItems) => {
    const total = foodItems.length;
    const pending = foodItems.filter(item => item.status === 'pending').length;
    const pickedUp = foodItems.filter(item => item.status === 'picked-up').length;
    const delivered = foodItems.filter(item => item.status === 'delivered').length;
    const completionPercentage = total > 0 ? Math.round((delivered / total) * 100) : 0;
    
    setCampaignStats({
      totalItems: total,
      pendingItems: pending,
      pickedUpItems: pickedUp,
      deliveredItems: delivered,
      completionPercentage
    });
  };

  // Calculate time remaining for the campaign
  const calculateTimeRemaining = (endDate) => {
    if (!endDate) return;
    
    const end = new Date(endDate);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setTimeRemaining({ days, hours, minutes });
  };

  // Update the business contributions calculation to handle empty data
  const calculateBusinessContributions = (foodItems) => {
    const contributions = {};
    
    if (!foodItems || foodItems.length === 0) {
      setBusinessContributions([
        { name: 'No data available', value: 1 }
      ]);
      return;
    }
    
    foodItems.forEach(item => {
      const businessName = item.buisiness_id?.fullName || 'Unknown';
      if (!contributions[businessName]) {
        contributions[businessName] = 0;
      }
      contributions[businessName]++;
    });
    
    const chartData = Object.entries(contributions).map(([name, value]) => ({ name, value }));
    setBusinessContributions(chartData.length > 0 ? chartData : [{ name: 'No data', value: 1 }]);
  };

  // Calculate campaign impact
  const calculateCampaignImpact = (foodItems) => {
    const totalQuantity = foodItems.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
    
    // These calculations are simplified examples - you might want to use more realistic formulas
    const mealsSaved = Math.round(totalQuantity * 2.5); // Each food item provides ~2.5 meals
    const co2Reduction = Math.round(totalQuantity * 1.2); // kg of CO2 saved per item
    const waterSaved = Math.round(totalQuantity * 100); // liters of water saved
    const peopleHelped = Math.round(mealsSaved / 3); // Assume 3 meals per person
    
    setCampaignImpact({
      mealsSaved,
      co2Reduction,
      waterSaved,
      peopleHelped
    });
  };

  // Generate and download PDF report
  const generateReport = async () => {
    if (!reportRef.current) return;
    
    toast.info("Generating report...", { autoClose: 2000 });
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      pdf.addImage(imgData, 'JPEG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Campaign_Report_${campaign.name.replace(/\s+/g, '_')}.pdf`);
      
      toast.success("Report downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate report");
      console.error(error);
    }
  };

  // Share campaign 
  const shareCampaign = async (platform) => {
    const campaignTitle = campaign?.name || "Food Donation Campaign";
    const url = window.location.href;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=Check out this food donation campaign: ${campaignTitle}&url=${url}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Check out this food donation campaign: ${campaignTitle}&body=I thought you might be interested in this campaign: ${url}`);
        break;
      default:
        navigator.clipboard.writeText(url).then(() => {
          toast.success("Link copied to clipboard!");
        });
        break;
    }
    
    setShowShareMenu(false);
  };

  // Custom color palette for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  
  return (
    <>
      <HeaderMid />

      {/* Campaign Header - Enhanced with Time Remaining and Impact Cards */}
      <AnimatePresence mode="wait">
        {isLoading && !campaign ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-20"
          >
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </motion.div>
        ) : campaign ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-10 bg-gradient-to-b from-base-200 to-base-100"
          >
            <div className="max-w-6xl mx-auto px-4">
              {/* Campaign Title and Share Options */}
              <div className="flex justify-between items-center mb-6">
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-3xl md:text-4xl font-bold text-primary"
                >
                  {campaign.name}
                </motion.h1>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="btn btn-circle btn-outline btn-primary"
                  >
                    <FiShare2 size={20} />
                  </button>
                  
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 mt-2 w-40 bg-base-100 shadow-lg rounded-lg overflow-hidden z-10 border border-base-300"
                    >
                      <ul className="py-1">
                        <li 
                          className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center"
                          onClick={() => shareCampaign('twitter')}
                        >
                          <span className="text-blue-400 mr-2">𝕏</span> Twitter
                        </li>
                        <li 
                          className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center"
                          onClick={() => shareCampaign('facebook')}
                        >
                          <span className="text-blue-600 mr-2">f</span> Facebook
                        </li>
                        <li 
                          className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center"
                          onClick={() => shareCampaign('linkedin')}
                        >
                          <span className="text-blue-700 mr-2">in</span> LinkedIn
                        </li>
                        <li 
                          className="px-4 py-2 hover:bg-base-200 cursor-pointer flex items-center"
                          onClick={() => shareCampaign('copy')}
                        >
                          <FiLink className="mr-2" /> Copy Link
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col md:flex-row gap-8 items-start"
              >
                <div className="md:w-2/5">
                  <div className="space-y-4">
                    {/* Campaign Image with Enhanced UI */}
                    <div className="relative overflow-hidden rounded-2xl shadow-lg">
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        src={`http://localhost:8082/${campaign.imageUrl}`}
                        alt={campaign.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-4 text-white">
                          <div className="flex items-center gap-2">
                            <FiCalendar className="text-primary-content" />
                            <span className="text-sm font-medium">
                              Ends{" "}
                              {new Date(campaign.endingDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Time Remaining Card */}
                    <motion.div
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="card bg-base-100 shadow-lg border-l-4 border-primary"
                    >
                      <div className="card-body p-4">
                        <h3 className="card-title text-base flex items-center gap-2">
                          <FiClock className="text-primary" />
                          Time Remaining
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div className="bg-base-200 rounded-lg p-2 text-center">
                            <div className="text-2xl font-bold">{timeRemaining.days}</div>
                            <div className="text-xs">Days</div>
                          </div>
                          <div className="bg-base-200 rounded-lg p-2 text-center">
                            <div className="text-2xl font-bold">{timeRemaining.hours}</div>
                            <div className="text-xs">Hours</div>
                          </div>
                          <div className="bg-base-200 rounded-lg p-2 text-center">
                            <div className="text-2xl font-bold">{timeRemaining.minutes}</div>
                            <div className="text-xs">Minutes</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="md:w-3/5">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="mt-0 md:mt-3 text-base-content/80 text-lg"
                  >
                    {campaign.description || "Help us collect and distribute food to those in need. Every donation makes a difference in fighting hunger and reducing food waste."}
                  </motion.p>

                  {/* Campaign Progress Bar */}
                  <motion.div 
                    ref={progressSectionRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Campaign Progress</span>
                      <span className="text-sm font-bold">{campaignStats.completionPercentage}% Complete</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-4 overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: isProgressInView ? `${campaignStats.completionPercentage}%` : "0%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-primary h-full rounded-full"
                      />
                    </div>
                    
                    {/* Progress Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <span className="text-xl font-bold text-primary">{campaignStats.totalItems}</span>
                        <p className="text-xs mt-1">Total Items</p>
                      </div>
                      <div className="text-center">
                        <span className="text-xl font-bold text-warning">{campaignStats.pendingItems + campaignStats.pickedUpItems}</span>
                        <p className="text-xs mt-1">In Progress</p>
                      </div>
                      <div className="text-center">
                        <span className="text-xl font-bold text-success">{campaignStats.deliveredItems}</span>
                        <p className="text-xs mt-1">Delivered</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Impact Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
                  >
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="card bg-blue-50 shadow-sm"
                    >
                      <div className="card-body p-3">
                        <div className="flex justify-between items-start">
                          <h3 className="text-2xl font-bold text-blue-600">{campaignImpact.mealsSaved}</h3>
                          <FiUser className="text-blue-400" />
                        </div>
                        <p className="text-xs text-blue-800">Meals Provided</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="card bg-green-50 shadow-sm"
                    >
                      <div className="card-body p-3">
                        <div className="flex justify-between items-start">
                          <h3 className="text-2xl font-bold text-green-600">{campaignImpact.co2Reduction}</h3>
                          <FiCloud className="text-green-400" />
                        </div>
                        <p className="text-xs text-green-800">kg CO₂ Saved</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="card bg-purple-50 shadow-sm"
                    >
                      <div className="card-body p-3">
                        <div className="flex justify-between items-start">
                          <h3 className="text-2xl font-bold text-purple-600">{campaignImpact.waterSaved}</h3>
                          <FiDroplet className="text-purple-400" />
                        </div>
                        <p className="text-xs text-purple-800">L Water Saved</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="card bg-amber-50 shadow-sm"
                    >
                      <div className="card-body p-3">
                        <div className="flex justify-between items-start">
                          <h3 className="text-2xl font-bold text-amber-600">{campaignImpact.peopleHelped}</h3>
                          <FiHeart className="text-amber-400" />
                        </div>
                        <p className="text-xs text-amber-800">People Helped</p>
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  {/* Action Buttons */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-wrap gap-3 mt-6"
                  >
                    <button 
                      onClick={generateReport}
                      className="btn btn-outline btn-primary btn-sm gap-2"
                    >
                      <FiDownload size={16} /> Download Report
                    </button>
                    
                    <button 
                      onClick={() => setShowMap(!showMap)}
                      className="btn btn-outline btn-secondary btn-sm gap-2"
                    >
                      <FiMap size={16} /> {showMap ? 'Hide Map' : 'View Map'}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Conditional Map View */}
              <AnimatePresence>
                {showMap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 overflow-hidden"
                  >
                    <div className="card bg-base-100 shadow-lg">
                      <div className="card-body p-4">
                        <h3 className="card-title text-lg flex items-center">
                          <FiMap className="mr-2 text-primary" />
                          Campaign Map
                        </h3>
                        <div className="h-80 w-full bg-base-200 rounded-lg overflow-hidden">
                          <iframe
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d25000.0!2d-118.0!3d34.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1630000000000!5m2!1sen!2sus"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            title="Campaign Location"
                          ></iframe>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      {/* Tab Buttons */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="sticky top-16 z-10 py-3 bg-base-100 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="tabs tabs-boxed bg-base-200 p-1 inline-flex">
            <motion.button
              variants={tabVariants}
              animate={view === "food" ? "active" : "inactive"}
              whileTap={{ scale: 0.95 }}
              className={`tab gap-2 ${view === "food" ? "tab-active" : ""}`}
              onClick={() => setView("food")}
            >
              <FiPackage /> Food Items
            </motion.button>
            <motion.button
              variants={tabVariants}
              animate={view === "businesses" ? "active" : "inactive"}
              whileTap={{ scale: 0.95 }}
              className={`tab gap-2 ${
                view === "businesses" ? "tab-active" : ""
              }`}
              onClick={() => setView("businesses")}
            >
              <FiShoppingBag /> Businesses
            </motion.button>
            <motion.button
              variants={tabVariants}
              animate={view === "volunteers" ? "active" : "inactive"}
              whileTap={{ scale: 0.95 }}
              className={`tab gap-2 ${
                view === "volunteers" ? "tab-active" : ""
              }`}
              onClick={() => setView("volunteers")}
            >
              <FiUsers /> Volunteers
            </motion.button>
            <motion.button
              variants={tabVariants}
              animate={view === "batches" ? "active" : "inactive"}
              whileTap={{ scale: 0.95 }}
              className={`tab gap-2 ${view === "batches" ? "tab-active" : ""}`}
              onClick={() => setView("batches")}
            >
              <FiLayers /> Batch Pickup
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {/* FOOD VIEW - Enhanced with sorting and improved UI */}
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
                  className="flex flex-col md:flex-row gap-4 items-end justify-between flex-wrap"
                >
                  <div className="form-control w-full sm:max-w-xs">
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

                  <div className="form-control w-full sm:max-w-xs">
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
              {/* Data Visualization Cards */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 gap-6 mb-8"
              >
                {/* Status Distribution Chart */}
                <div className="card bg-base-100 shadow-lg overflow-hidden border border-base-300">
                  <div className="card-body p-4">
                    <h3 className="card-title text-lg flex items-center">
                      <FiPieChart className="mr-2 text-primary" />
                      Food Status Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Pending', value: campaignStats.pendingItems },
                              { name: 'Picked Up', value: campaignStats.pickedUpItems },
                              { name: 'Delivered', value: campaignStats.deliveredItems }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#A78BFA" /> {/* Pending - purple */}
                            <Cell fill="#FBBF24" /> {/* Picked Up - amber */}
                            <Cell fill="#34D399" /> {/* Delivered - green */}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                {/* Business Contribution Chart */}
                <div className="card bg-base-100 shadow-lg overflow-hidden border border-base-300">
                  <div className="card-body p-4">
                    <h3 className="card-title text-lg flex items-center">
                      <FiBarChart2 className="mr-2 text-primary" />
                      Business Contributions
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={businessContributions.slice(0, 5)} // Show top 5 contributors
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                        >
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={100} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            
              {/* Food Items Table */}
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

      {/* Invisible Report Template for PDF Generation */}
      <div className="hidden">
        <div ref={reportRef} className="bg-white p-8" style={{ width: "800px" }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-primary">
              Campaign Report: {campaign?.name}
            </h1>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Campaign Overview</h2>
            <p>{campaign?.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p><strong>Start Date:</strong> {campaign?.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'N/A'}</p>
                <p><strong>End Date:</strong> {campaign?.endingDate ? new Date(campaign.endingDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p><strong>Total Items:</strong> {campaignStats?.totalItems || 0}</p>
                <p><strong>Completion:</strong> {campaignStats?.completionPercentage || 0}%</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Campaign Impact</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Meals Provided:</strong> {campaignImpact.mealsSaved}</p>
                <p><strong>People Helped:</strong> {campaignImpact.peopleHelped}</p>
              </div>
              <div>
                <p><strong>CO₂ Saved:</strong> {campaignImpact.co2Reduction}kg</p>
                <p><strong>Water Saved:</strong> {campaignImpact.waterSaved} liters</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Food Item Status</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-base-200">
                  <th className="border p-2 text-left">Status</th>
                  <th className="border p-2 text-left">Count</th>
                  <th className="border p-2 text-left">Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Pending</td>
                  <td className="border p-2">{campaignStats.pendingItems}</td>
                  <td className="border p-2">
                    {campaignStats.totalItems ? 
                      ((campaignStats.pendingItems / campaignStats.totalItems) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Picked Up</td>
                  <td className="border p-2">{campaignStats.pickedUpItems}</td>
                  <td className="border p-2">
                    {campaignStats.totalItems ? 
                      ((campaignStats.pickedUpItems / campaignStats.totalItems) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">Delivered</td>
                  <td className="border p-2">{campaignStats.deliveredItems}</td>
                  <td className="border p-2">
                    {campaignStats.totalItems ? 
                      ((campaignStats.deliveredItems / campaignStats.totalItems) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewCampaignProgress;
