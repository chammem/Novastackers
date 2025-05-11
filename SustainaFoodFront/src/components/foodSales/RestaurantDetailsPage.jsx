import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axiosInstance from '../../config/axiosInstance';
import { 
  FiShoppingBag, 
  FiClock, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiArrowLeft,
  FiPackage,
  FiCalendar
} from 'react-icons/fi';
import HeaderMid from '../HeaderMid';
// Add these imports for Leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const RestaurantDetailsPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add geocoding state
  const [coordinates, setCoordinates] = useState(null);
  
  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await axiosInstance.get(`/food-sale/restaurant/${restaurantId}`);
        setRestaurant(response.data.data.restaurant);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching restaurant details:", err);
        toast.error("Failed to load restaurant details");
        setError("Failed to load restaurant details. Please try again later.");
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [restaurantId]);

  // Fetch restaurant's food items
  useEffect(() => {
    const fetchRestaurantFoodItems = async () => {
      try {
        const response = await axiosInstance.get(`/food-sale/restaurant/${restaurantId}/items`);
        setFoodItems(response.data.data || []);
        setItemsLoading(false);
      } catch (err) {
        console.error("Error fetching restaurant food items:", err);
        toast.error("Failed to load food items from this restaurant");
        setItemsLoading(false);
      }
    };

    if (!loading && restaurant) {
      fetchRestaurantFoodItems();
    }
  }, [restaurantId, loading, restaurant]);

  // Add geocoding function to convert address to coordinates
  useEffect(() => {
    const geocodeAddress = async () => {
      if (!restaurant || !restaurant.address) return;
      
      try {
        // Using OpenStreetMap Nominatim API for geocoding
        const encodedAddress = encodeURIComponent(restaurant.address);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          // If address can't be geocoded, use a default location
          console.warn('Could not geocode address, using default location');
          setCoordinates([51.505, -0.09]); // Default coordinates (London)
        }
      } catch (err) {
        console.error('Error geocoding address:', err);
        // Use default coordinates if geocoding fails
        setCoordinates([51.505, -0.09]);
      }
    };

    if (restaurant) {
      geocodeAddress();
    }
  }, [restaurant]);

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

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

  if (loading) {
    return (
      <>
        <HeaderMid/>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-white flex justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-green-100 rounded-full opacity-40 filter blur-3xl"></div>
            <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-emerald-100 rounded-full opacity-30 filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-4">
              <div className="absolute inset-0 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiMapPin className="text-emerald-600 w-8 h-8" />
              </div>
            </div>
            <p className="text-emerald-700 font-medium">Loading restaurant details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderMid/>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-white flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md border border-red-100">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Something Went Wrong</h3>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <button 
              className="btn btn-error w-full"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderMid/>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white pb-16">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-40 right-10 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-40 left-10 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Back button */}
          <motion.button
            className="group flex items-center mb-6 text-emerald-700 font-medium"
            onClick={() => navigate(-1)}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ x: -3 }}
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 mr-2 group-hover:bg-emerald-200 transition-colors">
              <FiArrowLeft className="text-emerald-700" />
            </span>
            Back to Food Deals
          </motion.button>

          {/* Restaurant Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl mb-12"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute right-0 -bottom-20 w-96 h-96 bg-white rounded-full"></div>
              <div className="absolute -left-20 -top-20 w-64 h-64 border-4 border-white/30 rounded-full"></div>
              <div className="absolute left-1/3 bottom-0 w-12 h-12 bg-white/20 rounded-full"></div>
            </div>
            
            <div className="relative z-10 py-10 px-8 md:px-12">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm p-1.5 shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-3xl font-bold text-white">
                    {restaurant.name ? restaurant.name.charAt(0).toUpperCase() : "R"}
                  </div>
                </div>
                
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className="bg-white/20 backdrop-blur-sm py-1 px-4 rounded-full text-white text-sm">
                      {restaurant.businessType || "Restaurant"}
                    </div>
                    {restaurant.itemCount > 0 && (
                      <div className="bg-white/20 backdrop-blur-sm py-1 px-4 rounded-full text-white text-sm flex items-center">
                        <FiPackage className="mr-1" size={14} />
                        {restaurant.itemCount} item{restaurant.itemCount !== 1 ? 's' : ''} for sale
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Restaurant Info and Map Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Information */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <FiPhone className="mr-2 text-emerald-600" />
                  Contact Information
                </h2>
                
                <div className="space-y-5">
                  {restaurant.address && (
                    <div className="flex">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4 flex-shrink-0">
                        <FiMapPin className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Address</p>
                        <p className="text-gray-700">{restaurant.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {restaurant.phone && (
                    <div className="flex">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4 flex-shrink-0">
                        <FiPhone className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                        <p className="text-gray-700">{restaurant.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {restaurant.email && (
                    <div className="flex">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4 flex-shrink-0">
                        <FiMail className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email</p>
                        <p className="text-gray-700">{restaurant.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Map */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <FiMapPin className="mr-2 text-emerald-600" />
                  Location
                </h2>
                
                <div className="rounded-xl overflow-hidden h-[300px] border border-gray-200 shadow-inner">
                  {coordinates ? (
                    <MapContainer 
                      center={coordinates} 
                      zoom={15} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={coordinates}>
                        <Popup>
                          <div className="p-1">
                            <strong className="text-emerald-700">{restaurant.name}</strong>
                            <p className="text-sm text-gray-600 mt-1">{restaurant.address}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="flex flex-col items-center text-gray-400">
                        <span className="loading loading-spinner loading-md mb-2"></span>
                        <span className="text-sm">Loading map...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Food Items Section */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiShoppingBag className="mr-2 text-emerald-600" /> Available Food Items
              </h2>
              
              {foodItems.length > 0 && (
                <div className="bg-emerald-100 text-emerald-800 py-1 px-4 rounded-full text-sm font-medium">
                  {foodItems.length} item{foodItems.length !== 1 ? 's' : ''} available
                </div>
              )}
            </motion.div>
            
            {itemsLoading ? (
              <div className="flex justify-center p-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-emerald-700">Loading food items...</p>
                </div>
              </div>
            ) : foodItems.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FiPackage className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Items Available</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  This business doesn't have any food items for sale right now. Please check back later.
                </p>
                <div className="w-32 h-1 bg-gradient-to-r from-gray-200 to-gray-300 mx-auto rounded-full mt-6"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {foodItems.map((item, index) => (
                  <motion.div
                    key={item._id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    whileHover={{ 
                      y: -8,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      transition: { duration: 0.2 }
                    }}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col transition-all"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {item.foodItem?.image_url || item.image ? (
                        <img 
                          src={
                            (item.foodItem?.image_url || item.image)?.startsWith('http') 
                              ? (item.foodItem?.image_url || item.image) 
                              : `${API_BASE_URL}/${(item.foodItem?.image_url || item.image || '').replace(/^\/+/, '')}`
                          }
                          alt={item.foodItem?.name || 'Food item'} 
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                          onError={(e) => {
                            console.error("Failed to load image:", e.target.src);
                            e.target.style.display = 'none';
                            
                            // Create and show fallback element
                            const fallback = document.createElement('div');
                            fallback.className = "h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100";
                            fallback.innerHTML = `
                              <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300 mb-2" height="36" width="36" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                              <span class="text-xs text-gray-500">Image not available</span>
                            `;
                            e.target.parentElement.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center">
                          <FiShoppingBag size={36} className="text-gray-300 mb-2" />
                          <span className="text-xs text-gray-500">No image available</span>
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-2">
                          {item.discountedPrice && (
                            <div className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                              -{Math.round((1 - item.discountedPrice / item.price) * 100)}%
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="absolute bottom-3 left-3">
                        <div className="bg-amber-400/90 backdrop-blur-sm text-amber-900 px-3 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                          <FiClock size={12} />
                          {getTimeRemaining(item.expiresAt || (item.foodItem ? item.foodItem.expiry_date : null))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {item.foodItem?.name || "Unnamed Item"}
                      </h3>
                      
                      <div className="mb-3">
                        {item.discountedPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-emerald-600">${item.discountedPrice}</span>
                            <span className="text-sm line-through text-gray-400 font-medium">${item.price}</span>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-emerald-600">${item.price}</span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.foodItem?.category && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-medium">
                            {item.foodItem.category}
                          </span>
                        )}
                        {item.foodItem?.size && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                            {item.foodItem.size}
                          </span>
                        )}
                      </div>
                      
                      {item.foodItem?.allergens && (
                        <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
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
                      
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-auto w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                        onClick={() => navigate(`/order-confirmation/${item._id}`)}
                      >
                        Order Now
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantDetailsPage;