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
} from "react-icons/fi";

const DonationListNgo = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

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
          <p className="text-base-content/70 text-lg">
            Loading your campaigns...
          </p>
        </motion.div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderMid />

      {/* HERO SECTION */}
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Manage Your Food Donation Campaigns
            </h1>
            <p className="text-lg md:text-xl text-base-content/70 max-w-3xl mb-4">
              Keep track of your active campaigns, monitor food donations, and
              launch new initiatives to fight hunger and reduce food waste in
              your community.
            </p>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Link
                to="/donationForm"
                className="btn btn-primary"
                onClick={() => navigate("/create-donation")}
              >
                <FiPlus className="mr-1" /> Create New Campaign
              </Link>
            </motion.div>
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
              alt="Donation campaign visual"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* SEARCH SECTION - STYLED ONLY */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="py-8"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">Find Your Campaigns</h2>
            <p className="text-base-content/70 mt-2">
              Search by name or location to quickly access your donation drives
            </p>
          </div>

          <div className="mb-8 max-w-xl mx-auto">
            <div className="form-control">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search campaign by name..."
                  className="input input-bordered w-full pl-4 pr-14"
                  disabled
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-primary btn-sm"
                  disabled
                >
                  <FiSearch size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CAMPAIGN GRID SECTION */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold mb-6 text-primary"
          >
            Your Campaigns
          </motion.h2>

          <AnimatePresence mode="wait">
            {campaigns.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {campaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    className="card bg-base-100 shadow-md hover:shadow-lg transition-all border border-base-300"
                  >
                    {campaign.imageUrl && (
                      <figure className="overflow-hidden h-48">
                        <img
                          src={`http://localhost:8082/${campaign.imageUrl}`}
                          alt={campaign.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </figure>
                    )}
                    <div className="card-body">
                      <h3 className="card-title text-xl">{campaign.name}</h3>
                      <p className="text-base text-base-content/70 mt-2 line-clamp-3">
                        {campaign.description}
                      </p>

                      <div className="mt-4 text-sm space-y-1">
                        <div className="flex items-center gap-2 text-base-content/70">
                          <FiMapPin className="text-primary" />
                          <span>
                            <strong>Location:</strong>{" "}
                            {campaign.location || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-base-content/70">
                          <FiCalendar className="text-primary" />
                          <span>
                            <strong>Ends:</strong>{" "}
                            {campaign.endingDate
                              ? new Date(
                                  campaign.endingDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="card-actions mt-4">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-outline btn-primary btn-sm w-full"
                          onClick={() =>
                            navigate(`/my-campaigns/${campaign._id}`)
                          }
                        >
                          <FiPackage className="mr-1" /> View Campaign Progress
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="col-span-full text-center py-12"
              >
                <div className="max-w-md mx-auto bg-base-100 p-6 rounded-xl shadow-md">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto">
                      <FiPackage size={24} className="text-base-content/50" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-error">
                    No campaigns yet
                  </h3>
                  <p className="mt-2 text-base-content/70">
                    Get started by creating your first campaign.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/create-donation")}
                    className="mt-4 btn btn-primary"
                  >
                    <FiPlus className="mr-1" /> Create Campaign
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="bg-base-200 py-12"
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold mb-4">
            Want to launch another campaign?
          </h2>
          <p className="text-base-content/70 mb-6">
            You can create multiple campaigns to support different locations or
            needs. Let's maximize your impact!
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="btn btn-outline"
              onClick={() => navigate("/contact")}
            >
              <FiPhone className="mr-1" /> Contact Support
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
              onClick={() => navigate("/create-donation")}
            >
              <FiPlus className="mr-1" /> Launch New Campaign
            </motion.button>
          </div>
        </div>
      </motion.section>

      <Footer />
    </>
  );
};

export default DonationListNgo;
