import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeaderMid from './HeaderMid';
import Footer from './Footer';
import { FiBox, FiTrendingUp, FiShoppingBag, FiPlus } from "react-icons/fi";

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
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white">
        <div className="relative">
          <motion.div 
            animate={{ 
              rotate: 360,
              boxShadow: ["0 0 0 rgba(16, 185, 129, 0)", "0 0 20px rgba(16, 185, 129, 0.3)", "0 0 0 rgba(16, 185, 129, 0)"]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              boxShadow: { duration: 2, repeat: Infinity }
            }}
            className="w-20 h-20 rounded-full border-4 border-t-emerald-500 border-b-emerald-500 border-l-transparent border-r-transparent"
          ></motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FiBox className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="ml-4 text-emerald-800 font-medium"
        >
          Loading suggestions...
        </motion.p>
      </div>
    );
  }

  return (
    <>
      <HeaderMid />
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-white min-h-screen relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <motion.div 
            className="absolute right-1/4 bottom-10 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
            animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          ></motion.div>
          <motion.div 
            className="absolute left-1/3 top-1/4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          ></motion.div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="relative z-10 px-4 md:px-8 py-10 max-w-7xl mx-auto">
          {/* Enhanced Banner Section */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl mb-16"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute right-0 -bottom-20 w-96 h-96 bg-white rounded-full"></div>
              <div className="absolute -left-20 -top-20 w-64 h-64 border-4 border-white/30 rounded-full"></div>
              <div className="absolute left-1/3 bottom-0 w-12 h-12 bg-white/20 rounded-full"></div>
            </div>
            
            <div className="relative z-10 py-12 px-8 md:px-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto text-center max-w-3xl"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Smart Product Suggestions
                </h1>
                <p className="text-emerald-50 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                  Discover innovative product recommendations based on customer preferences and market trends to optimize your inventory.
                </p>
                
                <div className="flex justify-center mt-8 space-x-6">
                  <div className="bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full flex items-center gap-2">
                    <FiTrendingUp className="text-white" />
                    <span className="text-white">Data-Driven</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full flex items-center gap-2">
                    <FiShoppingBag className="text-white" />
                    <span className="text-white">Customer Approved</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Statistics Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center mb-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <motion.div 
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                className="bg-white shadow-lg rounded-2xl p-8 text-center relative overflow-hidden border border-gray-100"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-100 rounded-full opacity-50"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                    <FiBox className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-4xl font-bold text-emerald-600 mb-2">{suggestedProducts.length}</h3>
                  <p className="text-gray-600 font-medium">Total Suggested Products</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                className="bg-white shadow-lg rounded-2xl p-8 text-center relative overflow-hidden border border-gray-100"
              >
                <div className="absolute top-0 left-0 -mt-4 -ml-4 w-32 h-32 bg-emerald-100 rounded-full opacity-50"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                    <FiTrendingUp className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-4xl font-bold text-emerald-600 mb-2">{Math.max(...suggestedProducts.map(p => p.recommendationCount), 0)}</h3>
                  <p className="text-gray-600 font-medium">Top Recommendation Count</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Product Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {suggestedProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)",
                  borderColor: "#10b981"
                }}
                className="bg-white shadow-md rounded-2xl overflow-hidden flex flex-col items-center transition-all duration-300 border border-gray-200 group"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 w-full p-6 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-white rounded-full opacity-10 transform translate-x-1/2 translate-y-1/2"></div>
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                      <img src="/images/suggestion-icon.svg" alt="Suggestion Icon" className="w-10 h-10 text-white" />
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm py-1 px-3 rounded-full text-white text-sm font-medium">
                      {product.recommendationCount} recommendations
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-1 w-full flex flex-col">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 italic flex-1">{product.message}</p>
                  
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Aisle</span>
                      <span className="text-sm font-medium text-gray-700">{product.aisle}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Popularity</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-4 rounded-full mx-0.5 ${
                              i < Math.min(Math.ceil(product.recommendationCount / 2), 5) 
                                ? 'bg-emerald-500' 
                                : 'bg-gray-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="mt-auto w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <FiPlus /> Add to Inventory
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SuggestedProductsList;