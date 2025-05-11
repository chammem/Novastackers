import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import axiosInstance from '../../config/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import HeaderMid from '../HeaderMid';
import { FiShoppingBag, FiClock, FiMapPin, FiAlertCircle } from 'react-icons/fi';
import Footer from '../Footer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

const FoodSalePage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState(false); // Debug state for troubleshooting
  const navigate = useNavigate();
  const { user } = useAuth();

  // Debug function to help diagnose image issues
  const logItemDetails = (item) => {
    if (debug) {
      console.group("Food Item Details");
      console.log("Item ID:", item._id);
      console.log("Item image property:", item.image);
      console.log("FoodItem object:", item.foodItem);
      console.log("Full item:", item);
      console.groupEnd();
    }
  };

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axiosInstance.get('/food-sale');
        console.log("API Response:", response.data); // Log the entire response
        
        const items = response.data.data || [];
        setFoodItems(items);
        
        // Log sample item for debugging
        if (items.length > 0) {
          console.log("Sample item structure:", items[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching food items:", err);
        toast.error("Failed to load food items");
        setError("Failed to load food items. Please try again later.");
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  // Format expiry date to readable format
  const formatExpiryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Calculate time remaining until expiry
  const getTimeRemaining = (expiryDate) => {
    if (!expiryDate) return "No expiry date";
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut" 
      } 
    })
  };

  // Function to get image URL with multiple fallbacks - fixed double URL issue
  const getImageUrl = (item) => {
    // Log this item for debugging
    logItemDetails(item);
    
    // Try different possible image path locations
    let imagePath = '';
    
    if (item.image) {
      imagePath = item.image;
    } else if (item.foodItem?.image_url) {
      imagePath = item.foodItem.image_url;
    } else if (item.foodItem?.image) {
      imagePath = item.foodItem.image;
    }
    
    // If we found no image path, return null
    if (!imagePath) return null;
    
    // Check if the image path already contains the full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath; // Return as is if it's already a full URL
    }
    
    // Clean up the path - remove any leading slashes
    imagePath = imagePath.replace(/^\/+/, '');
    
    // Log what image paths we've found
    if (debug) {
      console.log("Found image path:", imagePath);
    }
    
    // Return the full URL
    return `${API_BASE_URL}/${imagePath}`;
  };

  if (loading) {
    return (
      <>
        <HeaderMid/>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-white flex justify-center items-center relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 z-0">
            <motion.div 
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-100 rounded-full opacity-40 filter blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-100 rounded-full opacity-30 filter blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </div>
          
          <motion.div 
            className="text-center relative z-10 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Creative food-themed loading animation */}
            <div className="relative">
              <div className="relative w-32 h-32 mx-auto mb-8">
                {/* Outer spinning ring */}
                <motion.div 
                  className="absolute inset-0 border-4 border-emerald-200 border-t-emerald-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Pulsing inner container */}
                <motion.div 
                  className="absolute inset-5 bg-white rounded-full shadow-inner flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FiShoppingBag className="text-emerald-600 w-10 h-10" />
                  </motion.div>
                </motion.div>
                
                {/* Floating food icons */}
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-md"
                  animate={{ 
                    y: [0, -15, 0],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <span className="text-white text-xs">🍎</span>
                </motion.div>
                
                <motion.div
                  className="absolute -bottom-3 -left-3 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md"
                  animate={{ 
                    y: [0, -10, 0],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                >
                  <span className="text-white text-xs">🥦</span>
                </motion.div>
                
                <motion.div
                  className="absolute top-6 -left-5 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center shadow-md"
                  animate={{ 
                    y: [0, -8, 0],
                    opacity: [0.6, 0.9, 0.6],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.7 }}
                >
                  <span className="text-white text-xs">🍓</span>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <h3 className="text-xl font-bold text-emerald-700 mb-2">Finding Fresh Deals</h3>
                <p className="text-emerald-600 font-medium max-w-md mx-auto">
                  Preparing delicious opportunities to reduce food waste
                </p>
              </motion.div>
              
              {/* Gradient progress bar */}
              <motion.div 
                className="mt-8 h-1.5 w-48 bg-gray-200 rounded-full mx-auto overflow-hidden"
              >
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500"
                  animate={{ width: ["10%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-white flex justify-center items-center p-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full opacity-20 transform translate-x-1/3 -translate-y-1/4 filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100 rounded-full opacity-20 transform -translate-x-1/3 translate-y-1/4 filter blur-3xl"></div>
        
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-red-100 relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-24 h-24 mx-auto bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner"
            animate={{ 
              boxShadow: ['0 0 0 rgba(239, 68, 68, 0.2)', '0 0 20px rgba(239, 68, 68, 0.5)', '0 0 0 rgba(239, 68, 68, 0.2)'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <FiAlertCircle className="text-red-500 w-12 h-12" />
            </motion.div>
          </motion.div>
          
          <h3 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            Something Went Wrong
          </h3>
          
          <p className="text-gray-600 text-center mb-6 leading-relaxed">
            {error}
          </p>
          
          <div className="flex justify-center">
            <motion.button 
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
            >
              Try Again
            </motion.button>
          </div>
          
          {/* Decorative pattern */}
          <div className="absolute -bottom-4 right-10 w-20 h-20 text-red-100 transform rotate-12 -z-10">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 L100 50 L50 100 L0 50 Z" />
            </svg>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
    <HeaderMid/>
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Available Food Deals</h1>
        {user && (user.role === "restaurant" || user.role === "supermarket") && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/add-food-sale')}
          >
            Add Food For Sale
          </button>
        )}
      </div>

      {foodItems.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-xl text-gray-500">No food items available for sale at this moment</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map((item, index) => (
            <motion.div
              key={item._id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ scale: 1.03 }}
              className="card bg-base-100 shadow-xl overflow-hidden"
            >
              {item.foodItem && (item.foodItem.image_url || item.foodItem.image || item.image) ? (
                <figure className="h-48 w-full relative">
                  <img 
                    src={item.foodItem?.image_url || item.foodItem?.image || item.image} 
                    alt={item.foodItem?.name || "Food item"} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/600x400?text=No+Image";
                    }}
                  />
                  <div className="absolute top-2 right-2 badge badge-accent p-3">
                    ${item.discountedPrice || item.price}
                  </div>
                </figure>
              ) : (
                <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                  <FiShoppingBag size={40} className="text-gray-400" />
                  <div className="absolute top-2 right-2 badge badge-accent p-3">
                    ${item.discountedPrice || item.price}
                  </div>
                </div>
              )}
              
              <div className="card-body">
                <h2 className="card-title">{item.foodItem.name}</h2>
                
                {item.discountedPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-accent">${item.discountedPrice}</span>
                    <span className="text-sm line-through text-gray-500">${item.price}</span>
                    <span className="badge badge-secondary">
                      {Math.round((1 - item.discountedPrice / item.price) * 100)}% off
                    </span>
                  </div>
                )}
                
                {!item.discountedPrice && (
                  <p className="text-lg font-semibold text-accent">${item.price}</p>
                )}
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {item.foodItem.category && <span className="badge badge-outline mr-2">{item.foodItem.category}</span>}
                    {item.foodItem.size && <span className="badge badge-outline">{item.foodItem.size}</span>}
                  </p>
                </div>
                
                {item.foodItem.allergens && (
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Allergens:</span> {item.foodItem.allergens}
                  </p>
                )}
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2 text-warning">
                    <FiClock />
                    <span className="text-sm font-medium">
                      {getTimeRemaining(item.expiresAt || item.foodItem.expiry_date)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {item.quantityAvailable} available
                  </span>
                </div>
                <div className="flex flex-col mt-3 pt-3 border-t border-base-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="avatar">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                  {item.foodItem.buisiness_id ? item.foodItem.buisiness_id.toString()[0].toUpperCase() : "R"}
                </div>
              </div>
              <span className="text-sm font-medium truncate">
                {item.businessName || "View restaurant details"}
              </span>
            </div>
            <motion.button 
              className="btn btn-sm btn-outline btn-secondary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/restaurant/${item.foodItem.buisiness_id}`);
              }}
            >
              <FiMapPin className="mr-1" /> View Business Details
            </motion.button>
          </div>

         <div className="card-actions mt-3">
          <button 
            className="btn btn-primary btn-sm btn-block"
            onClick={(e) => {
              e.preventDefault(); // Prevent any default behavior
              console.log("Navigating to:", `/order-confirmation/${item._id}`);
              navigate(`/order-confirmation/${item._id}`);
            }}
          >
            Order Now
          </button>
        </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
      <HeaderMid/>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white pb-16">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-40 right-10 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-40 left-10 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        
        {/* Enhanced Hero Section with Gradient Background */}
        <div className="container mx-auto px-4 relative z-10 py-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl mb-12"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700"></div>
            
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute right-0 -bottom-20 w-96 h-96 bg-white rounded-full"></div>
              <div className="absolute -left-20 -top-20 w-64 h-64 border-4 border-white/30 rounded-full"></div>
              <div className="absolute left-1/3 bottom-0 w-12 h-12 bg-white/20 rounded-full"></div>
            </div>
            
            <div className="relative z-10 py-10 px-8 md:px-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto text-center max-w-3xl"
              >
                <div className="flex justify-center mb-3">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                    <FiShoppingBag className="text-white w-8 h-8" />
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Fresh Food Deals
                </h1>
                <p className="text-emerald-50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                  Discover delicious food at discounted prices while helping reduce food waste
                </p>
                
                <div className="flex flex-wrap justify-center mt-8 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full flex items-center gap-2">
                    <FiClock className="text-white" />
                    <span className="text-white">Limited Time Offers</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full flex items-center gap-2">
                    <FiShoppingBag className="text-white" />
                    <span className="text-white">Quality Food</span>
                  </div>
                  
                  {user && (user.role === "restaurant" || user.role === "supermarket") && (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-emerald-700 py-2 px-5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                      onClick={() => navigate('/add-food-sale')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 0 011 1v5h5a1 0 110 2h-5v5a1 0 11-2 0v-5H4a1 0 110-2h5V4a1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Food For Sale
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Debug toggle button if needed */}
          {debug && (
            <div className="flex justify-end mb-6">
              <button 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
                onClick={() => setDebug(!debug)}
              >
                {debug ? "Hide Debug" : "Debug"}
              </button>
            </div>
          )}

          {/* Main content continues here */}
          {foodItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto border border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiShoppingBag className="text-gray-300 w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">No Food Items Available</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                There are currently no discounted food items available. Please check back later for new deals.
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-emerald-300 to-green-300 mx-auto rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {foodItems.map((item, index) => {
                // Get image URL using our helper function
                const imageUrl = getImageUrl(item);
                
                // Calculate discount percentage for badge
                const discountPercent = item.discountedPrice 
                  ? Math.round((1 - item.discountedPrice / item.price) * 100) 
                  : 0;
                
                return (
                  <motion.div
                    key={item._id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    whileHover={{ 
                      y: -10,
                      boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)",
                      borderColor: "#10b981"
                    }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col transition-all duration-300"
                  >
                    {/* Debug info display */}
                    {debug && (
                      <div className="absolute top-0 left-0 right-0 bg-black/80 text-white p-2 z-50 text-xs">
                        <details>
                          <summary className="cursor-pointer">Image Debug Info</summary>
                          <div className="mt-2 overflow-auto max-h-40">
                            <p>Image Path: {imageUrl || 'None'}</p>
                            <p>Item ID: {item._id}</p>
                            <p>Item.image: {item.image || 'Not found'}</p>
                            <p>FoodItem.image_url: {item.foodItem?.image_url || 'Not found'}</p>
                          </div>
                        </details>
                      </div>
                    )}
                    
                    {/* Enhanced image display */}
                    <div className="relative">
                      <div className="h-56 w-full relative overflow-hidden">
                        {imageUrl ? (
                          <>
                            <img 
                              src={imageUrl}
                              alt={item.foodItem?.name || 'Food item'} 
                              className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                              onError={(e) => {
                                console.error("Failed to load image:", imageUrl);
                                e.target.style.display = 'none';
                                
                                // Create fallback element
                                const fallback = document.createElement('div');
                                fallback.className = "h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100";
                                fallback.innerHTML = `
                                  <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 mb-2" height="40" width="40" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                  </svg>
                                  <span class="text-xs text-gray-500">Image not available</span>
                                `;
                                e.target.parentElement.appendChild(fallback);
                              }}
                            />
                          </>
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center">
                            <FiShoppingBag size={40} className="text-gray-300 mb-2" />
                            <span className="text-xs text-gray-500">No image available</span>
                          </div>
                        )}
                        
                        {/* Price badge with enhanced styling */}
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center gap-2">
                            {item.discountedPrice && (
                              <div className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                -{discountPercent}%
                              </div>
                            )}
                            <div className="bg-white/90 backdrop-blur-sm text-emerald-800 px-3 py-1 rounded-full text-sm font-bold shadow-md">
                              ${item.discountedPrice || item.price}
                            </div>
                          </div>
                        </div>
                        
                        {/* Time remaining badge */}
                        <div className="absolute bottom-3 left-3">
                          <div className="bg-amber-400/90 backdrop-blur-sm text-amber-900 px-3 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                            <FiClock size={12} />
                            {getTimeRemaining(
                              item.expiresAt || (item.foodItem ? item.foodItem.expiry_date : null)
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced content area */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {item.foodItem ? item.foodItem.name : 'Unnamed Item'}
                        </h3>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.foodItem && item.foodItem.category && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-medium">
                              {item.foodItem.category}
                            </span>
                          )}
                          {item.foodItem && item.foodItem.size && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                              {item.foodItem.size}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Price display with better styling */}
                      {item.discountedPrice && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-emerald-600">${item.discountedPrice}</span>
                            <span className="text-sm line-through text-gray-400 font-medium">${item.price}</span>
                          </div>
                        </div>
                      )}
                      
                      {!item.discountedPrice && (
                        <div className="mb-4">
                          <span className="text-2xl font-bold text-emerald-600">${item.price}</span>
                        </div>
                      )}
                      
                      {item.foodItem && item.foodItem.allergens && (
                        <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <span className="font-semibold">Allergens:</span> {item.foodItem.allergens}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-emerald-700 font-medium">
                          {item.quantityAvailable} available
                        </span>
                      </div>
                      
                      {/* Business info with enhanced styling */}
                      <div className="mt-auto">
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-green-500 text-white flex items-center justify-center font-medium">
                                {item.foodItem && item.foodItem.buisiness_id 
                                  ? (typeof item.foodItem.buisiness_id === 'string' 
                                      ? item.foodItem.buisiness_id[0].toUpperCase() 
                                      : "R")
                                  : "R"}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700 block">
                                {item.businessName || "Restaurant"}
                              </span>
                              <motion.button 
                                className="text-sm text-emerald-600 flex items-center gap-1"
                                whileHover={{ x: 3 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.foodItem && item.foodItem.buisiness_id) {
                                    navigate(`/restaurant/${item.foodItem.buisiness_id}`);
                                  } else {
                                    toast.warning("Business details not available");
                                  }
                                }}
                              >
                                <FiMapPin className="w-3 h-3" /> View details
                              </motion.button>
                            </div>
                          </div>
                          
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/order-confirmation/${item._id}`);
                            }}
                          >
                            Order Now
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* Debug panel */}
          {debug && (
            <div className="mt-8 p-4 bg-black/10 rounded-lg">
              <h3 className="font-bold">Debug Info:</h3>
              <p>API Base URL: {API_BASE_URL}</p>
              <p>Total Items: {foodItems.length}</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FoodSalePage;