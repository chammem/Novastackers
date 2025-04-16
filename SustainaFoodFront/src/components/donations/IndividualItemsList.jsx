import React from "react";
import { motion } from "framer-motion";
import { FiTruck, FiCheck, FiMap, FiPackage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const IndividualItemsList = ({
  filteredFoods,
  assignedFoods,
  handleStartAction,
  inProgress,
  getStatusColor
}) => {
  const navigate = useNavigate();

  if (filteredFoods.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card bg-base-100 shadow-lg mx-auto max-w-md"
      >
        <div className="card-body items-center text-center">
          <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
            <FiPackage size={28} className="text-base-content/50" />
          </div>
          <h2 className="card-title">No Assignments Found</h2>
          <p className="text-base-content/70 mb-4">
            Try changing your filter settings or check back later
          </p>
          <div className="card-actions">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reset Filters
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFoods.map((food, index) => (
          <motion.div
            key={food._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="card-body p-5">
                <div className="flex justify-between">
                  <h3 className="card-title text-lg">
                    {food.name || "Unnamed Donation"}
                  </h3>
                  <div
                    className={`badge badge-outline badge-${getStatusColor(
                      food.status
                    )}`}
                  >
                    {food.status}
                  </div>
                </div>

                <div className="mt-2 space-y-2">
                  <div className="text-sm flex gap-1">
                    <span className="font-medium text-neutral">
                      Category:
                    </span>
                    {food.category || "Uncategorized"}
                  </div>

                  <div className="text-sm flex gap-1">
                    <span className="font-medium text-neutral">
                      Quantity:
                    </span>
                    {food.quantity || "N/A"}
                  </div>

                  {food.restaurantId && (
                    <div className="text-sm flex gap-1">
                      <span className="font-medium text-neutral">
                        From:
                      </span>
                      {food.restaurantName || "Restaurant"}
                    </div>
                  )}

                  {food.charityId && (
                    <div className="text-sm flex gap-1">
                      <span className="font-medium text-neutral">
                        To:
                      </span>
                      {food.charityName || "Charity"}
                    </div>
                  )}

                  {food.volunteerPickedUpAt && (
                    <div className="text-sm text-success">
                      <span className="font-medium text-neutral">
                        Picked up:
                      </span>
                      {new Date(
                        food.volunteerPickedUpAt
                      ).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="divider my-2"></div>

                <div className="card-actions justify-end gap-2">
                  {!food.volunteerPickedUpAt &&
                    food.status === "assigned" && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="btn btn-sm btn-primary gap-1"
                        onClick={() =>
                          handleStartAction(food, "pickup")
                        }
                        disabled={inProgress}
                      >
                        <FiTruck className="h-4 w-4" /> Start Pickup
                      </motion.button>
                    )}

                  {food.status === "picked-up" && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-sm btn-success gap-1"
                      onClick={() =>
                        handleStartAction(food, "delivery")
                      }
                      disabled={inProgress}
                    >
                      <FiCheck className="h-4 w-4" /> Deliver
                    </motion.button>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-sm btn-outline gap-1"
                    onClick={() => navigate(`/route/${food._id}`)}
                  >
                    <FiMap className="h-4 w-4" /> Route
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredFoods.length > 0 && (
        <div className="text-center mt-8 text-base-content/70">
          Showing {filteredFoods.length} of {assignedFoods.length} assignments
        </div>
      )}
    </motion.div>
  );
};

export default IndividualItemsList;