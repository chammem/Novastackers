import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiClock, FiCheck, FiX, FiPackage, FiChevronRight, FiCalendar, FiShoppingBag, FiDollarSign, FiTruck } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import HeaderMid from '../HeaderMid';
import axiosInstance from '../../config/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingStage, setLoadingStage] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Enhanced loading animation sequence
  useEffect(() => {
    if (loading) {
      const stages = ['Connecting to server', 'Fetching your orders', 'Processing data'];
      let currentStage = 0;

      const interval = setInterval(() => {
        setLoadingStage(currentStage);
        currentStage = (currentStage + 1) % stages.length;
      }, 800);

      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast.error('Please log in to view your orders');
        navigate('/login');
        return;
      }
      fetchOrders();
    }
  }, [isAuthenticated, isLoading, currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Get user ID from auth context
      if (!user?._id) {
        setError("User not found. Please log in.");
        setLoading(false);
        return;
      }
      
      let url = `/orders/user/${user._id}?page=${currentPage}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await axiosInstance.get(url);
      setOrders(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
      setLoading(false);
      toast.error('Could not load your orders');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-warning" />;
      case 'paid':
        return <FiCheck className="text-info" />;
      case 'fulfilled':
        return <FiPackage className="text-success" />;
      case 'cancelled':
        return <FiX className="text-error" />;
      default:
        return <FiClock />;
    }
  };

  // Enhanced status classes with gradient backgrounds
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-warning/20 to-warning/10 text-warning border border-warning/20';
      case 'paid': return 'bg-gradient-to-r from-info/20 to-info/10 text-info border border-info/20';
      case 'fulfilled': return 'bg-gradient-to-r from-success/20 to-success/10 text-success border border-success/20';
      case 'cancelled': return 'bg-gradient-to-r from-error/20 to-error/10 text-error border border-error/20';
      default: return 'bg-base-200 text-base-content';
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };
  
  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    }),
    hover: { 
      y: -5, 
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  };

  return (
    <>
      <HeaderMid />
      <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
        <div className="container mx-auto px-4 py-8 relative">
          {/* Dynamic background elements */}
          <motion.div 
            className="absolute top-20 right-[5%] w-64 h-64 rounded-full bg-primary/5 filter blur-xl"
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div 
            className="absolute bottom-40 left-[5%] w-80 h-80 rounded-full bg-success/5 filter blur-xl"
            animate={{ 
              y: [0, 30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          />
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">
              My Orders
            </h1>
            <Link to="/food-sales" className="btn btn-outline btn-primary gap-2">
              <FiShoppingBag />
              <span>Continue Shopping</span>
            </Link>
          </motion.div>
          
          {/* Enhanced filter controls */}
          <motion.div 
            className="mb-8 bg-base-100 p-4 rounded-xl shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FiFilter className="text-primary" />
              <h2 className="font-medium">Filter Orders</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <motion.button 
                className={`btn ${statusFilter === '' ? 'btn-primary' : 'btn-ghost'} flex-1 gap-2`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setStatusFilter('')}
              >
                <FiPackage /> All
              </motion.button>
              <motion.button
                className={`btn ${statusFilter === 'pending' ? 'btn-primary' : 'btn-ghost'} flex-1 gap-2`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setStatusFilter('pending')}
              >
                <FiClock /> Pending
              </motion.button>
              <motion.button 
                className={`btn ${statusFilter === 'paid' ? 'btn-primary' : 'btn-ghost'} flex-1 gap-2`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setStatusFilter('paid')}
              >
                <FiDollarSign /> Paid
              </motion.button>
              <motion.button 
                className={`btn ${statusFilter === 'fulfilled' ? 'btn-primary' : 'btn-ghost'} flex-1 gap-2`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setStatusFilter('fulfilled')}
              >
                <FiTruck /> Fulfilled
              </motion.button>
              <motion.button 
                className={`btn ${statusFilter === 'cancelled' ? 'btn-primary' : 'btn-ghost'} flex-1 gap-2`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setStatusFilter('cancelled')}
              >
                <FiX /> Cancelled
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <motion.div 
                  className="w-20 h-20 relative mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  />
                  <motion.div 
                    className="absolute inset-0 rounded-full border-4 border-r-primary border-t-transparent border-b-transparent border-l-transparent"
                    animate={{ 
                      rotate: [360, 0],
                      scale: [1, 0.9, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiPackage className="text-primary text-2xl" />
                  </div>
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-base-content/70"
                  >
                    {['Connecting to server', 'Fetching your orders', 'Processing data'][loadingStage]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-error/10 border border-error/20 rounded-xl p-6 text-center my-10"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 0.5 }}
                  className="inline-block mb-4 text-error"
                >
                  <FiX size={40} />
                </motion.div>
                <h3 className="text-lg font-medium mb-2">{error}</h3>
                <p className="text-base-content/70 mb-4">
                  Please try refreshing the page or come back later.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-error"
                  onClick={fetchOrders}
                >
                  Try Again
                </motion.button>
              </motion.div>
            ) : orders.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center py-12"
              >
                <motion.div
                  className="w-28 h-28 bg-base-200 rounded-full flex items-center justify-center mb-6 relative"
                  initial={{ y: 10 }}
                  animate={{ 
                    y: [0, -10, 0],
                    boxShadow: [
                      "0 0 0 rgba(0,0,0,0.1)",
                      "0 10px 20px rgba(0,0,0,0.15)",
                      "0 0 0 rgba(0,0,0,0.1)"
                    ]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <FiPackage className="text-base-content/40" size={48} />
                  <motion.div
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FiFilter className="text-primary" size={18} />
                  </motion.div>
                </motion.div>
                <motion.h3 
                  className="text-xl font-medium mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  No orders found
                </motion.h3>
                <motion.p 
                  className="text-base-content/60 max-w-md mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {statusFilter 
                    ? `You have no ${statusFilter} orders. Try changing the filter or place a new order.` 
                    : "You haven't placed any orders yet. Start by browsing our delicious food items!"}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link 
                    to="/food-sales" 
                    className="btn btn-primary gap-2"
                  >
                    <FiShoppingBag />
                    Browse Food Items
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {orders.map((order, i) => (
                  <motion.div
                    key={order._id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="card bg-base-100 shadow-md overflow-hidden border border-base-200"
                  >
                    <div className="relative">
                      {/* Status indicator bar at the top */}
                      <div className={`h-1.5 w-full ${
                        order.status === 'pending' ? 'bg-warning' : 
                        order.status === 'paid' ? 'bg-info' :
                        order.status === 'fulfilled' ? 'bg-success' : 
                        'bg-error'
                      }`}></div>
                      
                      <div className="card-body p-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              order.status === 'pending' ? 'bg-warning/10' : 
                              order.status === 'paid' ? 'bg-info/10' :
                              order.status === 'fulfilled' ? 'bg-success/10' : 
                              'bg-error/10'
                            }`}>
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-1">
                                {order.foodSale?.foodItem?.name || 'Food Item'}
                              </h3>
                              <div className="flex items-center gap-1 text-xs text-base-content/60">
                                <FiCalendar size={12} />
                                <span>{formatDate(order.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`badge ${getStatusClass(order.status)} px-3 py-2`}>
                              <span className="flex items-center gap-1 capitalize">
                                {getStatusIcon(order.status)} {order.status}
                              </span>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Link
                                to={`/orders/${order._id}`}
                                className="btn btn-primary btn-sm btn-circle"
                              >
                                <FiChevronRight size={16} />
                              </Link>
                            </motion.div>
                          </div>
                        </div>
                        
                        <div className="divider my-2"></div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs text-base-content/50 mb-1">Quantity</span>
                            <span className="font-medium">{order.quantity}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-base-content/50 mb-1">Total</span>
                            <span className="font-medium text-primary">${order.totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-base-content/50 mb-1">Payment Method</span>
                            <span className="font-medium">Credit Card</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-base-content/50 mb-1">Delivery</span>
                            <span className="font-medium capitalize">{order.deliveryMethod || 'Standard'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Enhanced pagination controls */}
                {totalPages > 1 && (
                  <motion.div 
                    className="flex justify-center mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="join shadow-md rounded-lg overflow-hidden">
                      <motion.button
                        className="join-item btn"
                        whileHover={{ backgroundColor: "#f0f0f0" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        «
                      </motion.button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <motion.button
                          key={i}
                          className={`join-item btn ${currentPage === i + 1 ? 'btn-primary' : ''}`}
                          whileHover={{ y: -2 }}
                          whileTap={{ y: 0 }}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </motion.button>
                      ))}
                      
                      <motion.button
                        className="join-item btn"
                        whileHover={{ backgroundColor: "#f0f0f0" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        »
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default MyOrdersPage;