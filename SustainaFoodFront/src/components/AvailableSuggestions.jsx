import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const AvailableSuggestions = ({ threshold }) => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableProducts = async () => {
      try {
        const response = await fetch("http://localhost:8082/api/recommendations/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productName: "" }), // Fetch all products
        });
        const data = await response.json();

        if (data.success) {
          const filteredProducts = data.results.filter(
            (product) => product.id && product.score >= threshold
          );
          setAvailableProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Error fetching available products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableProducts();
  }, [threshold]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-center">Available Suggestions for Restaurants and Supermarkets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableProducts.map((product, index) => (
          <motion.div
            key={index}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <img
              src={product.image || "/images/default-food.jpg"}
              alt={product.name}
              className="w-32 h-32 object-cover mb-4"
            />
            <p className="text-sm text-gray-700 mb-2">Score: {product.score.toFixed(2)}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              View Details
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AvailableSuggestions;