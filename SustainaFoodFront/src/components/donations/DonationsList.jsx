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
        const donationsResponse = await axiosInstance.get(
          "/donations/get-donations-by-ngo",
          {
            params: { search: "" },
          }
        );
        setDonations(donationsResponse.data);
        setFilteredDonations(donationsResponse.data);
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

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="py-12 md:py-20 bg-base-200"
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center">
          {/* Text Column */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:w-1/2 mb-8 md:mb-0 md:pr-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Where to Donate Surplus Food Now
            </h1>
            <p className="text-lg md:text-xl text-base-content/80 max-w-3xl mb-4">
              Help prevent food waste and feed those in need by donating surplus
              food. Every contribution makes a difference and ensures that
              perfectly good meals don't end up in the landfill. Together, let's
              fight hunger!
            </p>
          </motion.div>

          {/* Image Column */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full md:w-1/2 h-80 md:h-96 rounded-xl overflow-hidden shadow-xl"
          >
            <img
              src="/images/hungry.jpg"
              alt="Child in hunger"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Search Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="py-8"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">
              Find a Food Donation Campaign
            </h2>
            <p className="text-base-content/70 mt-2">
              Search for organizations accepting donations now
            </p>
          </div>

          <div className="mb-8 max-w-xl mx-auto">
            <div className="form-control">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search NGO by name..."
                  className="input input-bordered w-full pl-4 pr-14"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-primary btn-sm"
                  type="button"
                  onClick={() => debouncedSearch(searchTerm)}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <FiSearch size={18} />
                  )}
                </motion.button>
              </div>
            </div>
            {searchTerm && (
              <div className="mt-2 text-right">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearSearch}
                  className="btn btn-sm btn-ghost flex items-center gap-1"
                >
                  <FiX size={16} /> Clear search
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Donations Grid Section */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6"
          >
            Active Food Donation Campaigns
          </motion.h2>

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
                    whileHover={{ y: -5 }}
                    className="card bg-base-100 shadow-lg hover:shadow-xl transition-all border border-base-300"
                  >
                    {donation.imageUrl && (
                      <figure className="overflow-hidden h-48">
                        <img
                          src={`http://localhost:8082/${donation.imageUrl}`}
                          alt={donation.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </figure>
                    )}
                    <div className="card-body">
                      <h3 className="card-title text-xl">{donation.name}</h3>
                      {donation.description && (
                        <p className="text-base text-base-content/70 mt-2">
                          {donation.description.length > 100
                            ? donation.description.substring(0, 100) + "..."
                            : donation.description}
                        </p>
                      )}
                      <div className="card-actions justify-end mt-4">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-outline btn-sm"
                          onClick={() => navigate(`/donations/${donation._id}`)}
                        >
                          View Details
                        </motion.button>

                        {userRole === "restaurant" && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedDonationId(donation._id)}
                            className="btn btn-primary btn-sm"
                          >
                            <FiPlusCircle className="mr-1" /> Donate Food
                          </motion.button>
                        )}
                        {userRole === "volunteer" && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-success btn-sm"
                            onClick={() => handleVolunteer(donation._id)}
                          >
                            <FiUsers className="mr-1" /> Volunteer
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
                className="col-span-full text-center py-12"
              >
                <div className="max-w-md mx-auto bg-base-100 p-6 rounded-xl shadow-md">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto">
                      <span className="text-3xl">🔍</span>
                    </div>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">
                    No campaigns found
                  </h3>
                  <p className="mt-2 text-base-content/70">
                    Try adjusting your search or clearing filters.
                  </p>
                  {searchTerm && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearSearch}
                      className="mt-4 btn btn-outline"
                    >
                      Clear Search Filters
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

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="bg-base-200 py-12"
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold mb-4">
            Can't find a campaign that fits?
          </h2>
          <p className="text-base-content/70 mb-6">
            Don't worry — new donation campaigns are launched regularly. Or you
            can even start your own!
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="btn btn-outline"
              onClick={() => navigate("/contact")}
            >
              📞 Contact Us
            </motion.button>
            {["restaurant", "supermarket"].includes(userRole) && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
                onClick={() => navigate("/create-donation")}
              >
                <FiPlusCircle className="mr-1" /> Start a Campaign
              </motion.button>
            )}
          </div>
        </div>
      </motion.section>

      <Footer />
    </>
  );
};

export default DonationsList;
