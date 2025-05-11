import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import RouteDetails from "./RouteDetails";
import HeaderMid from "../HeaderMid";
import { motion } from "framer-motion";
import { FiMap, FiMapPin, FiNavigation, FiActivity, FiPackage, FiTruck, FiMapPin as FiLocation, FiCheck } from "react-icons/fi";

const RouteDetailsPage = () => {
  const { foodId } = useParams();
  const [food, setFood] = useState(null);
  const [destinationUser, setDestinationUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        // Fetch the food item
        const res = await axiosInstance.get(`/donations/food/${foodId}`);
        const foodData = res.data;
        setFood(foodData);

        // Determine if it's pickup or delivery
        const isPickup = foodData.status === "assigned" || foodData.status === "pending";
        const targetId = isPickup
            ? foodData.buisiness_id?._id
            : foodData.donationId?.ngoId?._id;


        if (!targetId) {
          throw new Error("Destination user ID not found.");
        }

        // Fetch destination user by ID
        const userRes = await axiosInstance.get(`/user/${targetId}`);
        setDestinationUser(userRes.data);
      } catch (err) {
        console.error("Error fetching route details:", err);
      } finally {
        setLoading(false);
      }
    };

    // Get volunteer's browser location
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => {
        console.error("Geolocation error:", err);
        setLoading(false);
      }
    );

    fetchRouteData();
  }, [foodId]);

  if (loading || !food || !destinationUser || !userLocation) {
    return (
      <>
        <HeaderMid />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 overflow-hidden relative">
          {/* Animated map grid background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1">
              {Array.from({ length: 144 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="bg-green-900 rounded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: Math.random() * 0.2 + 0.1 }}
                  transition={{ 
                    duration: Math.random() * 3 + 2, 
                    repeat: Infinity,
                    repeatType: 'reverse' 
                  }}
                ></motion.div>
              ))}
            </div>
          </div>
            
          {/* Route line animation */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <motion.path
                d="M10,80 C30,30 60,60 90,20"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeWidth="0.5"
                strokeDasharray="0 1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
              />
              <motion.path
                d="M10,20 C40,90 60,10 90,70"
                stroke="rgba(16, 185, 129, 0.2)"
                strokeWidth="0.4"
                strokeDasharray="0 1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 0.5 }}
              />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
            {/* Creative loading animation */}
            <motion.div 
              className="flex flex-col items-center justify-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* 3D animated map pin */}
              <div className="relative mb-12 h-40 w-40">
                <motion.div
                  animate={{ 
                    rotateY: [0, 360],
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl flex items-center justify-center">
                      <FiMap className="w-14 h-14 text-white" />
                    </div>
                  </div>
                  {/* Pin shadow */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-black/10 rounded-full blur-md"
                  ></motion.div>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-3">Plotting Your Journey</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  We're calculating the optimal route for your mission. Connecting coordinates and creating the perfect path.
                </p>
                
                {/* Text ticker animation */}
                <div className="bg-white/80 backdrop-blur-sm py-2 px-4 rounded-lg shadow-inner max-w-md mx-auto overflow-hidden">
                  <motion.div
                    animate={{ x: [-300, 300] }}
                    transition={{ 
                      duration: 10,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                    className="whitespace-nowrap text-sm text-green-700 font-medium"
                  >
                    Finding fastest route • Calculating distance • Optimizing waypoints • Analyzing traffic patterns • Preparing navigation data
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Progress animation */}
              <motion.div 
                className="mt-12 w-64 h-2 bg-gray-200 rounded-full overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    repeatType: "loop",
                    repeatDelay: 0.5
                  }}
                ></motion.div>
              </motion.div>
              
              {/* Floating icons */}
              <div className="relative mt-12 h-32 w-full max-w-md mx-auto">
                {[FiMapPin, FiNavigation, FiTruck, FiPackage, FiLocation].map((Icon, index) => (
                  <motion.div
                    key={index}
                    className="absolute"
                    style={{ 
                      left: `${index * 20 + 5}%`, 
                      top: `${(index % 3) * 20 + 10}%` 
                    }}
                    animate={{ 
                      y: [0, -15, 0],
                      opacity: [0.4, 1, 0.4],
                      rotate: [0, index % 2 ? 10 : -10, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      delay: index * 0.2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <div className="p-3 bg-white rounded-full shadow-lg">
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderMid />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
          <svg className="w-full h-full absolute" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#047857" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <path
              d="M0,20 Q25,40 50,10 T100,30 L100,100 L0,100 Z"
              fill="url(#routeGradient)"
              opacity="0.3"
            />
          </svg>
          
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-px opacity-10">
            {Array.from({ length: 72 }).map((_, i) => (
              <div key={i} className="bg-green-900 relative">
                {Math.random() > 0.9 && (
                  <motion.div
                    className="absolute inset-0 bg-green-400"
                    animate={{ opacity: [0, 0.8, 0] }}
                    transition={{ 
                      duration: Math.random() * 3 + 1, 
                      repeat: Infinity,
                      repeatDelay: Math.random() * 5
                    }}
                  ></motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          {/* Interactive 3D header section */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl overflow-hidden py-6 px-8 shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* 3D route animation */}
              <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <motion.path
                    d="M10,50 Q30,20 50,50 T90,50"
                    stroke="white"
                    strokeWidth="3"
                    fill="none"
                    initial={{ pathLength: 0, pathOffset: 0 }}
                    animate={{ pathLength: 1, pathOffset: 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  <motion.circle 
                    cx="10" cy="50" r="3" 
                    fill="white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  />
                  <motion.circle 
                    cx="90" cy="50" r="3" 
                    fill="white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                  />
                  <motion.circle 
                    cx="0" cy="0" r="2" 
                    fill="white"
                    initial={{ cx: 10, cy: 50 }}
                    animate={{ cx: 90, cy: 50 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </svg>
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <motion.h1 
                    className="text-2xl md:text-3xl font-bold text-white mb-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {food.status === "assigned" || food.status === "pending" ? "Pickup Route" : "Delivery Route"}
                  </motion.h1>
                  <motion.p 
                    className="text-green-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {food.status === "assigned" || food.status === "pending" 
                      ? "Navigation to pickup location" 
                      : "Navigation to delivery destination"}
                  </motion.p>
                </div>
                
                <motion.div 
                  className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg py-2 px-4 pr-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/30">
                    {food.status === "assigned" ? (
                      <FiPackage className="w-5 h-5 text-white" />
                    ) : food.status === "picked-up" ? (
                      <FiTruck className="w-5 h-5 text-white" />
                    ) : (
                      <FiCheck className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <span className="text-white font-medium">
                      {food.status === "assigned" ? "Ready for Pickup" : 
                       food.status === "picked-up" ? "In Transit" : 
                       food.status === "delivered" ? "Delivered" : "Pending"}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-300"></span>
                      </span>
                      <span className="text-xs text-green-100">Live tracking</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* 3D Floating Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-green-100 relative overflow-hidden"
            whileHover={{ 
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-200 to-green-50 rounded-full -translate-y-1/2 translate-x-1/4 opacity-50 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200 to-emerald-50 rounded-full translate-y-1/3 -translate-x-1/4 opacity-50 blur-xl"></div>
            
            {/* Main content */}
            <div className="relative z-10">
              <RouteDetails
                food={food}
                destinationUser={destinationUser}
                userLocation={userLocation}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RouteDetailsPage;
