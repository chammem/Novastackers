import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axiosInstance";
import {
  FiArrowLeft,
  FiMapPin,
  FiPackage,
  FiClock,
  FiCheck,
} from "react-icons/fi";
import HeaderMid from "../HeaderMid";
import { useAuth } from "../../context/AuthContext";
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiShoppingCart } from 'react-icons/fi';
import LocationSelector from "../common/LocationSelector";

const OrderConfirmationPage = () => {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();

  const [recommendations, setRecommendations] = useState([]);
  const [foodSale, setFoodSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    lat: null,
    lng: null,
  });
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);


useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Auth state:", { isAuthenticated, isLoading, user });
      toast.error("Please log in to place an order");
      navigate("/login", { state: { from: `/order-confirmation/${foodId}` } });
    }
  }, [isAuthenticated, isLoading, foodId, navigate]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const fetchFoodSaleDetails = async () => {
        try {
          const response = await axiosInstance.get(`/food-sale/${foodId}`);
          setFoodSale(response.data.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching food sale details:", err);
          setError(
            err.response?.data?.message || "Failed to load food item details"
          );
          setLoading(false);
          toast.error("Could not load food item details");
        }
      };

      fetchFoodSaleDetails();
    }
  }, [foodId, isAuthenticated, isLoading]);

  useEffect(() => {
    const fetchProductRecommendations = async () => {
      try {
        if (foodSale && foodSale.foodItem?.name) {
          setRecommendationsLoading(true);
          console.log('Fetching recommendations for product:', foodSale.foodItem.name);
          const response = await axiosInstance.post('/recommendations/product', {
            productName: foodSale.foodItem.name,
          });

          if (response.data.success) {
            // Transform the response to a consistent format
            const formattedRecommendations = response.data.results.map(item => ({
              id: item.id || null,
              name: item.name,
              image: item.image || null,
              isAvailable: !!item.id, // Available if has an id
              message: item.message || null
            }));
            setRecommendations(formattedRecommendations);
          } else {
            console.warn('No recommendations found for product:', foodSale.foodItem.name);
            setRecommendations([]);
          }
        }
      } catch (error) {
        console.error('Error fetching product recommendations:', error);
        setRecommendations([]);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    if (foodSale) {
      fetchProductRecommendations();
    }
  }, [foodSale]);

 
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (foodSale?.quantityAvailable || 1)) {
      setQuantity(value);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = (location) => {
    setDeliveryAddress((prev) => ({
      ...prev,
      lat: location.lat,
      lng: location.lng,
    }));

    if (location.addressDetails) {
      setDeliveryAddress((prev) => ({
        ...prev,
        street: location.addressDetails.street || prev.street,
        city: location.addressDetails.city || prev.city,
        state: location.addressDetails.state || prev.state,
        zipCode: location.addressDetails.zipCode || prev.zipCode,
        country: location.addressDetails.country || prev.country,
      }));
    }
  };

  const calculateTotal = () => {
    if (!foodSale) return 0;
    const price = foodSale.discountedPrice || foodSale.price;
    return (price * quantity).toFixed(2);
  };

  const handleProceedToPayment = async () => {
    if (
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.zipCode
    ) {
      toast.error("Please complete your delivery address");
      return;
    }

    if (!deliveryAddress.lat || !deliveryAddress.lng) {
      toast.error("Please select a delivery location on the map");
      return;
    }

    try {
      navigate("/order-payment", {
        state: {
          foodId: foodId,
          quantity,
          deliveryAddress,
          specialInstructions,
          totalAmount: calculateTotal(),
          foodSale,
        },
      });
    } catch (err) {
      console.error("Error proceeding to payment:", err);
      toast.error("Unable to proceed to payment. Please try again.");
    }
  };

  // Show a loading state while auth is being checked
   if (isLoading) {
    return (
      <>
        <HeaderMid />
        <div className="flex justify-center items-center h-screen">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <span className="ml-2">Checking authentication...</span>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <HeaderMid />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-white flex justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-green-100 rounded-full opacity-40 filter blur-3xl"></div>
            <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-emerald-100 rounded-full opacity-30 filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-4">
              <div className="absolute inset-0 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiShoppingCart className="text-emerald-600 w-8 h-8" />
              </div>
            </div>
            <p className="text-emerald-700 font-medium">Loading your order details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !foodSale) {
    return (
      <>
        <HeaderMid />
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-white flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md border border-red-100">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Something Went Wrong</h3>
            <p className="text-gray-600 text-center mb-6">{error || "Food item not found"}</p>
            <button 
              className="btn bg-gradient-to-r from-red-500 to-rose-600 text-white w-full border-0 hover:opacity-90"
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
      <HeaderMid />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white pb-16">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-40 right-10 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-40 left-10 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
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

          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
                <div className="text-center md:text-left">
                  <span className="inline-block px-4 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
                    Order Confirmation
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Complete Your Order</h1>
                  <p className="text-emerald-50/90 max-w-lg">
                    Just a few more steps to enjoy your sustainable food choice and help reduce waste.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <motion.div
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FiPackage className="mr-2 text-emerald-600" />
                    Order Details
                  </h2>

                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      {foodSale.foodItem?.image_url || foodSale.image ? (
                        <img
                          src={
                            (foodSale.foodItem?.image_url || foodSale.image)?.startsWith('http') 
                              ? (foodSale.foodItem?.image_url || foodSale.image) 
                              : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'}/${(foodSale.foodItem?.image_url || foodSale.image || '').replace(/^\/+/, '')}`
                          }
                          alt={foodSale.foodItem?.name || 'Food item'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Failed to load image:", e.target.src);
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/150?text=Food+Item";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                          <FiPackage size={32} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {foodSale.foodItem?.name || "Food Item"}
                      </h3>
                      
                      <p className="text-gray-600 mb-3">
                        {foodSale.foodItem?.description || "No description available"}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {foodSale.foodItem?.category && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-medium">
                            {foodSale.foodItem.category}
                          </span>
                        )}
                        {foodSale.foodItem?.size && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                            {foodSale.foodItem.size}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-amber-700 text-sm">
                        <FiClock className="text-amber-500" />
                        <span>
                          Expires:{" "}
                          {new Date(
                            foodSale.expiresAt || foodSale.foodItem?.expiry_date
                          ).toLocaleDateString('en-US', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="my-8 border-t border-b border-gray-100 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-gray-500 text-sm mb-3">Quantity</h3>
                        <div className="flex items-center">
                          <button
                            className="w-10 h-10 rounded-l-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                          >
                            <span className="text-gray-600 text-xl">−</span>
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={foodSale.quantityAvailable}
                            value={quantity}
                            onChange={handleQuantityChange}
                            className="h-10 w-16 text-center border-y border-gray-200 focus:outline-none text-gray-700"
                          />
                          <button
                            className="w-10 h-10 rounded-r-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            onClick={() => quantity < foodSale.quantityAvailable && setQuantity(quantity + 1)}
                          >
                            <span className="text-gray-600 text-xl">+</span>
                          </button>
                          <span className="ml-3 text-sm text-gray-500">
                            {foodSale.quantityAvailable} available
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-gray-500 text-sm mb-3">Price Breakdown</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Unit Price:</span>
                            {foodSale.discountedPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-800">
                                  ${foodSale.discountedPrice.toFixed(2)}
                                </span>
                                <span className="line-through text-sm text-gray-400">
                                  ${foodSale.price.toFixed(2)}
                                </span>
                                <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                  {Math.round((1 - foodSale.discountedPrice / foodSale.price) * 100)}% OFF
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-gray-800">
                                ${foodSale.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-semibold text-gray-800">{quantity}</span>
                          </div>
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700">Total:</span>
                              <span className="text-xl font-bold text-emerald-600">${calculateTotal()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiCheck className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-800 mb-1">Making a Sustainable Choice</h3>
                        <p className="text-sm text-emerald-700/80">
                          By purchasing this food item, you're helping to reduce food waste and supporting a more sustainable food system.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="md:col-span-1">
              <motion.div
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FiMapPin className="mr-2 text-emerald-600" />
                    Delivery Information
                  </h2>

                  <div className="mb-6">
                    <LocationSelector
                      onLocationSelect={handleLocationSelect}
                      initialLocation={
                        deliveryAddress.lat && deliveryAddress.lng
                          ? { lat: deliveryAddress.lat, lng: deliveryAddress.lng }
                          : null
                      }
                      address={deliveryAddress}
                    />
                  </div>

                  <div className="relative flex items-center py-4 mb-6">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-3 text-gray-500 text-sm">Address Details</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="text-gray-700 font-medium text-sm mb-1 block">Street Address*</label>
                      <input
                        type="text"
                        name="street"
                        value={deliveryAddress.street}
                        onChange={handleAddressChange}
                        className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                        placeholder="123 Main St"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="text-gray-700 font-medium text-sm mb-1 block">City*</label>
                        <input
                          type="text"
                          name="city"
                          value={deliveryAddress.city}
                          onChange={handleAddressChange}
                          className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="text-gray-700 font-medium text-sm mb-1 block">State*</label>
                        <input
                          type="text"
                          name="state"
                          value={deliveryAddress.state}
                          onChange={handleAddressChange}
                          className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                          placeholder="NY"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="text-gray-700 font-medium text-sm mb-1 block">ZIP Code*</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={deliveryAddress.zipCode}
                          onChange={handleAddressChange}
                          className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                          placeholder="10001"
                          required
                        />
                      </div>
                      <div className="form-control">
                        <label className="text-gray-700 font-medium text-sm mb-1 block">Country*</label>
                        <input
                          type="text"
                          name="country"
                          value={deliveryAddress.country}
                          onChange={handleAddressChange}
                          className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                          placeholder="USA"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="text-gray-700 font-medium text-sm mb-1 block">Special Instructions</label>
                      <textarea
                        className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full min-h-[80px] resize-none"
                        name="specialInstructions"
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Any delivery notes or instructions..."
                      ></textarea>
                    </div>
                  </div>

                  <motion.button
                    className="w-full py-4 px-4 mt-8 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Payment
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Recommended Products Section - Enhanced */}
          {recommendationsLoading ? (
            <div className="mt-12 flex justify-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-emerald-600 text-sm">Finding recommendations for you...</p>
              </div>
            </div>
          ) : recommendations && recommendations.filter(item => item.id).length > 0 ? (
            <motion.div 
              className="mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">You might also like</h3>
                <p className="text-gray-600 max-w-lg mx-auto">Other sustainable food options that complement your order</p>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-300 to-green-300 mx-auto rounded-full mt-4"></div>
              </div>
              
              <div className="relative px-12 max-w-4xl mx-auto">
                {/* Navigation buttons with enhanced styling */}
                {recommendations.filter(item => item.id).length > 2 && (
                  <>
                    <button 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-50 transition-colors border border-gray-100"
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      style={{ opacity: currentPage === 0 ? 0.5 : 1 }}
                    >
                      <FiChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <button 
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-50 transition-colors border border-gray-100"
                      onClick={() => {
                        setCurrentPage(prev => {
                          const maxPage = Math.ceil(recommendations.filter(item => item.id).length / 2) - 1;
                          return prev < maxPage ? prev + 1 : prev;
                        });
                      }}
                      disabled={currentPage >= Math.ceil(recommendations.filter(item => item.id).length / 2) - 1}
                      style={{ opacity: currentPage >= Math.ceil(recommendations.filter(item => item.id).length / 2) - 1 ? 0.5 : 1 }}
                    >
                      <FiChevronRight size={20} className="text-gray-600" />
                    </button>
                  </>
                )}

                {/* Products Display with enhanced styling */}
                <div className={`grid ${recommendations.filter(item => item.id).length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2'} gap-6`}>
                  {recommendations
                    .filter((item) => item.id)
                    .slice(currentPage * 2, currentPage * 2 + 2)
                    .map((item, index) => (
                      <motion.div
                        key={item.id || index}
                        className="cursor-pointer"
                        whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                        transition={{ type: "spring", stiffness: 300 }}
                        onClick={() => {
                          if (item.id) {
                            navigate(`/order-confirmation/${item.id}`);
                          }
                        }}
                      >
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden h-full">
                          <div className="h-40 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-0"></div>
                            <img
                              src={
                                item.image
                                  ? (item.image.startsWith('http')
                                    ? item.image
                                    : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'}/${item.image.replace(/^\/+/, '')}`)
                                  : 'https://via.placeholder.com/300x200?text=Food+Item'
                              }
                              alt={item.name || 'Product image'}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.error("Failed to load image:", e.target.src);
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x200?text=Food+Item';
                              }}
                            />
                          </div>
                          <div className="p-5">
                            <h4 className="font-bold text-gray-800 mb-2 line-clamp-2">{item.name}</h4>
                            
                            <div className="mt-auto pt-3 flex justify-between items-center">
                              <span className="text-emerald-600 font-medium text-sm">View details</span>
                              <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                <FiArrowRight className="text-emerald-600" size={14} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
              
              {/* Pagination Dots */}
              {recommendations.filter(item => item.id).length > 2 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: Math.ceil(recommendations.filter(item => item.id).length / 2) }).map((_, i) => (
                    <button 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-colors ${currentPage === i ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      onClick={() => setCurrentPage(i)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;

