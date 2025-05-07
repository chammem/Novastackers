import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiMapPin, FiGlobe, FiShare2, FiInstagram, FiTwitter, FiBox } from 'react-icons/fi';
<<<<<<< HEAD
import AddFoodToDonation from './AddFoodToDonation';

const CharityEventDetails = () => {
  const { id } = useParams();
=======

const CharityEventDetails = () => {
  const { id } = useParams(); // donation ID from route
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [donation, setDonation] = useState(null);
  const [ngo, setNgo] = useState(null);
<<<<<<< HEAD
  const [donateModalOpen, setDonateModalOpen] = useState(false);
=======
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const userResponse = await axiosInstance.get('/user-details');
        setUser(userResponse.data?.data || {});

        const res = await axiosInstance.get(`/donations/${id}/details`);
        setDonation(res.data.donation);
        setNgo(res.data.ngo);
      } catch (error) {
        toast.error('Failed to load event or user info');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleDonateClick = () => {
<<<<<<< HEAD
    console.log("Opening donation modal...");
    setDonateModalOpen(true);
  };

  const handleFoodAdded = (newFoodItem) => {
    console.log('Food item added:', newFoodItem);
    setDonateModalOpen(false);
  };

  const handleCloseModal = () => {
    console.log("Closing donation modal...");
    setDonateModalOpen(false);
=======
    toast.info(`Redirect to donate for event: ${donation._id}`);
    // You can replace this with modal or route logic
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
  };

  return (
    <>
      <HeaderMid />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[40vh] py-12"
          >
            <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
            <p className="text-base-content/70 text-lg">Loading campaign details...</p>
          </motion.div>
        ) : !donation ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="avatar placeholder">
              <div className="bg-base-300 text-base-content rounded-full w-24">
                <span className="text-3xl">?</span>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mt-4">Campaign not found</h2>
            <p className="text-base-content/70 mt-2">
              The campaign you're looking for might have been removed or doesn't exist.
            </p>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-primary mt-6"
            >
              Go Back
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-base-200 pb-16"
          >
<<<<<<< HEAD
=======
            {/* Campaign Hero */}
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative bg-base-100 py-12"
            >
              <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-start gap-10">
<<<<<<< HEAD
=======
                  {/* Image Column */}
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full md:w-1/2"
                  >
                    <div className="relative overflow-hidden rounded-xl shadow-lg">
                      {donation?.imageUrl ? (
                        <motion.img
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.4 }}
                          src={`http://localhost:8082/${donation.imageUrl}`}
                          alt={donation.name}
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className="bg-base-300 aspect-video flex items-center justify-center">
                          <FiBox className="w-12 h-12 text-base-content/30" />
                        </div>
                      )}
<<<<<<< HEAD
=======
                      
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.div
                          className="badge badge-primary gap-1"
                          whileHover={{ scale: 1.05 }}
                        >
                          <FiCalendar className="h-3 w-3" />
                          Ends {new Date(donation.endingDate).toLocaleDateString()}
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
<<<<<<< HEAD
=======
                  
                  {/* Content Column */}
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="w-full md:w-1/2"
                  >
                    <h1 className="text-3xl md:text-4xl font-bold text-primary">
                      {donation.name}
                    </h1>
<<<<<<< HEAD
=======
                    
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                    <div className="flex items-center gap-2 mt-3">
                      <div className="avatar">
                        <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                          {ngo?.logoUrl ? (
                            <img
                              src={`http://localhost:8082${ngo.logoUrl}`}
                              alt={ngo?.organizationName || ngo?.fullName}
                            />
                          ) : (
                            <span className="text-xs font-bold">
                              {ngo?.organizationName?.charAt(0) || ngo?.fullName?.charAt(0) || "N"}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-base-content/80">
                        By <span className="font-medium">{ngo?.organizationName || ngo?.fullName || 'Unknown Organization'}</span>
                      </span>
                    </div>
<<<<<<< HEAD
=======
                    
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                    <motion.div 
                      className="prose mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-base-content/80 leading-relaxed">{donation.description}</p>
                    </motion.div>
<<<<<<< HEAD
=======
                    
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                    <div className="mt-8 space-y-3">
                      {donation.location && (
                        <div className="flex items-start gap-2 text-base-content/70">
                          <FiMapPin className="mt-1" />
                          <span>{donation.location}</span>
                        </div>
                      )}
<<<<<<< HEAD
=======
                      
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                      <div className="flex items-start gap-2 text-base-content/70">
                        <FiCalendar className="mt-1" />
                        <span>
                          Campaign ends on{' '}
                          <span className="font-medium">
                            {new Date(donation.endingDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </span>
                      </div>
                    </div>
<<<<<<< HEAD
=======
                    
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                    {['restaurant', 'supermarket'].includes(user?.role) && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn btn-primary btn-lg mt-8 gap-2"
                        onClick={handleDonateClick}
                      >
                        <FiBox /> Donate to This Campaign
                      </motion.button>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.section>
<<<<<<< HEAD
=======

            {/* Campaign Stats */}
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="py-8"
            >
              <div className="max-w-4xl mx-auto px-4">
                <div className="stats stats-vertical md:stats-horizontal shadow w-full bg-base-100">
                  <div className="stat">
                    <div className="stat-title">Campaign Status</div>
                    <div className="stat-value">
                      <span className="badge badge-success">Active</span>
                    </div>
                  </div>
<<<<<<< HEAD
=======
                  
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                  <div className="stat">
                    <div className="stat-title">Start Date</div>
                    <div className="stat-value text-xl">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </div>
                  </div>
<<<<<<< HEAD
=======
                  
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                  <div className="stat">
                    <div className="stat-title">End Date</div>
                    <div className="stat-value text-xl text-primary">
                      {new Date(donation.endingDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
<<<<<<< HEAD
=======

            {/* Organization Details */}
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="py-10"
            >
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-bold mb-8 text-center">About the Organizer</h2>
<<<<<<< HEAD
=======
                
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="card bg-base-100 shadow-lg overflow-hidden"
                >
                  <div className="card-body p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <motion.div 
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        transition={{ duration: 0.3 }}
                        className="avatar"
                      >
                        <div className="w-32 h-32 rounded-xl ring ring-primary ring-offset-base-100 ring-offset-2">
                          {ngo?.logoUrl ? (
                            <img
                              src={`http://localhost:8082${ngo.logoUrl}`}
                              alt="NGO logo"
                              className="object-cover"
                            />
                          ) : (
                            <div className="bg-primary text-primary-content font-bold text-3xl flex items-center justify-center">
                              {ngo?.organizationName?.charAt(0) || ngo?.fullName?.charAt(0) || "N"}
                            </div>
                          )}
                        </div>
                      </motion.div>
<<<<<<< HEAD
=======
                      
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-primary mb-2">
                          {ngo?.organizationName || ngo?.fullName}
                        </h3>
<<<<<<< HEAD
=======
                        
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                        {ngo?.mission && (
                          <p className="italic text-base-content/60 mb-3">
                            "{ngo.mission}"
                          </p>
                        )}
<<<<<<< HEAD
=======
                        
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                        {ngo?.description && (
                          <div className="prose mt-4 max-w-full">
                            <p>{ngo.description}</p>
                          </div>
                        )}
<<<<<<< HEAD
=======
                        
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                        <div className="flex flex-wrap gap-2 mt-6">
                          {ngo?.website && (
                            <motion.a
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              href={ngo.website}
                              className="btn btn-outline btn-sm gap-2"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FiGlobe /> Website
                            </motion.a>
                          )}
<<<<<<< HEAD
=======
                          
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                          {ngo?.instagram && (
                            <motion.a 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              href={ngo.instagram} 
                              className="btn btn-outline btn-sm btn-secondary gap-2"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FiInstagram /> Instagram
                            </motion.a>
                          )}
<<<<<<< HEAD
=======
                          
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                          {ngo?.twitter && (
                            <motion.a 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              href={ngo.twitter} 
                              className="btn btn-outline btn-sm btn-accent gap-2"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FiTwitter /> Twitter
                            </motion.a>
                          )}
<<<<<<< HEAD
=======
                          
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-outline btn-sm gap-2"
                            onClick={() => {
                              navigator.share && navigator.share({
                                title: donation.name,
                                text: donation.description,
                                url: window.location.href
                              }).catch(err => console.log('Share failed:', err));
                            }}
                          >
                            <FiShare2 /> Share
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

<<<<<<< HEAD
      <AnimatePresence>
        {donateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={handleCloseModal}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <AddFoodToDonation
                donationId={id}
                businessId={user?._id || ''}
                onClose={handleCloseModal}
                onFoodAdded={handleFoodAdded}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

=======
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
      <Footer />
    </>
  );
};

<<<<<<< HEAD
export default CharityEventDetails;
=======
export default CharityEventDetails;
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
