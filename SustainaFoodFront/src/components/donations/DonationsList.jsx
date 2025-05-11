import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import HeaderMid from "../HeaderMid";
import { debounce } from "lodash";
import Footer from "../Footer";
import AddFoodToDonation from "./AddFoodToDonation";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiHeart, FiUsers, FiPlusCircle } from "react-icons/fi";

const DonationsList = () => {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDonationId, setSelectedDonationId] = useState(null);
  const [businessId, setBusinessId] = useState("");
  const [volunteeredCampaigns, setVolunteeredCampaigns] = useState([]);
  const navigate = useNavigate();
  const [user, setUser] = useState();
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      try {
        setIsSearching(true);
        const response = await axiosInstance.get(
          "/donations/get-donations-by-ngo",
          {
            params: { search: term },
          }
        );
        setFilteredDonations(response.data);
      } catch (error) {
        toast.error("Failed to search donations");
        setFilteredDonations([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    debouncedSearch("");
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userResponse = await axiosInstance.get("/user-details");
        setBusinessId(userResponse.data?.data?._id || "");
        setUserRole(userResponse.data?.data?.role || "");
        setUser(userResponse.data?.data);
        
        // Get donations data
        const donationsResponse = await axiosInstance.get(
          "/donations/get-donations-by-ngo",
          {
            params: { search: "" },
          }
        );
        setDonations(donationsResponse.data);
        setFilteredDonations(donationsResponse.data);
        
        // If user is a volunteer, fetch campaigns they've volunteered for
        if (userResponse.data?.data?.role === "volunteer") {
          const userId = userResponse.data?.data?._id;
          const volunteeredResponse = await axiosInstance.get(`/volunteer/${userId}/campaigns`);
          setVolunteeredCampaigns(volunteeredResponse.data.map(campaign => campaign._id));
        }
      } catch (error) {
        toast.error("Failed to load initial data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleVolunteer = async (donationId) => {
    try {
      await axiosInstance.post(`/donations/${donationId}/volunteer`, {
        userId: user._id,
      });
      toast.success("You've volunteered for this campaign!");
      
      // Add this campaign to volunteeredCampaigns state
      setVolunteeredCampaigns(prev => [...prev, donationId]);
    } catch (error) {
      toast.error("Failed to volunteer for this campaign.");
      console.error(error);
    }
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
          <p className="text-base-content/70 text-lg">Loading campaigns...</p>
        </motion.div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderMid />

      {/* Redesigned Hero Section with creative elements */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative pt-16 pb-24 overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute left-1/2 top-28 w-1/2 h-1/2 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2"></div>
          <div className="absolute right-1/4 bottom-10 w-1/3 h-1/3 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute left-1/4 -bottom-20 w-1/4 h-1/4 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            {/* Text Column with enhanced styling */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:w-1/2 mb-10 md:mb-0 md:pr-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform -rotate-6">
                <FiHeart className="text-white w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Donate Surplus Food <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Feed Those in Need</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mb-8 leading-relaxed">
                Help prevent food waste and feed those in need by donating surplus
                food. Every contribution makes a difference and ensures that
                perfectly good meals don't end up in the landfill.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all font-medium"
                  onClick={() => {
                    const donationsSection = document.getElementById('donationsSection');
                    if (donationsSection) {
                      donationsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  View Campaigns
                </motion.button>
              </div>
            </motion.div>

            {/* Image Column with creative styling */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full md:w-1/2 relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                <img
                  src="/images/hungry.jpg"
                  alt="Child in hunger"
                  className="w-full h-96 object-cover transition-transform duration-700 hover:scale-110"
                />
                <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                  <p className="text-sm font-medium text-gray-800">Join <span className="text-green-600 font-bold">{filteredDonations.length}</span> active campaigns</p>
                </div>
              </div>
              
              {/* Keep only the Meals Saved floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-3 z-20 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 00-4-4H8.8a4 4 0 00-4 4v7m8-7h-2.8" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Meals Saved</p>
                    <p className="text-lg font-bold text-gray-800">50K+</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Modern Search Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="py-16 bg-gradient-to-b from-white to-green-50 relative"
      >
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent inline-block">
              Find a Food Donation Campaign
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto mt-3 rounded-full"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Search for organizations currently accepting donations and make a difference today
            </p>
          </div>

          <div className="mb-12 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-2 flex items-center gap-2 border border-gray-100 transition-all focus-within:shadow-green-100/50">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search NGO by name..."
                  className="w-full px-4 py-3 outline-none text-gray-700 placeholder-gray-400 bg-transparent rounded-xl focus:ring-0"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                  >
                    <FiX className="text-gray-400" size={16} />
                  </button>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl shadow-md font-medium flex items-center gap-2"
                type="button"
                onClick={() => debouncedSearch(searchTerm)}
                disabled={isSearching}
              >
                {isSearching ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <FiSearch size={18} />
                )}
                Search
              </motion.button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Donations Grid Section */}
      <section id="donationsSection" className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800">
              Active Food Donation Campaigns
            </h2>
            
            <div className="text-gray-500 flex items-center">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                {filteredDonations.length} campaigns available
              </span>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {filteredDonations.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredDonations.map((donation, index) => (
                  <motion.div
                    key={donation._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
                  >
                    <div className="relative">
                      <div className="h-48 overflow-hidden relative">
                        {donation.imageUrl ? (
                          <img
                            src={`http://localhost:8082/${donation.imageUrl}`}
                            alt={donation.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <FiHeart className="text-white/30 w-20 h-20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4 text-white w-full">
                          <h3 className="text-xl font-bold truncate">{donation.name}</h3>
                          <p className="opacity-90 text-sm">By {donation.ngoId?.organizationName || "Anonymous NGO"}</p>
                        </div>
                      </div>
                      
                      {/* Status badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        Active Campaign
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-4">
                        {donation.description ? (
                          <p className="text-gray-600 line-clamp-2">
                            {donation.description}
                          </p>
                        ) : (
                          <p className="text-gray-400 italic">No description provided</p>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-500">Ends in 14 days</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-500">
                            {Math.floor(Math.random() * 15) + 5} volunteers
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                          onClick={() => navigate(`/donations/${donation._id}`)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Details
                        </motion.button>

                        {userRole === "restaurant" && (
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedDonationId(donation._id)}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1"
                          >
                            <FiPlusCircle className="w-4 h-4" /> Donate
                          </motion.button>
                        )}
                        
                        {userRole === "volunteer" && (
                          <motion.button
                            whileHover={{ scale: volunteeredCampaigns.includes(donation._id) ? 1 : 1.03 }}
                            whileTap={{ scale: volunteeredCampaigns.includes(donation._id) ? 1 : 0.97 }}
                            className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-1 ${
                              volunteeredCampaigns.includes(donation._id)
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md hover:shadow-lg"
                            }`}
                            onClick={() => handleVolunteer(donation._id)}
                            disabled={volunteeredCampaigns.includes(donation._id)}
                          >
                            <FiUsers className="w-4 h-4" />
                            {volunteeredCampaigns.includes(donation._id)
                              ? "Volunteered"
                              : "Volunteer"}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16"
              >
                <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-100">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    No campaigns found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? `We couldn't find any campaigns matching "${searchTerm}"`
                      : "There are no active donation campaigns at the moment."}
                  </p>
                  {searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleClearSearch}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium"
                    >
                      <FiX className="inline mr-2" /> Clear Search
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedDonationId && (
            <AddFoodToDonation
              donationId={selectedDonationId}
              businessId={businessId}
              onClose={() => setSelectedDonationId(null)}
              onFoodAdded={(updatedDonation) => {
                setFilteredDonations((prev) =>
                  prev.map((d) =>
                    d._id === updatedDonation._id ? updatedDonation : d
                  )
                );
              }}
            />
          )}
        </div>
      </section>

      {/* Enhanced Call-to-Action Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="bg-gradient-to-b from-white to-green-50 py-16 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-200 to-emerald-300 opacity-70"></div>
          <div className="absolute -right-14 top-0 w-64 h-64 rounded-full border-16 border-green-100 opacity-50"></div>
          <div className="absolute -left-14 bottom-0 w-64 h-64 rounded-full border-16 border-emerald-100 opacity-50"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHeart className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Can't find a campaign that fits?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            Don't worry — new donation campaigns are launched regularly. Contact us for more information.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all font-medium"
              onClick={() => navigate("/contact")}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </motion.button>
          </div>
        </div>
      </motion.section>

      <Footer />
    </>
  );
};

export default DonationsList;
