import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MysteryPackCard = ({ pack, children }) => {
  if (!pack) {
    return <div className="text-red-500">Error: No pack data provided.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">{pack.name || "Mystery Pack"}</h3>
          <div className="flex flex-col items-end">
            {pack.originalPrice && (
              <span className="text-gray-500 line-through">
                ${pack.originalPrice}
              </span>
            )}
            <span className="text-green-600 font-bold">
              ${pack.discountedPrice || "N/A"}
            </span>
          </div>
        </div>

        <p className="mt-2 text-gray-700">{pack.description || "No description available"}</p>
        <div className="mt-4 text-sm text-gray-500">
          <span>Available Quantity: {pack.availableQuantity || "N/A"}</span>
        </div>

        <div className="mt-4 text-center">{children}</div>
      </div>
    </motion.div>
  );
};

export default MysteryPackCard;
