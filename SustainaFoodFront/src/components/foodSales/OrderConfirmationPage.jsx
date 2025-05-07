import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { motion } from "framer-motion";
=======
import { motion, AnimatePresence } from "framer-motion";
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
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
<<<<<<< HEAD
=======
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiShoppingCart } from 'react-icons/fi';
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954

const OrderConfirmationPage = () => {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();

<<<<<<< HEAD
  const [foodSale, setFoodSale] = useState(null);
  const [loading, setLoading] = useState(true);
=======
  const [recommendations, setRecommendations] = useState([]);
  const [foodSale, setFoodSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
  });
  const [specialInstructions, setSpecialInstructions] = useState("");
<<<<<<< HEAD
  const [error, setError] = useState(null);

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

=======
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);


useEffect(() => {
  console.log('OrderConfirmationPage mounted with foodId:', foodId); // Ajoutez ce log
  
  if (!foodId) {
    console.error('No foodId provided in URL');
    setError('Invalid product ID');
    setLoading(false);
    return;
  }

  const fetchFoodSaleDetails = async () => {
    try {
      const response = await axiosInstance.get(`/food-sale/${foodId}`);
      setFoodSale(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching food sale details:', err);
      setError(err.response?.data?.message || 'Failed to load food item details');
      setLoading(false);
    }
  };

  fetchFoodSaleDetails();
}, [foodId]);

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

 
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
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

  const calculateTotal = () => {
    if (!foodSale) return 0;
    const price = foodSale.discountedPrice || foodSale.price;
    return (price * quantity).toFixed(2);
  };

  const handleProceedToPayment = async () => {
    // Validate form
    if (
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.zipCode
    ) {
      toast.error("Please complete your delivery address");
      return;
    }

    try {
      // Navigate to payment page with order details
      navigate("/order-payment", {
        state: {
          foodId: foodId,
          quantity,
          deliveryAddress,
          specialInstructions,
          totalAmount: calculateTotal(),
          foodSale,
          // No need to pass userId here, we'll get it from AuthContext
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
        <div className="flex justify-center items-center h-screen">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </>
    );
  }

  if (error || !foodSale) {
    return (
      <>
        <HeaderMid />
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error shadow-lg max-w-md mx-auto">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error || "Food item not found"}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderMid />
      <div className="container mx-auto px-4 py-8">
        <motion.button
          className="btn btn-ghost btn-sm flex items-center mb-6"
          onClick={() => navigate(-1)}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ x: -5 }}
        >
          <FiArrowLeft className="mr-2" /> Back
        </motion.button>

        <h1 className="text-2xl font-bold mb-6">Order Confirmation</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <motion.div
              className="card bg-base-100 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Order Details</h2>

                <div className="flex items-start gap-4">
                  {foodSale.foodItem?.image_url ? (
                    <div className="w-24 h-24 rounded-lg overflow-hidden">
                      <img
                        src={foodSale.foodItem.image_url}
                        alt={foodSale.foodItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-base-200 rounded-lg flex items-center justify-center">
                      <FiPackage size={32} className="opacity-40" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {foodSale.foodItem?.name}
                    </h3>
                    <p className="text-sm opacity-70">
                      {foodSale.foodItem?.description}
                    </p>

                    <div className="flex flex-wrap gap-2 my-2">
                      {foodSale.foodItem?.category && (
                        <span className="badge badge-outline">
                          {foodSale.foodItem.category}
                        </span>
                      )}
                      {foodSale.foodItem?.size && (
                        <span className="badge badge-outline">
                          {foodSale.foodItem.size}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-warning text-sm mt-1">
                      <FiClock size={14} />
                      <span>
                        Expires:{" "}
                        {new Date(
                          foodSale.expiresAt || foodSale.foodItem?.expiry_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="flex flex-col gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Quantity</span>
                      <span className="label-text-alt">
                        {foodSale.quantityAvailable} available
                      </span>
                    </label>
                    <div className="flex items-center">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          quantity > 1 && setQuantity(quantity - 1)
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={foodSale.quantityAvailable}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="input input-bordered w-20 mx-2 text-center"
                      />
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          quantity < foodSale.quantityAvailable &&
                          setQuantity(quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-lg">
                    <span>Price:</span>
                    <div>
                      {foodSale.discountedPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            ${foodSale.discountedPrice.toFixed(2)}
                          </span>
                          <span className="line-through text-sm opacity-60">
                            ${foodSale.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold">
                          ${foodSale.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="md:col-span-1">
            <motion.div
              className="card bg-base-100 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">
                  Delivery Information
                </h2>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Street Address*</span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={deliveryAddress.street}
                    onChange={handleAddressChange}
                    className="input input-bordered w-full"
                    placeholder="123 Main St"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">City*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryAddress.city}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">State*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryAddress.state}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      placeholder="NY"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">ZIP Code*</span>
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={deliveryAddress.zipCode}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Country*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={deliveryAddress.country}
                      onChange={handleAddressChange}
                      className="input input-bordered w-full"
                      placeholder="USA"
                      required
                    />
                  </div>
                </div>

                <div className="form-control mt-2">
                  <label className="label">
                    <span className="label-text">Special Instructions</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-20"
                    name="specialInstructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any delivery notes or instructions..."
                  ></textarea>
                </div>

                <div className="card-actions mt-4">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
<<<<<<< HEAD
=======

        {/* Section for similar products */}
{recommendationsLoading ? (
  <div className="mt-12 flex justify-center">
    <span className="loading loading-spinner"></span>
  </div>
) : recommendations && recommendations.filter(item => item.id).length > 0 ? (
  <motion.div 
    className="mt-12"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-2xl font-semibold mb-6 text-center">You might also like</h3>
    
    <div className="relative px-8 max-w-3xl mx-auto">
      {/* Carousel Navigation - Only show if more than 1 item */}
      {recommendations.filter(item => item.id).length > 2 && (
        <button 
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-base-100 rounded-full shadow-md p-2 z-10 hover:bg-base-200 transition-colors"
          onClick={() => {
            setCurrentPage(prev => Math.max(0, prev - 1));
          }}
          disabled={currentPage === 0}
        >
          <FiChevronLeft size={24} />
        </button>
      )}
      
      {/* Products Display - Single centered item or grid */}
      <div className={`overflow-hidden ${recommendations.filter(item => item.id).length === 1 ? 'max-w-sm mx-auto' : 'grid grid-cols-2 gap-4'}`}>
        {recommendations
          .filter((item) => item.id)
          .slice(currentPage * 2, currentPage * 2 + 2)
          .map((item, index) => (
            <motion.div
              key={item.id || index}
              className="cursor-pointer"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => {
                if (item.id) {
                  navigate(`/order-confirmation/${item.id}`);
                }
              }}
            >
              <div className="card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                <figure className="h-48 w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-0"></div>
                  <img
                    src={
                      item.image && import.meta.env.VITE_API_BASE_URL
                        ? `${import.meta.env.VITE_API_BASE_URL}/${item.image}`
                        : '/images/default-food.jpg'
                    }
                    alt={item.name || 'Product image'}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', {
                        attemptedUrl: e.target.src,
                        imagePath: item.image,
                        baseUrl: import.meta.env.VITE_API_BASE_URL || 'undefined',
                      });
                      e.target.onerror = null;
                      e.target.src = '/images/default-food.jpg';
                    }}
                  />
                </figure>
                <div className="card-body p-4 bg-gradient-to-r from-primary/5 to-transparent">
                  <h4 className="card-title text-base font-medium line-clamp-2">{item.name}</h4>
                  
                  <div className="mt-auto pt-3 flex justify-between items-center">
                    <span className="text-primary font-medium text-sm">View details</span>
                    <FiArrowRight className="text-primary" size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
      
      {/* Carousel Navigation - Right - Only show if more than 1 item */}
      {recommendations.filter(item => item.id).length > 2 && (
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-base-100 rounded-full shadow-md p-2 z-10 hover:bg-base-200 transition-colors"
          onClick={() => {
            setCurrentPage(prev => {
              const maxPage = Math.ceil(recommendations.filter(item => item.id).length / 2) - 1;
              return prev < maxPage ? prev + 1 : prev;
            });
          }}
          disabled={currentPage >= Math.ceil(recommendations.filter(item => item.id).length / 2) - 1}
        >
          <FiChevronRight size={24} />
        </button>
      )}
    </div>
    
    {/* Pagination Dots - Only show if more than 2 items */}
    {recommendations.filter(item => item.id).length > 2 && (
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: Math.ceil(recommendations.filter(item => item.id).length / 2) }).map((_, i) => (
          <button 
            key={i} 
            className={`w-2 h-2 rounded-full transition-colors ${currentPage === i ? 'bg-primary' : 'bg-gray-300'}`}
            onClick={() => setCurrentPage(i)}
          />
        ))}
      </div>
    )}
  </motion.div>
) : null}

>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
      </div>
    </>
  );
};

export default OrderConfirmationPage;
<<<<<<< HEAD
=======

>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
