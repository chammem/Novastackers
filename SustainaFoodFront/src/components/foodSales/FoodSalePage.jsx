import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import axiosInstance from '../../config/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import HeaderMid from '../HeaderMid';
import { FiShoppingBag, FiClock, FiMapPin } from 'react-icons/fi';

const FoodSalePage = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axiosInstance.get('/food-sale');
        setFoodItems(response.data.data || []);
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
      
      <div className="alert alert-error shadow-lg max-w-md mx-auto mt-10">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
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
    </>
  );
};

export default FoodSalePage;