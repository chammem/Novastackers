import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBox, FiFilter, FiSearch, FiTruck, FiClock, FiCheckCircle, 
  FiAlertCircle, FiCalendar, FiPackage, FiRefreshCw, FiList, FiGrid,
  FiEdit, FiTrash, FiX
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ quantity: '', category: '' });
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    const fetchUserAndDonations = async () => {
      try {
        const userRes = await axiosInstance.get('/user-details');
        console.log('User Details Response:', userRes.data);
        const user = userRes.data.data;
        if (!user?._id) {
          throw new Error('User ID not found in response');
        }
        setUserId(user._id);

        const res = await axiosInstance.get(`/donations/get-donations-by-buisiness/${user._id}`);
        console.log('Donations Response:', res.data);

        // Since res.data is a flat array of food items, fetch campaign and NGO details for each donationId
        const foodItemsWithCampaigns = await Promise.all(
          res.data.map(async (foodItem) => {
            try {
              const donationRes = await axiosInstance.get(`/donations/${foodItem.donationId}/details`);
              console.log(`Campaign Details for ${foodItem.donationId}:`, donationRes.data);
              return {
                ...foodItem,
                campaignName: donationRes.data?.donation.name || 'Unknown Campaign',
                campaignId: foodItem.donationId,
                ngoName: donationRes.data?.ngo.fullName || 'Unknown NGO',
              };
            } catch (error) {
              console.error(`Error fetching campaign details for donationId ${foodItem.donationId}:`, error);
              return {
                ...foodItem,
                campaignName: 'Unknown Campaign',
                campaignId: foodItem.donationId,
                ngoName: 'Unknown NGO',
              };
            }
          })
        );

        setFoodItems(foodItemsWithCampaigns);
      } catch (error) {
        console.error('Error fetching donations:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          toast.error('Please log in to view your donations');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          toast.error(`Failed to fetch your food donations: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndDonations();
  }, []);

  // Update the Refresh button to use the same logic
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/donations/get-donations-by-buisiness/${userId}`);
      console.log('Donations Response (Refresh):', res.data);

      const foodItemsWithCampaigns = await Promise.all(
        res.data.map(async (foodItem) => {
          try {
            const donationRes = await axiosInstance.get(`/donations/${foodItem.donationId}/details`);
            console.log(`Campaign Details for ${foodItem.donationId}:`, donationRes.data);
            return {
              ...foodItem,
              campaignName: donationRes.data?.donation.name || 'Unknown Campaign',
              campaignId: foodItem.donationId,
              ngoName: donationRes.data?.ngo.fullName || 'Unknown NGO',
            };
          } catch (error) {
            console.error(`Error fetching campaign details for donationId ${foodItem.donationId}:`, error);
            return {
              ...foodItem,
              campaignName: 'Unknown Campaign',
              campaignId: foodItem.donationId,
              ngoName: 'Unknown NGO',
            };
          }
        })
      );

      setFoodItems(foodItemsWithCampaigns);
      toast.success('Donations refreshed');
    } catch (error) {
      console.error('Error refreshing donations:', error.response?.data || error.message);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort the food items
  const filteredItems = foodItems
    .filter(item => {
      if (searchTerm && !item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.category?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.campaignName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.ngoName?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
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

  const handleEditClick = (item) => {
    setEditingItemId(item._id);
    setEditFormData({
      quantity: item.quantity,
      category: item.category,
    });
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(`/donations/update-food-item/${editingItemId}`, editFormData);
      toast.success('Food item updated successfully!');
      setFoodItems(
        foodItems.map((item) =>
          item._id === editingItemId ? { ...item, ...editFormData } : item
        )
      );
      setEditModalOpen(false);
      setEditingItemId(null);
    } catch (error) {
      console.error('Error updating food item:', error);
      toast.error(error.response?.data?.message || 'Failed to update food item');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await axiosInstance.delete(`/donations/delete-food-item/${id}`);
        toast.success('Food item deleted successfully!');
        setFoodItems(foodItems.filter((item) => item._id !== id));
      } catch (error) {
        console.error('Error deleting food item:', error);
        toast.error(error.response?.data?.message || 'Failed to delete food item');
      }
    }
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
                onClick={handleRefresh}
              >
                <FiRefreshCw className="h-4 w-4" /> Refresh
              </button>
            </motion.div>
          </motion.div>

          {/* Status Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="tabs tabs-boxed bg-base-100 p-1 mb-6 flex justify-start overflow-x-auto"
          >
            {Object.entries({
              all: 'All Items',
              pending: 'Pending',
              'picked-up': 'In Transit',
              delivered: 'Delivered'
            }).map(([status, label]) => (
              <motion.a
                key={status}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`tab gap-2 ${statusFilter === status ? 'tab-active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' && <FiPackage />}
                {status === 'pending' && <FiClock />}
                {status === 'picked-up' && <FiTruck />}
                {status === 'delivered' && <FiCheckCircle />}
                {label} 
                <span className="badge badge-sm">{statusCounts[status] || 0}</span>
              </motion.a>
            ))}
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
                    placeholder="Search by name, category, campaign, or NGO"
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
                      <th className="bg-primary/5">Campaign Name</th>
                      <th className="bg-primary/5">NGO</th>
                      <th className="bg-primary/5">Donation Date</th>
                      <th className="bg-primary/5">Status</th>
                      <th className="bg-primary/5">Volunteer</th>
                      <th className="bg-primary/5">Actions</th>
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
                          <Link
                            to={`/campaigns/${item.campaignId}`}
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.campaignName}
                          </Link>
                        </td>
                        <td>{item.ngoName}</td>
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
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(item);
                              }}
                              className="btn btn-ghost btn-sm"
                            >
                              <FiEdit className="text-primary" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(item._id);
                              }}
                              className="btn btn-ghost btn-sm"
                            >
                              <FiTrash className="text-error" />
                            </button>
                          </div>
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
                          <span className="text-base-content/50">Campaign</span>
                          <Link
                            to={`/campaigns/${item.campaignId}`}
                            className="text-primary hover:underline font-semibold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.campaignName}
                          </Link>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base-content/50">NGO</span>
                          <span className="font-semibold">{item.ngoName}</span>
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
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(item);
                          }}
                          className="btn btn-sm btn-outline btn-primary gap-1"
                        >
                          <FiEdit /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(item._id);
                          }}
                          className="btn btn-sm btn-outline btn-error gap-1"
                        >
                          <FiTrash /> Delete
                        </button>
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            onClick={() => setEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal-box max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FiEdit className="text-primary" />
                Edit Food Item
              </h3>
              
              <form onSubmit={handleEditSubmit} className="py-4 space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Quantity (in Kg)</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={editFormData.quantity}
                    onChange={handleEditChange}
                    className="input input-bordered"
                    min="1"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category</span>
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                    className="select select-bordered"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="perishable">Perishable</option>
                    <option value="non-perishable">Non-Perishable</option>
                    <option value="cooked">Cooked Food</option>
                    <option value="beverages">Beverages</option>
                  </select>
                </div>
                <div className="modal-action">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
                      <span className="label-text">Campaign</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered" 
                      value={selectedItem.campaignName} 
                      disabled 
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">NGO</span>
                    </label>
                    <input 
                      type="text" 
                      className="input input-bordered" 
                      value={selectedItem.ngoName} 
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