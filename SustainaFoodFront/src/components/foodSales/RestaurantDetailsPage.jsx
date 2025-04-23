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
        <div className="flex justify-center items-center h-screen">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderMid/>
        <div className="alert alert-error shadow-lg max-w-md mx-auto mt-10">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderMid/>
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <motion.button
          className="btn btn-ghost btn-sm flex items-center mb-6"
          onClick={() => navigate(-1)}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ x: -5 }}
        >
          <FiArrowLeft className="mr-2" /> Back to Food Sales
        </motion.button>

        {/* Restaurant Profile Section */}
        <motion.div 
          className="card bg-base-100 shadow-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card-body">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                      {restaurant.name ? restaurant.name.charAt(0).toUpperCase() : "R"}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                    <div className="badge badge-accent">{restaurant.businessType}</div>
                  </div>
                </div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {restaurant.address && (
                    <motion.div variants={itemVariants} className="flex items-start">
                      <FiMapPin className="mt-1 mr-2 text-primary" />
                      <span>{restaurant.address}</span>
                    </motion.div>
                  )}
                  {restaurant.phone && (
                    <motion.div variants={itemVariants} className="flex items-center">
                      <FiPhone className="mr-2 text-primary" />
                      <span>{restaurant.phone}</span>
                    </motion.div>
                  )}
                  {restaurant.email && (
                    <motion.div variants={itemVariants} className="flex items-center">
                      <FiMail className="mr-2 text-primary" />
                      <span>{restaurant.email}</span>
                    </motion.div>
                  )}
                  <motion.div variants={itemVariants} className="flex items-center">
                    <FiPackage className="mr-2 text-primary" />
                    <span>{restaurant.itemCount} item(s) for sale</span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Add Map Section */}
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <FiMapPin className="mr-2 text-primary" /> Restaurant Location
              </h3>
              <div className="h-64 w-full rounded-lg overflow-hidden border border-base-200">
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
                        <div>
                          <strong>{restaurant.name}</strong><br />
                          {restaurant.address}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-full bg-base-200">
                    <span className="loading loading-spinner loading-md"></span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Food Items Section */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiShoppingBag className="mr-2" /> Food Items For Sale
          </h2>
          
          {itemsLoading ? (
            <div className="flex justify-center p-8">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : foodItems.length === 0 ? (
            <div className="text-center py-10 bg-base-200 rounded-box">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-600">No items available</h3>
              <p className="mt-1 text-gray-500">This business doesn't have any food items for sale right now.</p>
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
                  className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow border border-base-200"
                >
                  {item.foodItem.image_url ? (
                    <figure className="h-40 w-full">
                      <img 
                        src={item.foodItem.image_url} 
                        alt={item.foodItem.name} 
                        className="h-full w-full object-cover"
                      />
                    </figure>
                  ) : (
                    <div className="h-40 w-full bg-base-200 flex items-center justify-center">
                      <FiShoppingBag size={30} className="text-base-content opacity-40" />
                    </div>
                  )}
                  
                  <div className="card-body p-4">
                    <h3 className="card-title text-lg">{item.foodItem.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {item.discountedPrice ? (
                        <>
                          <span className="text-lg font-bold text-primary">${item.discountedPrice}</span>
                          <span className="text-sm line-through opacity-60">${item.price}</span>
                          <span className="badge badge-secondary text-xs">
                            {Math.round((1 - item.discountedPrice / item.price) * 100)}% off
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-primary">${item.price}</span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.foodItem.category && <span className="badge badge-outline">{item.foodItem.category}</span>}
                      {item.foodItem.size && <span className="badge badge-outline">{item.foodItem.size}</span>}
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <div className="flex items-center gap-1 text-warning">
                        <FiClock size={14} />
                        <span>{getTimeRemaining(item.expiresAt || item.foodItem.expiry_date)}</span>
                      </div>
                      <span className="text-gray-500">{item.quantityAvailable} available</span>
                    </div>
                    
                    <div className="card-actions mt-3">
                      <button 
                        className="btn btn-primary btn-sm btn-block"
                        onClick={() => navigate(`/order-confirmation/${item._id}`)}
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
      </div>
    </>
  );
};

export default RestaurantDetailsPage;