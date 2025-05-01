import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeaderMid from './HeaderMid';
import Footer from './Footer';

const SuggestedProductsList = () => {
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      try {
        const response = await fetch("http://localhost:8082/api/suggested-products", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();

        if (data.success) {
          // Filter products with recommendationCount > 2
          const filteredProducts = data.data.filter(product => product.recommendationCount > 2);
          setSuggestedProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Error fetching suggested products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <>
      <HeaderMid />
      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 min-h-screen">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-10 px-6 rounded-lg shadow-lg mb-12">
          <h1 className="text-4xl font-extrabold text-center">Suggested Products</h1>
          <p className="text-center mt-4 text-lg">Explore innovative product suggestions tailored for your business.</p>
        </div>

        {/* Statistics Section */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h3 className="text-2xl font-bold text-emerald-600">{suggestedProducts.length}</h3>
              <p className="text-gray-600">Total Suggested Products</p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h3 className="text-2xl font-bold text-emerald-600">{Math.max(...suggestedProducts.map(p => p.recommendationCount), 0)}</h3>
              <p className="text-gray-600">Top Recommendation Count</p>
            </div>
          </div>
        </div>

        {/* Product Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {suggestedProducts.map((product, index) => (
            <motion.div
              key={index}
              className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center hover:shadow-lg transition-shadow duration-300 border border-gray-200"
              whileHover={{ scale: 1.03 }}
            >
              <div className="w-20 h-20 mb-4 flex items-center justify-center bg-gray-100 rounded-full shadow-inner">
                <img src="/images/suggestion-icon.svg" alt="Suggestion Icon" className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2 italic">{product.message}</p>
              <p className="text-sm text-gray-600 mb-2">Aisle: <span className="font-medium">{product.aisle}</span></p>
              <p className="text-sm text-gray-600 mb-4">Recommended: <span className="font-bold text-gray-800">{product.recommendationCount}</span> times</p>
              <button
                className="btn btn-outline btn-primary w-full mt-4"
              >
                Add to Inventory
              </button>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SuggestedProductsList;