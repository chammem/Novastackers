import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPackage, FiMap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const BatchesList = ({
  assignedBatches,
  batchesLoading,
  refreshBatches,
  getStatusColor,
  countItemsByStatus,
  handleStartAction
}) => {
  const [activeBatch, setActiveBatch] = useState(null);
  const navigate = useNavigate();

  if (batchesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
        <p className="text-lg font-medium">
          Loading your batch assignments...
        </p>
      </div>
    );
  }

  if (assignedBatches.length === 0) {
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
          <h2 className="card-title">No Batch Assignments Found</h2>
          <p className="text-base-content/70 mb-4">
            You don't have any batch assignments yet
          </p>
          <div className="card-actions">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={refreshBatches}
              className="btn btn-primary"
            >
              Refresh Batches
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {assignedBatches.map((batch, index) => (
            <motion.div
              key={batch._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <motion.div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                <div className="card-body p-5">
                  <div className="flex justify-between items-center">
                    <h3 className="card-title text-lg">
                      Batch #{index + 1}{" "}
                      <span className="badge badge-sm">
                        {batch.items?.length || 0} items
                      </span>
                    </h3>
                    <div
                      className={`badge badge-${getStatusColor(
                        batch.status
                      )}`}
                    >
                      {batch.status}
                    </div>
                  </div>

                  <div className="stats stats-sm bg-base-200 shadow-sm my-2">
                    <div className="stat">
                      <div className="stat-title text-xs">Pending</div>
                      <div className="stat-value text-sm">
                        {countItemsByStatus(batch.items, "pending")}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-title text-xs">
                        Picked Up
                      </div>
                      <div className="stat-value text-sm">
                        {countItemsByStatus(batch.items, "picked-up")}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-title text-xs">
                        Delivered
                      </div>
                      <div className="stat-value text-sm">
                        {countItemsByStatus(batch.items, "delivered")}
                      </div>
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-2">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setActiveBatch(batch)}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() =>
                        navigate(`/test-map/${batch._id}`)
                      }
                    >
                      <FiMap className="h-4 w-4" /> Route
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Batch Details Modal */}
      <AnimatePresence>
        {activeBatch && (
          <div className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="modal-box max-w-4xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl">
                  Batch Details
                  <span className="badge badge-sm ml-2">
                    {activeBatch.items?.length || 0} items
                  </span>
                </h3>

                <button
                  className="btn btn-sm btn-circle"
                  onClick={() => setActiveBatch(null)}
                >
                  ✕
                </button>
              </div>

              <div className="stats stats-sm bg-base-200 shadow-sm mb-4 w-full">
                <div className="stat">
                  <div className="stat-title text-xs">Pending</div>
                  <div className="stat-value text-sm">
                    {countItemsByStatus(activeBatch.items, "pending")}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title text-xs">Picked Up</div>
                  <div className="stat-value text-sm">
                    {countItemsByStatus(activeBatch.items, "picked-up")}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title text-xs">Delivered</div>
                  <div className="stat-value text-sm">
                    {countItemsByStatus(activeBatch.items, "delivered")}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="table table-zebra w-full">
                  <thead className="sticky top-0 bg-base-100 z-10">
                    <tr>
                      <th>Name</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBatch.items?.map((item, index) => (
                      <tr key={item._id || index}>
                        <td>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs opacity-60">{item.category}</div>
                        </td>
                        <td>{item.restaurantName || "Restaurant"}</td>
                        <td>{item.charityName || "Charity"}</td>
                        <td>
                          <div
                            className={`badge badge-${getStatusColor(item.status)}`}
                          >
                            {item.status}
                          </div>
                        </td>
                        <td>
                          {item.status === "assigned" && (
                            <button
                              className="btn btn-xs btn-primary"
                              onClick={() => handleStartAction(item, "pickup")}
                            >
                              Pickup
                            </button>
                          )}
                          {item.status === "picked-up" && (
                            <button
                              className="btn btn-xs btn-success"
                              onClick={() => handleStartAction(item, "delivery")}
                            >
                              Deliver
                            </button>
                          )}
                          {item.status === "delivered" && (
                            <div className="text-xs text-success">Completed</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/test-map/${activeBatch._id}`)}
                >
                  <FiMap className="mr-2" /> View Route
                </button>
                <button className="btn" onClick={() => setActiveBatch(null)}>
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BatchesList;