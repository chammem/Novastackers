import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SuggestedProducts = () => {
  const [unavailableProducts, setUnavailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnavailableProducts = async () => {
      try {
        const response = await fetch("http://localhost:8082/api/recommendations/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productName: "Chocolate Sandwich Cookies" }),
        });
        const data = await response.json();

        if (data.success) {
          const filteredProducts = data.results.filter((product) => !product.id);
          setUnavailableProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Error fetching unavailable products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnavailableProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-center">Suggestions for Restaurants and Supermarkets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {unavailableProducts.map((product, index) => (
          <motion.div
            key={index}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{product.message}</p>
            <p className="text-sm text-gray-700 mb-2">Aisle: {product.aisle}</p>
            <p className="text-sm text-gray-700 mb-4">Score: {product.score.toFixed(2)}</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Propose this product
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedProducts;