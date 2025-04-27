import React, { useState, useEffect } from 'react';
import { getAllFoodSales, getFoodSalesByRole } from '../services/foodService';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiClock, FiMapPin, FiInfo } from 'react-icons/fi';
import HeaderMid from './HeaderMid';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import Modal from './ui/Modal';

const AvailableFoodList = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // Filter state for user or supermarket
  const [selectedAllergens, setSelectedAllergens] = useState(null);
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
            <h1 className="text-3xl font-bold text-primary">Available Food Deals</h1>
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

  return (
    <>
      <HeaderMid />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-extrabold text-primary tracking-wide">Explore Our Exclusive Food Deals</h1>
          <div className="flex gap-4">
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'} btn-lg shadow-md hover:shadow-lg transition-shadow duration-300`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`btn ${filter === 'restaurant' ? 'btn-primary' : 'btn-outline'} btn-lg shadow-md hover:shadow-lg transition-shadow duration-300`}
              onClick={() => setFilter('restaurant')}
            >
              Restaurant
            </button>
            <button 
              className={`btn ${filter === 'supermarket' ? 'btn-primary' : 'btn-outline'} btn-lg shadow-md hover:shadow-lg transition-shadow duration-300`}
              onClick={() => setFilter('supermarket')}
            >
              Supermarket
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-2xl text-gray-500">No food items available for sale at this moment</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.filter(item => getTimeRemaining(item.expiresAt || item.foodItem.expiry_date) !== 'Expired' && item.quantityAvailable > 0).map((item, index) => (
              <motion.div
                key={item._id}
                custom={index}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.03 }}
                className="card bg-base-100 shadow-xl overflow-hidden"
              >
                {item.image ? (
                  <figure className="h-48 w-full relative">
                    <img 
                      src={item.image} 
                      alt={item.foodItem.name || 'Food item'} 
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.src = '/public/images/default-food.jpg'; }} // Fallback image
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
                  {getTimeRemaining(item.expiresAt || item.foodItem.expiry_date) !== 'Expired' && (
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
                  )}
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
                      <FiMapPin className="mr-1" /> View Restaurant Details
                    </motion.button>
                  </div>

                  <div className="mt-3">
                    <motion.button 
                      className="btn btn-primary btn-sm btn-block"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/order-confirmation/${item._id}`);
                      }}
                    >
                      Order Now
                    </motion.button>
                  </div>

                  {item.foodItem.allergens && (
                    <div className="absolute top-2 left-2">
                      <motion.button 
                        className="btn btn-circle btn-sm btn-error flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openAllergensModal(item.foodItem.allergens)}
                      >
                        <FiInfo className="text-white" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedAllergens && (
          <Modal onClose={closeAllergensModal}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Allergens Information</h2>
              <p className="text-gray-700">{selectedAllergens}</p>
              <button 
                className="btn btn-primary btn-block mt-4"
                onClick={closeAllergensModal}
              >
                Close
              </button>
            </div>
          </Modal>
        )}
      </div>
      <Footer />
    </>
  );
};

// Utility function to calculate time remaining
const getTimeRemaining = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m remaining`;
};

export default AvailableFoodList;