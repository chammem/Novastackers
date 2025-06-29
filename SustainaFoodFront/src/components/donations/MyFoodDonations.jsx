import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBox, FiFilter, FiSearch, FiTruck, FiClock, FiCheckCircle, 
  FiAlertCircle, FiCalendar, FiPackage, FiRefreshCw, FiList, FiGrid
} from 'react-icons/fi';

const MyFoodDonations = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('table');
  const [selectedItem, setSelectedItem] = useState(null);

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

    // Show loading animation
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

  const getStatusBg = (status) => {
    switch (status) {
      case 'picked-up':
        return 'bg-warning/10 border-warning/30';
      case 'delivered':
        return 'bg-success/10 border-success/30';
      default:
        return 'bg-info/10 border-info/30';
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const statusCounts = {
    all: foodItems.length,
    pending: foodItems.filter(item => item.status === 'pending' || !item.status).length,
    'picked-up': foodItems.filter(item => item.status === 'picked-up').length,
    delivered: foodItems.filter(item => item.status === 'delivered').length
  };

  return (
    <>
      <HeaderMid />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-base-200 pt-20 pb-16 px-4"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
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
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2"
            >
              <button 
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('table')}
              >
                <FiList />
              </button>
              <button 
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
              <button 
                className="btn btn-sm btn-outline gap-2"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    // Re-fetch data
                    const fetchUserAndDonations = async () => {
                      try {
                        const res = await axiosInstance.get(`/donations/get-donations-by-buisiness/${userId}`);
                        setFoodItems(res.data);
                        toast.success('Donations refreshed');
                      } catch (error) {
                        toast.error('Failed to refresh data');
                      } finally {
                        setIsLoading(false);
                      }
                    };
                    fetchUserAndDonations();
                  }, 600);
                }}
              >
                <FiRefreshCw className="h-4 w-4" /> Refresh
              </button>
            </motion.div>
          </motion.div>

          {/* Ultra-Creative Status Tabs with 3D effects and animations */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-10 perspective-1000 relative"
          >
            {/* Decorative background elements */}
            <div className="absolute -top-5 -left-5 w-20 h-20 bg-green-50 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute -bottom-5 -right-5 w-20 h-20 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            
            <div className="bg-white rounded-2xl p-3 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 relative z-10">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute right-0 bottom-0 w-64 h-64 border-8 border-green-600 rounded-full transform translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute left-1/4 top-0 w-16 h-16 border-4 border-blue-600 rounded-full transform -translate-y-1/2"></div>
              </div>
              
              <div className="flex flex-wrap md:flex-nowrap relative z-10">
                {Object.entries({
                  all: 'All Items',
                  pending: 'Pending',
                  'picked-up': 'In Transit',
                  delivered: 'Delivered'
                }).map(([status, label]) => (
                  <motion.div
                    key={status}
                    className="relative flex-1 min-w-[120px] p-1"
                    whileHover={{ scale: 1.02, z: 1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.button
                      onClick={() => setStatusFilter(status)}
                      className={`w-full py-4 px-2 rounded-xl relative z-10 transition-all duration-300 overflow-hidden ${
                        statusFilter === status 
                          ? 'text-white font-medium shadow-lg' 
                          : 'text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100'
                      }`}
                      whileHover={{ 
                        boxShadow: statusFilter !== status ? "0 4px 12px rgba(0,0,0,0.05)" : "0 8px 25px rgba(0,0,0,0.15)" 
                      }}
                    >
                      {/* Background gradient when active */}
                      {statusFilter === status && (
                        <motion.div 
                          layoutId="activeTabBackground"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: status === 'all' 
                              ? 'linear-gradient(135deg, #4ade80, #22c55e)' 
                              : status === 'pending' 
                              ? 'linear-gradient(135deg, #60a5fa, #3b82f6)' 
                              : status === 'picked-up' 
                              ? 'linear-gradient(135deg, #facc15, #eab308)' 
                              : 'linear-gradient(135deg, #4ade80, #22c55e)'
                          }}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      {/* Subtle animated particles */}
                      {statusFilter === status && (
                        <>
                          <motion.div 
                            className="absolute right-3 top-2 w-2 h-2 rounded-full bg-white/30"
                            animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div 
                            className="absolute right-8 bottom-2 w-1.5 h-1.5 rounded-full bg-white/20"
                            animate={{ y: [0, -7, 0], opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                          />
                          <motion.div 
                            className="absolute left-5 bottom-3 w-1 h-1 rounded-full bg-white/30"
                            animate={{ y: [0, -5, 0], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2.2, repeat: Infinity, delay: 0.8 }}
                          />
                        </>
                      )}
                      
                      <div className="flex flex-col items-center justify-center gap-2 relative z-10">
                        {/* Enhanced icon container with subtle animations */}
                        <motion.div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                            statusFilter === status
                              ? 'bg-white/20'
                              : 'bg-white'
                          }`}
                          animate={statusFilter === status ? {
                            boxShadow: ["0 0 0 0 rgba(255,255,255,0.3)", "0 0 0 8px rgba(255,255,255,0)", "0 0 0 0 rgba(255,255,255,0)"],
                          } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {/* Icon based on status */}
                          {status === 'all' && (
                            <motion.div
                              animate={statusFilter === status ? { rotate: [0, 10, -10, 0] } : {}}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <FiPackage className={`w-5 h-5 ${statusFilter === status ? 'text-white' : 'text-gray-500'}`} />
                            </motion.div>
                          )}
                          {status === 'pending' && (
                            <motion.div
                              animate={statusFilter === status ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <FiClock className={`w-5 h-5 ${statusFilter === status ? 'text-white' : 'text-gray-500'}`} />
                            </motion.div>
                          )}
                          {status === 'picked-up' && (
                            <motion.div
                              animate={statusFilter === status ? { x: [-1, 1, -1] } : {}}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <FiTruck className={`w-5 h-5 ${statusFilter === status ? 'text-white' : 'text-gray-500'}`} />
                            </motion.div>
                          )}
                          {status === 'delivered' && (
                            <motion.div
                              animate={statusFilter === status ? { rotate: [0, 360] } : {}}
                              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                              <FiCheckCircle className={`w-5 h-5 ${statusFilter === status ? 'text-white' : 'text-gray-500'}`} />
                            </motion.div>
                          )}
                        </motion.div>
                        
                        {/* Enhanced label and count */}
                        <span className="font-medium">{label}</span>
                        <motion.span 
                          className={`text-xs px-3 py-1 rounded-full ${
                            statusFilter === status 
                              ? 'bg-white/25 text-white shadow-inner' 
                              : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {statusCounts[status] || 0}
                        </motion.span>
                      </div>
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Filters Row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
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
                  {searchTerm && (
                    <button 
                      className="btn btn-square btn-ghost"
                      onClick={() => setSearchTerm('')}
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="form-control">
                  <div className="input-group">
                    <span className="bg-base-300">
                      <FiCalendar />
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
                className="flex flex-col items-center justify-center py-16"
              >
                <div className="relative w-20 h-20">
                  <motion.span 
                    className="loading loading-spinner loading-lg text-primary absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5,
                      ease: "linear"
                    }}
                  ></motion.span>
                  <motion.div
                    className="h-full w-full flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1,
                      repeatType: "reverse"
                    }}
                  >
                    <FiBox className="h-8 w-8 text-primary opacity-70" />
                  </motion.div>
                </div>
                <motion.p 
                  className="text-base-content/70 text-lg mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Loading your donations...
                </motion.p>
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
                  <motion.div 
                    className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 rgba(0, 0, 0, 0)",
                        "0 0 20px rgba(0, 0, 0, 0.1)",
                        "0 0 0 rgba(0, 0, 0, 0)"
                      ]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 3 
                    }}
                  >
                    <FiBox className="w-10 h-10 text-primary opacity-70" />
                  </motion.div>
                </div>
                <h2 className="text-xl font-bold mb-2">No Donations Yet</h2>
                <p className="text-base-content/70 mb-6">
                  You haven't made any food donations yet. Start contributing to your community today!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/donations'}
                  className="btn btn-primary gap-2 mx-auto"
                >
                  <FiBox /> Find Campaigns to Support
                </motion.button>
              </motion.div>
            ) : filteredItems.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="card bg-base-100 shadow-lg p-8 text-center"
              >
                <div className="flex justify-center mb-4">
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 2,
                      repeatDelay: 1
                    }}
                  >
                    <FiAlertCircle className="w-8 h-8 text-warning/70" />
                  </motion.div>
                </div>
                <h3 className="font-semibold text-lg">No matching donations</h3>
                <p className="text-base-content/70 mt-2">
                  Try adjusting your filters to see more results.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-outline mt-6 gap-2 mx-auto"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  <FiRefreshCw className="h-4 w-4" /> Clear Filters
                </motion.button>
              </motion.div>
            ) : viewMode === 'table' ? (
              <motion.div
                key="table-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="overflow-x-auto bg-base-100 rounded-lg shadow-md"
              >
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="bg-primary/5">Name</th>
                      <th className="bg-primary/5">Quantity</th>
                      <th className="bg-primary/5">Category</th>
                      <th className="bg-primary/5">Donation Date</th>
                      <th className="bg-primary/5">Status</th>
                      <th className="bg-primary/5">Volunteer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item, index) => (
                      <motion.tr 
                        key={item._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="hover:bg-base-200 cursor-pointer"
                        onClick={() => handleItemClick(item)}
                        whileHover={{ backgroundColor: 'rgba(var(--p), 0.05)' }}
                      >
                        <td className="font-medium">{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>
                          <span className="badge badge-ghost">
                            {item.category}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <FiCalendar className="text-base-content/50 w-3 h-3" />
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                          </div>
                        </td>
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
            ) : (
              <motion.div
                key="grid-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    className={`card bg-base-100 shadow-md border ${getStatusBg(item.status)} overflow-hidden`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="card-body p-5">
                      <div className="flex justify-between items-start">
                        <h3 className="card-title text-lg">{item.name}</h3>
                        <span className={`badge ${getStatusColor(item.status)} flex items-center gap-1`}>
                          {getStatusIcon(item.status)}
                          <span className="capitalize">{item.status || 'Pending'}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 my-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-base-content/50">Quantity</span>
                          <span className="font-semibold">{item.quantity}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base-content/50">Category</span>
                          <span className="font-semibold capitalize">{item.category}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base-content/50">Size</span>
                          <span className="font-semibold capitalize">{item.size || '—'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base-content/50">Date</span>
                          <span className="font-semibold">
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="divider my-1"></div>
                      
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                            <span className="text-xs">
                              {item.assignedVolunteer?.fullName?.charAt(0) || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 truncate">
                          <span className="text-sm font-medium">
                            {item.assignedVolunteer?.fullName || 'No volunteer assigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
              <motion.div 
                className="stat bg-base-100 shadow rounded-lg border-t-4 border-primary"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-figure text-primary">
                  <FiBox className="w-8 h-8" />
                </div>
                <div className="stat-title">Total Donations</div>
                <div className="stat-value text-primary">{foodItems.length}</div>
                <div className="stat-desc">All food items you've donated</div>
              </motion.div>
              
              <motion.div 
                className="stat bg-base-100 shadow rounded-lg border-t-4 border-warning"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-figure text-warning">
                  <FiTruck className="w-8 h-8" />
                </div>
                <div className="stat-title">In Transit</div>
                <div className="stat-value text-warning">
                  {foodItems.filter(item => item.status === 'picked-up').length}
                </div>
                <div className="stat-desc">Food items being delivered</div>
              </motion.div>
              
              <motion.div 
                className="stat bg-base-100 shadow rounded-lg border-t-4 border-success"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="stat-figure text-success">
                  <FiCheckCircle className="w-8 h-8" />
                </div>
                <div className="stat-title">Delivered</div>
                <div className="stat-value text-success">
                  {foodItems.filter(item => item.status === 'delivered').length}
                </div>
                <div className="stat-desc">Successfully delivered items</div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal-box max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FiPackage className="text-primary" />
                {selectedItem.name}
              </h3>
              
              <div className="py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Quantity</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered" 
                      value={selectedItem.quantity} 
                      disabled 
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Category</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered" 
                      value={selectedItem.category} 
                      disabled 
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Size</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered" 
                      value={selectedItem.size || 'N/A'} 
                      disabled 
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Status</span>
                    </label>
                    <div className={`input input-bordered flex items-center gap-2 ${getStatusColor(selectedItem.status)}`}>
                      {getStatusIcon(selectedItem.status)}
                      <span className="capitalize">{selectedItem.status || 'Pending'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="divider">Delivery Information</div>
                
                <div className="bg-base-200 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-12">
                        <span>
                          {selectedItem.assignedVolunteer?.fullName?.charAt(0) || '?'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {selectedItem.assignedVolunteer?.fullName || 'No volunteer assigned yet'}
                      </div>
                      <div className="text-sm text-base-content/70">
                        {selectedItem.assignedVolunteer?.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-base-content/70">Pickup Date:</span>
                      <span>{selectedItem.pickupDate ? new Date(selectedItem.pickupDate).toLocaleDateString() : 'Not scheduled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Delivery Date:</span>
                      <span>{selectedItem.deliveryDate ? new Date(selectedItem.deliveryDate).toLocaleDateString() : 'Not delivered'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-action">
                <button onClick={() => setSelectedItem(null)} className="btn">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </>
  );
};

export default MyFoodDonations;
