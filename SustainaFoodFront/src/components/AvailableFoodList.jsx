import React, { useState, useEffect } from 'react';
import { getAllFoodSales, getFoodSalesByRole } from '../services/foodService';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiClock, FiMapPin, FiInfo } from 'react-icons/fi';
import HeaderMid from './HeaderMid';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import Modal from './ui/Modal';
import axios from 'axios';

const AvailableFoodList = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // Filter state for user or supermarket
  const [selectedAllergens, setSelectedAllergens] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFoodSales = async () => {
      try {
        let data;
        if (filter === 'all') {
          const response = await getAllFoodSales();
          data = response.data;
        } else {
          const response = await getFoodSalesByRole(filter);
          data = response.data;
        }
        console.log('Filter:', filter); // Log the current filter
        console.log('API Response:', data); // Log the API response to verify its structure
        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.warn('No food items available:', data);
          setFoodItems([]); // Handle empty data
        } else if (!Array.isArray(data)) {
          console.warn('API returned a single item, wrapping in an array:', data);
          setFoodItems([data]); // Wrap single item in an array
        } else {
          setFoodItems(data); // Set the food items if the response is valid
        }
        setLoading(false);
        setError(null); // Reset the error state when data is successfully fetched
      } catch (err) {
        console.error('Error fetching food sales:', err);
        setError('Failed to load food sales. Please try again later.');
        setLoading(false);
      }
    };

    fetchFoodSales();
  }, [filter]);

  const filteredItems = foodItems.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'restaurant' || filter === 'supermarket') {
      return item.businessRole === filter && item.image; // Vérifie également que l'image existe
    }
    return false;
  });

  if (loading) {
    return (
      <>
        <HeaderMid />
        <div className="flex justify-center items-center h-screen">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderMid />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Available Food Deals </h1>
            <div className="flex gap-4">
              <button 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`btn ${filter === 'restaurant' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('restaurant')}
              >
                Restaurant
              </button>
              <button 
                className={`btn ${filter === 'supermarket' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('supermarket')}
              >
                Supermarket
              </button>
            </div>
          </div>
          <div className="alert alert-error shadow-lg max-w-md mx-auto mt-10">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  console.log('Food Items to Render:', foodItems); // Log the food items before rendering

  const openAllergensModal = (allergens) => {
    setSelectedAllergens(allergens);
  };

  const closeAllergensModal = () => {
    setSelectedAllergens(null);
  };

  const fetchRecommendations = async (productName) => {
    try {
        const response = await axios.get(`/api/recommendations/${productName}`);
        if (response.data.success) {
            setRecommendations(response.data.recommendations);
            setSelectedProduct(productName);
        } else {
            console.error('No recommendations found');
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
};

  return (
    <>
      <HeaderMid />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white pb-16">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-40 right-10 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-40 left-10 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Enhanced Header Section */}
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
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Sustainable Food Marketplace</h1>
                  <p className="text-emerald-50/90 max-w-xl">
                    Discover delicious food at discounted prices while helping reduce food waste in your community
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-white text-emerald-700' : 'bg-white/20 text-white'} backdrop-blur-sm transition-all duration-300`}
                    onClick={() => setFilter('all')}
                  >
                    All Options
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full ${filter === 'restaurant' ? 'bg-white text-emerald-700' : 'bg-white/20 text-white'} backdrop-blur-sm transition-all duration-300`}
                    onClick={() => setFilter('restaurant')}
                  >
                    Restaurants
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full ${filter === 'supermarket' ? 'bg-white text-emerald-700' : 'bg-white/20 text-white'} backdrop-blur-sm transition-all duration-300`}
                    onClick={() => setFilter('supermarket')}
                  >
                    Supermarkets
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto border border-gray-100">
              <div className="w-24 h-24 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FiShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">No Food Items Available</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                There are currently no food items available for sale. Please check back later for new offers.
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-emerald-300 to-green-300 mx-auto rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.filter(item => 
                getTimeRemaining(item.expiresAt || (item.foodItem?.expiry_date)) !== 'Expired' && 
                item.quantityAvailable > 0
              ).map((item, index) => (
                <motion.div
                  key={item._id}
                  custom={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      delay: index * 0.1,
                      duration: 0.5
                    }
                  }}
                  whileHover={{ 
                    y: -8,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    transition: { duration: 0.2 }
                  }}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    {item.image ? (
                      <>
                        <img 
                          src={item.image} 
                          alt={(item.foodItem?.name) || 'Food item'} 
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = '/public/images/default-food.jpg'; 
                          }}
                        />
                        <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-t from-black/30 to-transparent z-0"></div>
                      </>
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
                        <div className="bg-white/90 backdrop-blur-sm text-emerald-800 px-3 py-1 rounded-full text-sm font-bold shadow-md">
                          ${item.discountedPrice || item.price}
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-amber-400/90 backdrop-blur-sm text-amber-900 px-3 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
                        <FiClock size={12} />
                        {getTimeRemaining(item.expiresAt || (item.foodItem?.expiry_date))}
                      </div>
                    </div>
                    
                    {item.foodItem?.allergens && (
                      <div className="absolute top-3 left-3">
                        <motion.button 
                          className="bg-red-500/90 backdrop-blur-sm text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openAllergensModal(item.foodItem.allergens)}
                        >
                          <FiInfo size={16} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {item.foodItem?.name || 'Unnamed Food Item'}
                    </h3>
                    
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
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-emerald-700 font-medium">
                        {item.quantityAvailable} available
                      </span>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-green-500 text-white flex items-center justify-center font-medium">
                            {item.foodItem?.buisiness_id 
                              ? (typeof item.foodItem.buisiness_id === 'string' 
                                  ? item.foodItem.buisiness_id[0].toUpperCase() 
                                  : "R")
                              : "R"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 block">
                            {item.businessName || "View details"}
                          </span>
                          <motion.button 
                            className="text-sm text-emerald-600 flex items-center gap-1"
                            whileHover={{ x: 3 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.foodItem?.buisiness_id) {
                                navigate(`/restaurant/${item.foodItem.buisiness_id}`);
                              } else {
                                console.warn("No business ID available for this item");
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
                </motion.div>
              ))}
            </div>
          )}

          {selectedAllergens && (
            <Modal onClose={closeAllergensModal}>
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiInfo className="text-red-500 w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Allergens Information</h3>
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{selectedAllergens}</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-bold shadow-md"
                  onClick={closeAllergensModal}
                >
                  Close
                </motion.button>
              </div>
            </Modal>
          )}

          {selectedProduct && (
            <div>
              <h2>Recommendations for {selectedProduct}</h2>
              <ul>
                  {recommendations.map((rec, index) => (
                      <li key={index}>{rec.product_name} - Similarity: {rec.similarity}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

// Utility function to calculate time remaining
const getTimeRemaining = (expiryDate) => {
  if (!expiryDate) return 'No expiry date';
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m remaining`;
};

export default AvailableFoodList;