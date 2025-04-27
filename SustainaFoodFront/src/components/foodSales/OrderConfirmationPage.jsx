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
import { getRecommendations } from '../../services/recommendationService';

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

  useEffect(() => {
    console.log('OrderConfirmationPage mounted');

    const fetchRecommendations = async () => {
      try {
        if (user && user._id) {
          console.log('Fetching recommendations for userId:', user._id);
          const recommendationData = await getRecommendations(user._id);
          console.log('Recommendations received:', recommendationData);

          // Fetch product details for each recommended productId
          const productDetails = await Promise.all(
            recommendationData.map(async (item) => {
              try {
                const response = await axiosInstance.get(`/food-sale/${item.foodSaleId}`); // Adjusted to use foodSale ID
                return { ...response.data.data, similarity: item.similarity };
              } catch (error) {
                if (error.response && error.response.status === 404) {
                  console.warn(`Food sale with ID ${item.foodSaleId} not found.`);
                  return null; // Skip this product
                } else {
                  throw error; // Re-throw other errors
                }
              }
            })
          );

          // Filter out null values (missing products)
          setRecommendations(productDetails.filter((item) => item !== null));
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    const fetchFoodSaleDetails = async () => {
      try {
        const response = await axiosInstance.get(`/food-sale/${foodId}`);
        setFoodSale(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching food sale details:', err);
        setError(
          err.response?.data?.message || 'Failed to load food item details'
        );
        setLoading(false);
      }
    };

    fetchFoodSaleDetails();
    fetchRecommendations();
  }, [user, foodId]);

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
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-semibold mb-6">You might also like</h3>
            <div className="carousel w-full">
              {recommendations.slice(0, 4).map((item, index) => (
                <div
                  key={item.foodSaleId}
                  id={`slide${Math.floor(index / 2)}`}
                  className="carousel-item relative w-full flex justify-center items-center gap-4"
                >
                  {[item, recommendations[index + 1]].filter(Boolean).map((subItem) => (
                    <div
                      key={subItem.foodSaleId}
                      className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden w-1/3"
                    >
                      <figure className="h-36 w-full relative">
                        <img
                          src={`/images/${subItem.foodSaleId}.jpg`}
                          alt={subItem.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop
                            e.target.src = '/images/default-placeholder.png'; // Fallback image
                          }}
                        />
                      </figure>
                      <div className="card-body p-2">
                        <h4 className="card-title text-sm font-medium">{subItem.name}</h4>
                        <p className="text-xs text-gray-500">Category: {subItem.category}</p>
                        <p className="text-xs text-gray-500">Similarity: {subItem.similarity}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-bold text-primary">
                            ${subItem.discountedPrice.toFixed(2)}
                          </span>
                          {subItem.discountedPrice !== subItem.price && (
                            <span className="line-through text-xs text-gray-500">
                              ${subItem.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button className="btn btn-primary btn-xs mt-2 w-full">View Product</button>
                      </div>
                    </div>
                  ))}
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
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderConfirmationPage;
