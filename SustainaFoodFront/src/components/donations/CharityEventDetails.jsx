import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import axiosInstance from '../../config/axiosInstance';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiMapPin, FiGlobe, FiShare2, FiInstagram, FiTwitter, FiBox } from 'react-icons/fi';

const CharityEventDetails = () => {
  const { id } = useParams(); // donation ID from route
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [donation, setDonation] = useState(null);
  const [ngo, setNgo] = useState(null);

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
    toast.info(`Redirect to donate for event: ${donation._id}`);
    // You can replace this with modal or route logic
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
            className="flex flex-col items-center justify-center min-h-[40vh] py-16"
          >
            {/* Enhanced creative loading animation */}
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 2,
                  ease: "linear",
                  repeat: Infinity,
                }}
                className="w-24 h-24"
              >
                <div className="absolute top-0 left-0 w-8 h-8 bg-green-500 rounded-full opacity-90"></div>
                <div className="absolute top-0 right-0 w-8 h-8 bg-green-600 rounded-full opacity-80"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full opacity-70"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 bg-teal-500 rounded-full opacity-60"></div>
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-3 rounded-full shadow-md">
                  <FiBox className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
            <div className="mt-8 bg-white px-5 py-2 rounded-full shadow-md">
              <p className="text-gray-600 inline-flex items-center gap-2 font-medium">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-green-500 rounded-full inline-block"
                ></motion.span>
                Loading campaign details
              </p>
            </div>
          </motion.div>
        ) : !donation ? (
          // Not found state - with more creative design
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white"
          >
            <div className="max-w-md mx-auto bg-white p-10 rounded-2xl shadow-xl text-center relative overflow-hidden border border-gray-100">
              {/* Decorative design elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-50 rounded-full"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-50 rounded-full"></div>
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner overflow-hidden">
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: [-5, 20, -5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <svg className="w-14 h-14 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                </div>
              </div>
              <div className="relative">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900 mb-2">Campaign not found</h2>
                <p className="text-gray-600 mb-8">
                  The campaign you're looking for might have been removed or doesn't exist.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.history.back()}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-md hover:shadow-lg transition-all font-medium"
                >
                  Go Back
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white pb-16 overflow-hidden"
          >
            {/* Campaign Hero with Ultra-Creative Design */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative pt-20 pb-28 overflow-hidden"
            >
              {/* Enhanced decorative background elements */}
              <div className="absolute inset-0 overflow-hidden z-0">
                <div className="absolute left-1/2 top-28 w-1/2 h-1/2 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 transform -translate-x-1/2"></div>
                <div className="absolute right-1/4 bottom-10 w-1/3 h-1/3 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute left-1/4 -bottom-20 w-1/4 h-1/4 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
              
                {/* Creative floating shapes */}
                <motion.div 
                  animate={{ 
                    y: [0, -15, 0], 
                    rotate: [0, 5, 0], 
                    opacity: [0.2, 0.3, 0.2] 
                  }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute right-1/4 top-1/3 w-20 h-20 border-4 border-green-300/30 rounded-xl"
                ></motion.div>
                <motion.div 
                  animate={{ 
                    y: [0, 15, 0], 
                    rotate: [0, -5, 0], 
                    opacity: [0.15, 0.25, 0.15] 
                  }}
                  transition={{ 
                    duration: 12, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1 
                  }}
                  className="absolute left-1/3 top-1/4 w-16 h-16 border-4 border-emerald-300/30 rounded-full"
                ></motion.div>
              </div>

              <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-start gap-10">
                  {/* Image Column with enhanced creative design */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full md:w-1/2"
                  >
                    <div className="relative perspective-1000">
                      <motion.div
                        whileHover={{ rotateY: 5, rotateX: -5 }}
                        transition={{ duration: 0.5 }}
                        className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_84,_0.15)] border-8 border-white"
                      >
                        {donation?.imageUrl ? (
                          <motion.img
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.8 }}
                            src={`http://localhost:8082/${donation.imageUrl}`}
                            alt={donation.name}
                            className="w-full aspect-video object-cover transition-transform duration-700"
                          />
                        ) : (
                          <div className="bg-gradient-to-br from-green-500 to-teal-600 aspect-video flex items-center justify-center">
                            <FiBox className="w-20 h-20 text-white/30" />
                          </div>
                        )}
                        
                        {/* Enhanced image overlay with glowing effect */}
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 via-black/40 to-transparent"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <motion.div
                            className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-green-800 rounded-full text-sm font-medium inline-flex items-center gap-2 shadow-[0_0_15px_rgba(16,_185,_129,_0.3)]"
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)" }}
                          >
                            <FiCalendar className="h-3.5 w-3.5" />
                            Campaign ends {new Date(donation.endingDate).toLocaleDateString()}
                          </motion.div>
                        </motion.div>
                        
                        {/* Enhanced status indicator with glowing effect */}
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold shadow-lg shadow-green-200/50 border border-green-200">
                          <span className="flex items-center gap-1.5">
                            <motion.span 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 bg-green-500 rounded-full inline-block"
                            ></motion.span>
                            Active Campaign
                          </span>
                        </div>
                      </motion.div>
                      
                      {/* Decorative corner accents */}
                      <div className="absolute -top-3 -left-3 w-10 h-10 border-t-4 border-l-4 border-green-400 rounded-tl-xl"></div>
                      <div className="absolute -bottom-3 -right-3 w-10 h-10 border-b-4 border-r-4 border-green-400 rounded-br-xl"></div>
                    </div>
                    
                    {/* Campaign Stats with enhanced 3D-style cards */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                      <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        className="bg-white rounded-xl p-4 shadow-md border border-gray-50 transition-all"
                      >
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <div className="flex items-center gap-2">
                          <motion.div 
                            animate={{ boxShadow: ['0 0 0px #10b981', '0 0 10px #10b981', '0 0 0px #10b981'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-3 h-3 bg-green-500 rounded-full"
                          ></motion.div>
                          <span className="font-semibold text-gray-800">Active</span>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        className="bg-white rounded-xl p-4 shadow-md border border-gray-50 transition-all"
                      >
                        <div className="text-xs text-gray-500 mb-1">Started</div>
                        <div className="font-semibold text-gray-800">
                          {new Date(donation.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        className="bg-white rounded-xl p-4 shadow-md border border-gray-50 transition-all"
                      >
                        <div className="text-xs text-gray-500 mb-1">Ends</div>
                        <div className="font-semibold text-green-700">
                          {new Date(donation.endingDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Content Column with enhanced creative design */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="w-full md:w-1/2"
                  >
                    {/* Enhanced title with border accent */}
                    <div className="relative">
                      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4 pl-2">
                        {donation.name}
                      </h1>
                    </div>
                    
                    {/* Organizer badge with enhanced design */}
                    <div className="inline-flex items-center gap-3 mb-8 bg-gradient-to-r from-gray-50 to-white p-2 pr-5 rounded-full shadow-md border border-gray-100">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md border-2 border-green-500">
                        {ngo?.logoUrl ? (
                          <img
                            src={`http://localhost:8082${ngo.logoUrl}`}
                            alt={ngo?.organizationName || ngo?.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="bg-gradient-to-br from-green-100 to-green-200 w-full h-full flex items-center justify-center font-bold text-green-800">
                            {ngo?.organizationName?.charAt(0) || ngo?.fullName?.charAt(0) || "N"}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Organized by</div>
                        <div className="font-medium text-gray-800">
                          {ngo?.organizationName || ngo?.fullName || 'Unknown Organization'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Description with creative line height and styles */}
                    <motion.div 
                      className="prose max-w-none relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="absolute -left-4 h-full w-0.5 bg-gray-100 rounded-full"></div>
                      <p className="text-gray-600 leading-relaxed text-lg pl-4">{donation.description}</p>
                    </motion.div>
                    
                    {/* Enhanced info cards with 3D effect */}
                    <div className="mt-10 space-y-4">
                      {donation.location && (
                        <motion.div 
                          whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                          className="flex items-center gap-4 bg-gradient-to-br from-gray-50 to-white px-5 py-4 rounded-xl shadow-md border border-gray-100 transition-all"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <FiMapPin className="w-5 h-5 text-green-700" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Location</div>
                            <div className="font-medium text-gray-800">{donation.location}</div>
                          </div>
                        </motion.div>
                      )}
                      
                      <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        className="flex items-center gap-4 bg-gradient-to-br from-gray-50 to-white px-5 py-4 rounded-xl shadow-md border border-gray-100 transition-all"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0 shadow-inner">
                          <FiCalendar className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Campaign Timeline</div>
                          <div className="font-medium text-gray-800">
                            Ends on <span className="text-green-700">{new Date(donation.endingDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Enhanced donate button with animated highlight effect */}
                    {['restaurant', 'supermarket'].includes(user?.role) && (
                      <motion.div
                        className="mt-10 relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <motion.div 
                          animate={{ 
                            boxShadow: [
                              '0 0 0 0 rgba(16, 185, 129, 0)',
                              '0 0 0 10px rgba(16, 185, 129, 0.1)',
                              '0 0 0 20px rgba(16, 185, 129, 0)',
                            ] 
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-xl"
                        ></motion.div>
                        <motion.button
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-xl hover:shadow-green-200/40 transition-all font-medium flex items-center justify-center gap-3 relative overflow-hidden group"
                          onClick={handleDonateClick}
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                          <FiBox className="w-6 h-6" /> 
                          <span className="text-lg">Donate to This Campaign</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.section>

            {/* Organization Details - Ultra-creative redesign */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="py-16 relative"
            >
              {/* Decorative elements */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-200 to-emerald-300 opacity-70"></div>
                <div className="absolute -right-14 top-0 w-64 h-64 rounded-full border-16 border-green-100 opacity-30"></div>
                <div className="absolute -left-14 bottom-0 w-64 h-64 rounded-full border-16 border-emerald-100 opacity-30"></div>
              </div>
              
              <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="flex items-center justify-center gap-3 mb-10">
                  <div className="h-px bg-gray-200 w-20"></div>
                  <h2 className="text-2xl font-bold text-gray-800">About the Organization</h2>
                  <div className="h-px bg-gray-200 w-20"></div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                  <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <motion.div 
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        <div className="w-36 h-36 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-green-500 to-emerald-600">
                          {ngo?.logoUrl ? (
                            <img
                              src={`http://localhost:8082${ngo.logoUrl}`}
                              alt="NGO logo"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                              {ngo?.organizationName?.charAt(0) || ngo?.fullName?.charAt(0) || "N"}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </motion.div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-3 md:text-left text-center">
                          {ngo?.organizationName || ngo?.fullName}
                        </h3>
                        
                        {ngo?.mission && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4 relative">
                            <div className="absolute -top-2 -left-2 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                            </div>
                            <p className="italic text-gray-600">
                              "{ngo.mission}"
                            </p>
                          </div>
                        )}
                        
                        {ngo?.description && (
                          <div className="text-gray-600 mt-4 leading-relaxed">
                            <p>{ngo.description}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-3 mt-8">
                          {ngo?.website && (
                            <motion.a
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              href={ngo.website}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FiGlobe className="text-green-700" /> Website
                            </motion.a>
                          )}
                          
                          {ngo?.instagram && (
                            <motion.a 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              href={ngo.instagram} 
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FiInstagram /> Instagram
                            </motion.a>
                          )}
                          
                          {ngo?.twitter && (
                            <motion.a 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              href={ngo.twitter} 
                              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:shadow-md transition-all"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FiTwitter /> Twitter
                            </motion.a>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ml-auto"
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

      <Footer />
    </>
  );
};

export default CharityEventDetails;
