import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBox, FiFilter, FiSearch, FiTruck, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const MyFoodDonations = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchUserAndDonations = async () => {
      try {
        // Step 1: Get the logged-in user's ID
        const userRes = await axiosInstance.get('/user-details');
        const user = userRes.data.data;
        setUserId(user._id);

        // Step 2: Fetch food donations for that user
        const res = await axiosInstance.get(`/donations/get-donations-by-buisiness/${user._id}`);
        setFoodItems(res.data);
      } catch (error) {
        toast.error('Failed to fetch your food donations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndDonations();
  }, []);

  // Filter and sort the food items
  const filteredItems = foodItems
    .filter(item => {
      // Filter by search term
      if (searchTerm && !item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.category?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by status
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by date
      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      } else {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'picked-up':
        return <FiTruck className="mr-1" />;
      case 'delivered':
        return <FiCheckCircle className="mr-1" />;
      default:
        return <FiClock className="mr-1" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'picked-up':
        return 'badge-warning';
      case 'delivered':
        return 'badge-success';
      default:
        return 'badge-info';
    }
  };

  return (
    <>
      <HeaderMid />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-base-200 py-10 px-4"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <FiBox className="text-primary" />
                My Food Donations
              </h1>
              <p className="text-base-content/70 mt-1">
                View and track the status of all food items you've donated
              </p>
            </div>
          </motion.div>

          {/* Filters Row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-base-100 p-4 rounded-lg shadow-sm mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control flex-1">
                <div className="input-group">
                  <span className="bg-base-300">
                    <FiSearch />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or category"
                    className="input input-bordered w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="form-control">
                  <div className="input-group">
                    <span className="bg-base-300">
                      <FiFilter />
                    </span>
                    <select 
                      className="select select-bordered"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="picked-up">Picked Up</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-control">
                  <div className="input-group">
                    <span className="bg-base-300">
                      <FiClock />
                    </span>
                    <select 
                      className="select select-bordered"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                <p className="text-base-content/70 text-lg">Loading your donations...</p>
              </motion.div>
            ) : foodItems.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="card bg-base-100 shadow-lg max-w-md mx-auto text-center p-8"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center">
                    <FiBox className="w-8 h-8 text-base-content/50" />
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-2">No Donations Yet</h2>
                <p className="text-base-content/70 mb-6">
                  You haven't made any food donations yet. Start contributing to your community today!
                </p>
                <button
                  onClick={() => window.location.href = '/donations'}
                  className="btn btn-primary btn-sm mx-auto"
                >
                  Find Campaigns to Support
                </button>
              </motion.div>
            ) : filteredItems.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="card bg-base-100 shadow-lg p-6 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center">
                    <FiAlertCircle className="w-6 h-6 text-base-content/50" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">No matching donations</h3>
                <p className="text-base-content/70 mt-2">
                  Try adjusting your filters to see more results.
                </p>
                <button 
                  className="btn btn-sm btn-outline mt-4 mx-auto"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="overflow-x-auto bg-base-100 rounded-lg shadow-md"
              >
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th className="bg-primary/10">Name</th>
                      <th className="bg-primary/10">Quantity</th>
                      <th className="bg-primary/10">Category</th>
                      <th className="bg-primary/10">Donation Date</th>
                      <th className="bg-primary/10">Status</th>
                      <th className="bg-primary/10">Volunteer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, index) => (
                      <motion.tr 
                        key={item._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="hover:bg-base-200"
                      >
                        <td className="font-medium">{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.category}</td>
                        <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                        <td>
                          <span className={`badge ${getStatusColor(item.status)} flex items-center gap-1`}>
                            {getStatusIcon(item.status)}
                            <span className="capitalize">{item.status || 'Pending'}</span>
                          </span>
                        </td>
                        <td className="font-medium">
                          {item.assignedVolunteer?.fullName || '—'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Summary */}
          {foodItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="stat bg-base-100 shadow rounded-lg">
                <div className="stat-figure text-primary">
                  <FiBox className="w-8 h-8" />
                </div>
                <div className="stat-title">Total Donations</div>
                <div className="stat-value text-primary">{foodItems.length}</div>
              </div>
              
              <div className="stat bg-base-100 shadow rounded-lg">
                <div className="stat-figure text-warning">
                  <FiTruck className="w-8 h-8" />
                </div>
                <div className="stat-title">In Transit</div>
                <div className="stat-value text-warning">
                  {foodItems.filter(item => item.status === 'picked-up').length}
                </div>
              </div>
              
              <div className="stat bg-base-100 shadow rounded-lg">
                <div className="stat-figure text-success">
                  <FiCheckCircle className="w-8 h-8" />
                </div>
                <div className="stat-title">Delivered</div>
                <div className="stat-value text-success">
                  {foodItems.filter(item => item.status === 'delivered').length}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      <Footer />
    </>
  );
};

export default MyFoodDonations;
