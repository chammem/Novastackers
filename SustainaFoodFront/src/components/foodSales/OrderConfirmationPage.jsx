import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { FiArrowRight } from 'react-icons/fi';

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
  });
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);


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

        {/* Section for similar products */}
{/* Section for similar products */}
{/* Section for similar products */}
{recommendationsLoading ? (
  <div className="mt-12 flex justify-center">
    <span className="loading loading-spinner"></span>
  </div>
) : recommendations && recommendations.length > 0 ? (
  <div className="mt-12">
    <h3 className="text-2xl font-semibold mb-6">You might also like</h3>
    <div className="carousel w-full">
      {recommendations.slice(0, 4).map((item, index) => {
        console.log('Produit recommandé:', {
          id: item.id,
          name: item.name,
          image: item.image,
          isAvailable: item.isAvailable
        });

        return (
          <div
            key={item.id || index}
            id={`slide${Math.floor(index / 2)}`}
            className="carousel-item relative w-full flex justify-center items-center gap-4"
          >
            {[item, recommendations[index + 1]].filter(Boolean).map((subItem, subIndex) => {
              console.log('Chemin image:', {
                original: subItem.image,
                processed: subItem.image ? `${import.meta.env.VITE_API_BASE_URL || ''}/uploads/${subItem.image.split('uploads/').pop()}` : null,
                isAvailable: subItem.isAvailable
              });

              return (
                <div
                  key={subItem.id || subIndex}
                  className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden w-1/3"
                >
                  <figure className="h-36 w-full relative">
                    {subItem.isAvailable ? (
   <img 
   src={
     subItem.image
       ? `${import.meta.env.VITE_API_BASE_URL}/${subItem.image.replace(/^\/?uploads\//, '')}`
       : '/images/default-food.jpg'
   }
   alt={subItem.name}
   className="h-full w-full object-cover"
   onError={(e) => {
     console.error('Image load error:', {
       attemptedUrl: e.target.src,
       imagePath: subItem.image,
       baseUrl: import.meta.env.VITE_API_BASE_URL
     });
     e.target.onerror = null;
     e.target.src = '/images/default-food.jpg';
   }}
 />
           
                    ) : (
                      <img
                        src="/images/default-food.jpg"
                        alt="Product not available"
                        className="h-full w-full object-cover opacity-70"
                      />
                    )}
                  </figure>
                  <div className="card-body p-2">
                    <h4 className="card-title text-sm font-medium">{subItem.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                      {subItem.isAvailable ? (
                        <div className="mt-3">
                                     <motion.button 
  className="btn btn-primary btn-sm btn-block"
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.98 }}
  onClick={(e) => {
    e.preventDefault();
    if (subItem.id) {
      navigate(`/order-confirmation/${subItem.id}`);
    }
  }}
>
  Order Now
</motion.button>
                                        </div>
                      ) : (
                        <div className="w-full text-center">
                          <span className="text-xs text-gray-500">
                            {subItem.message || "Product not available"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <a
                href={`#slide${(Math.floor(index / 2) - 1 + 2) % 2}`}
                className="btn btn-circle"
              >
                ❮
              </a>
              <a
                href={`#slide${(Math.floor(index / 2) + 1) % 2}`}
                className="btn btn-circle"
              >
                ❯
              </a>
            </div>
          </div>
        );
      })}
    </div>
  </div>
) : null}


      </div>
    </>
  );
};

export default OrderConfirmationPage;

