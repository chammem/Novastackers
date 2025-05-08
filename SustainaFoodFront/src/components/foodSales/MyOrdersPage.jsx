import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiClock, FiCheck, FiX, FiPackage, FiChevronRight, FiCalendar } from 'react-icons/fi';
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
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'paid': return 'bg-info/10 text-info';
      case 'fulfilled': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-error/10 text-error';
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
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  return (
    <>
      <HeaderMid />
      <motion.div 
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        
        {/* Filter controls */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="join">
              <button 
                className={`btn join-item ${statusFilter === '' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatusFilter('')}
              >
                All
              </button>
              <button 
                className={`btn join-item ${statusFilter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </button>
              <button 
                className={`btn join-item ${statusFilter === 'paid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatusFilter('paid')}
              >
                Paid
              </button>
              <button 
                className={`btn join-item ${statusFilter === 'fulfilled' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatusFilter('fulfilled')}
              >
                Fulfilled
              </button>
              <button 
                className={`btn join-item ${statusFilter === 'cancelled' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatusFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error shadow-lg">
            <div>
              <FiX size={20} />
              <span>{error}</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl text-gray-400 mb-4">
              <FiPackage className="mx-auto" size={48} />
            </div>
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {statusFilter ? `You have no ${statusFilter} orders.` : "You haven't placed any orders yet."}
            </p>
            <Link to="/food-sales" className="btn btn-primary">
              Browse Food Items
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="card-body p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {order.foodSale?.foodItem?.name || 'Food Item'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <FiCalendar size={14} />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className={`badge ${getStatusClass(order.status)} px-3 py-2`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn btn-ghost btn-sm btn-circle"
                      >
                        <FiChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="divider my-2"></div>
                  
                  <div className="flex flex-wrap justify-between gap-4 text-sm">
                    <div>
                      <span className="font-medium">Quantity:</span> {order.quantity}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span> ${order.totalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="join">
                  <button
                    className="join-item btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`join-item btn ${currentPage === i + 1 ? 'btn-active' : ''}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    className="join-item btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default MyOrdersPage;