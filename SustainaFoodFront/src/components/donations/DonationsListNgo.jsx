import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiPackage,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiArrowRight,
  FiBarChart2,
  FiHeart,
  FiUsers,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { RiLeafLine } from "react-icons/ri";
import CountUp from "react-countup";
import { MdWavingHand, MdOutlineVolunteerActivism } from "react-icons/md";
import { BsFillPatchCheckFill, BsStars } from "react-icons/bs";
import { IoFastFood } from "react-icons/io5";
import { TbArrowWaveRightUp } from "react-icons/tb";

const DonationListNgo = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [stats, setStats] = useState({
    totalDonations: 0,
    peopleHelped: 0,
    activeCampaigns: 0,
  });
  const [hoverIndex, setHoverIndex] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [activeAnimation, setActiveAnimation] = useState(false);
  const navigate = useNavigate();

  // Nouveaux états pour les métriques réelles et leur évolution
  const [campaignMetrics, setCampaignMetrics] = useState({});
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metricsHistory, setMetricsHistory] = useState({});
  const [metricsExplanation, setMetricsExplanation] = useState({});
  
  // Fonction modifiée pour récupérer uniquement l'impact score basé sur les food items
  const fetchCampaignMetrics = async (campaignIds) => {
    if (!campaignIds.length) return;
    
    setIsLoadingMetrics(true);
    try {
      // Récupérer les métriques actuelles
      const response = await axiosInstance.post(
        "/donations/get-campaigns-metrics",
        { campaignIds: campaignIds }
      );
      
      if (response && response.data) {
        // Ne garder que l'impact score
        const metricsMap = {};
        response.data.forEach(metric => {
          if (!metric || !metric.campaignId) return;
          
          metricsMap[metric.campaignId] = {
            impactScore: metric.impactScore || 0,
            // Stockons quand même ces valeurs pour le calcul interne/tooltips
            _donorsCount: metric.donorsCount || 0,
            _foodCollected: metric.foodCollected || 0,
            _donationsCount: metric.donationsCount || 0
          };
          
          // Enrichir avec des explications détaillées si disponibles
          if (metric.breakdown) {
            metricsMap[metric.campaignId].breakdown = metric.breakdown;
          }
        });
        
        setCampaignMetrics(metricsMap);
      }
    } catch (error) {
      console.error("Failed to fetch campaign metrics:", error);
      
      // En cas d'échec, générer seulement un impact score basique
      const fallbackMetrics = {};
      campaignIds.forEach(id => {
        const campaign = campaigns.find(c => c._id === id);
        if (!campaign) return;
        
        // Score d'impact simplifié basé uniquement sur l'âge de la campagne
        const campaignAgeDays = campaign.endingDate ? 
          Math.max(1, Math.floor((new Date() - new Date(campaign.createdAt || Date.now())) / (1000 * 60 * 60 * 24))) : 30;
        
        fallbackMetrics[id] = {
          impactScore: Math.min(100, Math.floor(campaignAgeDays * 1.5 + 20))
        };
      });
      
      setCampaignMetrics(fallbackMetrics);
    } finally {
      setIsLoadingMetrics(false);
    }
  };
  
  // Fonction simplifiée pour obtenir uniquement l'impact score
  const getCampaignImpactScore = (campaignId) => {
    // First check if the campaign itself has an impactScore
    const campaign = campaigns.find(c => c._id === campaignId);
    if (campaign && typeof campaign.impactScore === 'number') {
      return campaign.impactScore;
    }
    // Fall back to the previously calculated metrics if needed
    return campaignMetrics[campaignId]?.impactScore || 0;
  };

  // Add state variables for campaign creation popup
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    endingDate: ''
  });
  const [createImageFile, setCreateImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [nameError, setNameError] = useState(""); // Add state for name validation error
  
  // Handler for opening the create campaign popup
  const handleCreateClick = () => {
    setCreateForm({
      name: '',
      description: '',
      endingDate: ''
    });
    setNameError("");
    setCreateImageFile(null);
    setPreviewImage(null);
    setIsCreating(true);
  };
  
  // Add validation function for campaign name
  const validateCampaignName = (name) => {
    if (!name.trim()) {
      setNameError("Campaign name is required");
      return false;
    } else if (name.length < 3) {
      setNameError("Campaign name must be at least 3 characters");
      return false;
    } else if (name.length > 50) {
      setNameError("Campaign name must be less than 50 characters");
      return false;
    }
    setNameError("");
    return true;
  };
  
  // Enhanced input change handler for campaign name
  const handleNameChange = (e) => {
    const value = e.target.value;
    setCreateForm(prev => ({ ...prev, name: value }));
    if (value.trim()) {
      validateCampaignName(value);
    }
  };
  
  // Handle input changes in the creation form
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      handleNameChange(e);
    } else {
      setCreateForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle image selection for campaign creation
  const handleCreateImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCreateImageFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle submission of the create campaign form
  const handleCreateSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validate campaign name before submission
    if (!validateCampaignName(createForm.name)) {
      return;
    }
    
    setFormLoading(true);
    
    try {
      // Basic validation
      if (!createForm.name.trim()) {
        toast.error("Campaign name is required");
        setFormLoading(false);
        return;
      }
      
      // Prepare form data for API call
      const formData = new FormData();
      Object.keys(createForm).forEach(key => {
        if (createForm[key]) formData.append(key, createForm[key]);
      });
      
      if (createImageFile) {
        formData.append('image', createImageFile);
      }
      
      // Get current user ID from the auth context or storage
      const userRes = await axiosInstance.get("/user-details");
      const userId = userRes.data?.data?._id;
      
      if (userId) {
        formData.append('ngoId', userId);
      }
      
      // Submit the form
      const response = await axiosInstance.post(
        "/donations/create-donation",
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      if (response.data) {
        // Add new campaign to list and refresh
        const newCampaign = response.data.donation || response.data;
        setCampaigns([newCampaign, ...campaigns]);
        
        toast.success("Campaign created successfully!");
        setIsCreating(false);
        
        // Optionally navigate to the campaign details
        navigate(`/my-campaigns/${newCampaign._id}`);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error(error.response?.data?.message || "Failed to create campaign");
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const userRes = await axiosInstance.get("/user-details");
        const user = userRes.data?.data;
        setUserRole(user.role || "");

        const campaignsRes = await axiosInstance.get(
          `/donations/get-donation-by-id/${user._id}`
        );
        setCampaigns(campaignsRes.data);
      } catch (error) {
        toast.error("Failed to load campaigns");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (campaigns.length > 0) {
      setStats({
        totalDonations: Math.floor(Math.random() * 1000) + 100,
        peopleHelped: Math.floor(Math.random() * 5000) + 500,
        activeCampaigns: campaigns.filter(
          (c) => new Date(c.endingDate) > new Date()
        ).length,
      });
    }
  }, [campaigns]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAnimation(true);
      setTimeout(() => setActiveAnimation(false), 3000);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getFilteredCampaigns = () => {
    if (filterType === "all") return campaigns;
    if (filterType === "active") 
      return campaigns.filter(c => new Date(c.endingDate) > new Date());
    if (filterType === "expired") 
      return campaigns.filter(c => new Date(c.endingDate) <= new Date());
    return campaigns;
  };

  if (isLoading) {
    return (
      <>
        <HeaderMid />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[50vh] py-12"
        >
          <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
          <p className="text-base-content/70 text-lg">Loading your campaigns...</p>
        </motion.div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderMid />

      {/* HERO SECTION AMÉLIORÉ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="py-12 md:py-20 relative overflow-hidden"
      >
        {/* Creative Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-white -z-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full filter blur-3xl opacity-20 -z-10 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20 -z-10 transform -translate-x-1/3 translate-y-1/3"></div>
        
        {/* Floating Elements - New */}
        <div className="absolute top-20 left-1/4 w-8 h-8 bg-green-400 rounded-full opacity-20 -z-10 animate-float"></div>
        <div className="absolute top-60 right-1/4 w-12 h-12 bg-blue-400 rounded-full opacity-30 -z-10 animate-float-delay"></div>
        <div className="absolute bottom-10 left-1/3 w-6 h-6 bg-yellow-300 rounded-full opacity-20 -z-10 animate-float-slow"></div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Stats Bar with Improved Design */}
          {campaigns.length > 0 && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="glass p-6 mb-12 rounded-2xl relative overflow-hidden backdrop-blur-sm bg-white/70 shadow-xl border border-white/20"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-green-300/20 to-green-500/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-blue-300/20 to-blue-500/30 rounded-full blur-xl"></div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Impact Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="p-4 rounded-xl bg-white/80 shadow-md border border-green-100 backdrop-blur-sm transform transition-all hover:scale-105 hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <RiLeafLine className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-800">
                        <CountUp end={stats.activeCampaigns} duration={2} />
                      </h3>
                      <p className="text-sm text-gray-600">Active Campaigns</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-white/80 shadow-md border border-blue-100 backdrop-blur-sm transform transition-all hover:scale-105 hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <FiBarChart2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-800">
                        <CountUp end={stats.totalDonations} duration={2.5} />
                      </h3>
                      <p className="text-sm text-gray-600">Total Donations</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-white/80 shadow-md border border-purple-100 backdrop-blur-sm transform transition-all hover:scale-105 hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <FiUsers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-800">
                        <CountUp end={stats.peopleHelped} duration={2.5} separator="," />
                      </h3>
                      <p className="text-sm text-gray-600">People Impacted</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hero Content */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Text Content */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              className="md:w-1/2"
            >
              <div className="relative mb-6">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "40%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute h-3 bg-green-200 bottom-2 left-0 -z-10"
                ></motion.span>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight relative z-10">
                  Feed <span className="text-green-600">Hope</span>, Share{" "}
                  <span className="text-green-600">Nourishment</span>
                </h1>
              </div>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mb-8 leading-relaxed">
                Your campaigns are making a meaningful difference. Track active
                donations, launch new initiatives, and see the impact you're
                creating in fighting food insecurity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Link
                    to="/my-campaigns-analytics"
                    className="btn border-2 border-green-500 text-green-600 group-hover:text-white hover:bg-transparent px-6 py-3 rounded-full shadow-md flex items-center justify-center relative z-10"
                  >
                    <FiBarChart2 className="mr-2" /> View Analytics
                  </Link>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={handleCreateClick}
                    className="btn bg-gradient-to-r from-green-500 to-green-600 border-0 text-white px-6 py-3 rounded-full shadow-md flex items-center justify-center"
                  >
                    <FiPlus className="mr-2" /> New Campaign
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* Image with Overlapping Cards */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
              className="w-full md:w-1/2 h-96 relative"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -top-6 -left-6 p-4 bg-white rounded-xl shadow-lg w-48 z-20 transform transition-transform hover:scale-105 hover:rotate-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <FiHeart className="text-red-500" />
                  <span className="text-xs text-gray-500">Just donated</span>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Smiths Family donated 20kg of rice
                </p>
              </motion.div>

              <div className="rounded-xl overflow-hidden shadow-2xl h-full relative z-10 transform transition-transform hover:scale-[1.02]">
                <img
                  src="/images/hungry.jpg"
                  alt="Community food donation drive"
                  className="w-full h-full object-cover transition-transform duration-10000 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-sm font-medium">
                    Your current campaigns are making a difference
                  </p>
                  <h3 className="text-xl font-bold mt-1">
                    Join 500+ donors fighting hunger
                  </h3>
                </div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-6 -right-6 p-4 bg-white rounded-xl shadow-lg w-48 z-20 transform transition-transform hover:scale-105 hover:rotate-[-2deg]"
              >
                <div className="flex items-center justify-between mb-2">
                  <FiPackage className="text-green-500" />
                  <span className="text-xs text-gray-500">Impact stats</span>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  2,400+ meals provided this month
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* SECTION DE RECHERCHE AMÉLIORÉE */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="py-12 bg-gradient-to-r from-green-50 via-white to-green-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="md:w-1/2 mb-6 md:mb-0"
            >
              <div className="flex items-center gap-3 mb-1">
                <MdWavingHand className="text-yellow-500 text-2xl animate-pulse" />
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-800">
                  Welcome Back!
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-md">
                Your campaigns are making a <span className="font-bold">real difference</span> in your community. Let's continue the journey!
              </p>
            </motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="relative group max-w-md w-full"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-lg p-2 ring-1 ring-gray-200/50 shadow-lg">
                <input
                  type="text"
                  placeholder="Find campaigns by name..."
                  className="input input-bordered w-full pl-4 pr-10 bg-transparent text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="btn btn-primary btn-sm px-3 py-2 rounded-lg"
                  >
                    <FiSearch size={18} className="mr-1" /> Search
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filtres interactifs */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`px-5 py-2.5 rounded-full font-medium ${
                filterType === "all" 
                  ? "bg-green-500 text-white shadow-lg" 
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
              onClick={() => setFilterType("all")}
            >
              <BsStars className={`inline mr-1.5 ${filterType === "all" ? "text-yellow-300" : "text-yellow-500"}`} />
              All Campaigns
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`px-5 py-2.5 rounded-full font-medium ${
                filterType === "active" 
                  ? "bg-green-500 text-white shadow-lg" 
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
              onClick={() => setFilterType("active")}
            >
              <BsFillPatchCheckFill className={`inline mr-1.5 ${filterType === "active" ? "text-white" : "text-green-500"}`} />
              Active
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`px-5 py-2.5 rounded-full font-medium ${
                filterType === "expired" 
                  ? "bg-green-500 text-white shadow-lg" 
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
              onClick={() => setFilterType("expired")}
            >
              <FiCalendar className={`inline mr-1.5 ${filterType === "expired" ? "text-white" : "text-gray-500"}`} />
              Completed
            </motion.button>
           
          </motion.div>
        </div>
      </motion.section>

      {/* CAMPAGNES GRID AMÉLIORÉ */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {getFilteredCampaigns().length > 0 ? (
              <motion.div
                key="campaign-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {getFilteredCampaigns().map((campaign, index) => {
                  const isExpired = new Date(campaign.endingDate) <= new Date();
                  const impactScore = getCampaignImpactScore(campaign._id);
                  
                  return (
                    <motion.div
                      key={campaign._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      onHoverStart={() => setHoverIndex(index)}
                      onHoverEnd={() => setHoverIndex(null)}
                      className="relative group"
                    >
                      {/* Badges et indicateurs visuel */}
                      {!isExpired && (
                        <div className="absolute -top-3 -right-3 z-10">
                          <div className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white mr-1"></span>
                            Active
                          </div>
                        </div>
                      )}
                      {isExpired && (
                        <div className="absolute -top-3 -right-3 z-10">
                          <div className="px-3 py-1 bg-gray-500 text-white text-sm font-bold rounded-full shadow-lg">
                            Completed
                          </div>
                        </div>
                      )}

                      <div className="overflow-hidden rounded-xl bg-white border border-gray-200 shadow-lg h-full group relative">
                        {/* Image container */}
                        <div className="relative h-52 overflow-hidden">
                          {campaign.imageUrl ? (
                            <img
                              src={`http://localhost:8082/${campaign.imageUrl}`}
                              alt={campaign.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                              <IoFastFood className="text-5xl text-green-500" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                          {/* Impact score proéminent */}
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-bold text-green-700 flex items-center shadow-md">
                            <MdOutlineVolunteerActivism className="mr-2 text-green-500 text-lg" />
                            <span className="text-base">Impact Score: {impactScore}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          {/* Campaign name - add this new heading */}
                          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1 hover:line-clamp-none transition-all duration-300">
                            {campaign.name || "Unnamed Campaign"}
                          </h3>
                          
                          <p className="text-gray-600 line-clamp-2 mb-4">
                            {campaign.description || "Help us make a difference with your generous donations of food items."}
                          </p>
                        
                         {/* Date indicator */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <FiCalendar className="mr-1.5 text-green-500" />
                              {isExpired ? "Ended" : "Ends"}: {campaign.endingDate
                                ? new Date(campaign.endingDate).toLocaleDateString()
                                : "N/A"}
                            </div>
                            {!isExpired && (
                              <div className="text-green-600 font-medium flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-1 ${activeAnimation ? 'animate-ping bg-green-500' : 'bg-green-500'}`}></div>
                                Active
                              </div>
                            )}
                          </div>

                          {/* Action button */}
                          <motion.button
                            initial={{ opacity: 0.9 }}
                            animate={{ 
                              opacity: hoverIndex === index ? 1 : 0.9,
                              scale: hoverIndex === index ? 1.05 : 1
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-3 px-4 flex items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-md"
                            onClick={() => navigate(`/my-campaigns/${campaign._id}`)}
                          >
                            <span>View Campaign Details</span>
                            <TbArrowWaveRightUp className="ml-2 text-xl" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="no-campaigns"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="col-span-full text-center py-12"
              >
                <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
                  <motion.div 
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, -5, 0, 5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <FiPackage size={42} className="text-green-500" />
                  </motion.div>
                  <h3 className="mt-4 text-2xl font-bold text-gray-800 mb-2">
                    {filterType === "all" 
                      ? "No campaigns found" 
                      : `No ${filterType} campaigns found`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filterType === "all" 
                      ? "Let's start by creating your first campaign" 
                      : "Try another filter or create a new campaign"}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {filterType !== "all" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilterType("all")}
                        className="btn btn-outline btn-primary"
                      >
                        <BsStars className="mr-1.5" /> Show All Campaigns
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCreateClick}
                      className="btn btn-primary"
                    >
                      <FiPlus className="mr-1.5" /> Create Campaign
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FINAL CTA SECTION AMÉLIORÉ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 relative overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-50 -z-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full filter blur-3xl opacity-30 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-30 -z-10"></div>
            
        <div className="max-w-5xl mx-auto px-4">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 60 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center relative z-10 border border-gray-100"
          > 
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              <motion.div 
                animate={{ 
                  y: [0, -6, 0],
                  rotate: [0, -3, 0, 3, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-full bg-gradient-to-r from-green-500 to-green-600 p-4 shadow-lg inline-block"
              >
                <MdOutlineVolunteerActivism className="text-3xl text-white" />
              </motion.div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mt-6 mb-4 text-gray-800">
              Ready to Make a Bigger Impact?
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Every campaign you create helps reduce food waste and provides meals to those in need. Your efforts create ripples of positive change throughout your community.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium shadow-md flex items-center"
                onClick={handleCreateClick}
              >
                <FiPlus className="mr-2" /> Start New Campaign
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Start New Campaign popup form */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-0 rounded-xl shadow-2xl max-w-2xl w-full my-8"
          >
            {/* Banner header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 py-6 px-8 rounded-t-xl sticky top-0 z-10">
              <h3 className="text-2xl font-bold text-white">Create New Campaign</h3>
              <p className="text-green-100 text-sm mt-1">Set up a new donation campaign</p>
            </div>
            
            {/* Scrollable form content */}
            <div className="max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleCreateSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Campaign Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={createForm.name}
                        onChange={handleCreateInputChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                        required
                        placeholder="Enter campaign name"
                      />
                      {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={createForm.description}
                        onChange={handleCreateInputChange}
                        rows="5"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                        placeholder="Describe your campaign"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        End Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiCalendar className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          name="endingDate"
                          value={createForm.endingDate}
                          onChange={handleCreateInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Campaign Image
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-green-500 dark:hover:border-green-500 transition-colors">
                        <div className="space-y-1 text-center">
                          {previewImage ? (
                            <div className="relative">
                              <img 
                                src={previewImage}
                                alt="Preview"
                                className="mx-auto h-32 object-cover rounded"
                              />
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Image preview
                              </p>
                            </div>
                          ) : (
                            <>
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No image selected
                              </p>
                            </>
                          )}
                          <div className="flex justify-center text-sm text-gray-600 dark:text-gray-400">
                            <label htmlFor="create-image-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 focus-within:outline-none">
                              <span>Upload a file</span>
                              <input 
                                id="create-image-upload" 
                                name="create-image-upload" 
                                type="file" 
                                className="sr-only"
                                accept="image/*"
                                onChange={handleCreateImageChange}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Fixed bottom buttons */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
              <div className="flex justify-end gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateSubmit}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-colors shadow-md"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : "Create Campaign"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default DonationListNgo;
