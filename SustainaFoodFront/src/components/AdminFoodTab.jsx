import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiSearch, FiFilter, FiX, FiEdit, FiTrash2, 
  FiInfo, FiBarChart2, FiShoppingCart, FiPackage, FiCheck,
  FiCalendar, FiClock, FiTag, FiPercent
} from 'react-icons/fi';
import axiosInstance from '../config/axiosInstance';
import { toast } from 'react-toastify';

const AdminFoodTab = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'sales'
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [foodItems, setFoodItems] = useState([]);
  const [foodSales, setFoodSales] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([
    'All', 'Italian', 'American', 'Japanese', 'Healthy', 'Fast Food'
  ]);
  
  // State for food creation/editing modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [foodFormData, setFoodFormData] = useState({
    name: '',
    category: '',
    price: 0,
    discountedPrice: 0,
    quantityAvailable: 0,
    size: 'medium',
    expiresAt: '',
    image: null
  });
  
  // Add new state variables for dynamic data
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('');
  
  // Add new state variables for confirmation dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Add pagination state for Food Items
  const [currentItemsPage, setCurrentItemsPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Add pagination state for Food Sales
  const [currentSalesPage, setCurrentSalesPage] = useState(1);
  const [salesPerPage, setSalesPerPage] = useState(10);
  
  // Replace mock data with actual API calls
  useEffect(() => {
    const fetchFoodItems = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/donations/getAllFoodItems', {
          params: { 
            page: 1,
            limit: 100,
            sort: 'created_at',
            order: 'desc'
          }
        });
        console.log('Food items response:', response.data);
        
        // Check if response has the expected structure
        const foodItemsData = response.data?.data || [];
        
        // Ensure quantity is properly parsed as a number
        const processedItems = foodItemsData.map(item => {
          const quantity = item.quantity || item.quantityAvailable || 0;
          return {
            ...item,
            quantity: quantity,
            quantityAvailable: quantity,
            // Explicitly set isAvailable to true if there's quantity, regardless of the original value
            isAvailable: quantity > 0
          };
        });
        
        console.log('Processed items with quantity:', processedItems);
        
        setFoodItems(processedItems);
        setFilteredItems(processedItems);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(processedItems.map(item => item.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Failed to fetch food items', error);
        toast.error('Failed to load food inventory');
        
        // Fallback to mock data for development
        const mockItems = [
          { _id: '1', name: 'Pizza', category: 'cooked', price: 10, status: 'Available', quantityAvailable: 25, image: 'uploads/pizza.jpg' },
          { _id: '2', name: 'Burger', category: 'cooked', price: 8, status: 'Available', quantityAvailable: 30, image: 'uploads/burger.jpg' },
          { _id: '3', name: 'Sushi', category: 'raw', price: 15, status: 'Out of Stock', quantityAvailable: 0, image: 'uploads/sushi.jpg' },
          { _id: '4', name: 'Chocolate', category: 'dessert', price: 12, status: 'Available', quantityAvailable: 18, image: '' },
          { _id: '5', name: 'Salad', category: 'raw', price: 9, status: 'Available', quantityAvailable: 15, image: '' },
        ];
        setFoodItems(mockItems);
        setFilteredItems(mockItems);
        setCategories(['All', 'cooked', 'raw', 'dessert']);
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchFoodSales = async () => {
      try {
        // Use the correct endpoint for food sales
        const response = await axiosInstance.get('/donations/getFoodSales');
        
        if (response.data) {
          setFoodSales(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch food sales', error);
        
        // Fallback mock data for sales
        const mockSales = [
          { id: '1', foodName: 'Pizza', quantity: 150, revenue: 1500, date: '2023-12-01', category: 'cooked' },
          { id: '2', foodName: 'Burger', quantity: 200, revenue: 1600, date: '2023-12-01', category: 'cooked' },
          { id: '3', foodName: 'Chocolate', quantity: 80, revenue: 1200, date: '2023-12-02', category: 'dessert' },
          { id: '4', foodName: 'Sushi', quantity: 120, revenue: 1440, date: '2023-12-03', category: 'raw' },
        ];
        setFoodSales(mockSales);
      }
    };
    
    fetchFoodItems();
    fetchFoodSales();
  }, []);
  
  // Fetch dynamic data on component mount
  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        // Fetch available sizes - could come from backend or configuration
        const sizesResponse = await axiosInstance.get('/donations/item-sizes');
        if (sizesResponse.data) {
          setAvailableSizes(sizesResponse.data);
        } else {
          // Fallback if endpoint doesn't exist
          setAvailableSizes(['small', 'medium', 'large']);
        }
        
        // Fetch available categories
        const categoriesResponse = await axiosInstance.get('/donations/item-categories');
        if (categoriesResponse.data) {
          setAvailableCategories(categoriesResponse.data);
        } else {
          // Fallback if endpoint doesn't exist
          setAvailableCategories(['cooked', 'raw', 'processed', 'dessert', 'beverage']);
        }
        
        // Fetch available campaigns for donation
        const campaignsResponse = await axiosInstance.get('/donations/get-all-donations');
        if (campaignsResponse.data) {
          setCampaigns(campaignsResponse.data);
        }
        
        // Fetch available businesses
        const businessResponse = await axiosInstance.get('/users/businesses');
        if (businessResponse.data) {
          setBusinesses(businessResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch dynamic data', error);
      }
    };
    
    fetchDynamicData();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    filterItems(term, filterCategory);
  };
  
  const handleCategoryFilter = (category) => {
    setFilterCategory(category.toLowerCase());
    filterItems(searchTerm, category.toLowerCase());
  };
  
  const filterItems = (term, category) => {
    let filtered = foodItems;
    
    // Apply search term filter
    if (term) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.category.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (category && category !== 'all') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === category
      );
    }
    
    setFilteredItems(filtered);
  };

  // Format expiration date to show remaining days
  const formatExpiryDate = (expiresAt) => {
    if (!expiresAt) return 'No date';
    
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };
  
  // Calculate discount percentage
  const calculateDiscount = (price, discountedPrice) => {
    if (!price || !discountedPrice) return 0;
    return Math.round(((price - discountedPrice) / price) * 100);
  };
  
  // Get status badge color based on availability
  const getStatusColor = (status, isAvailable, quantityAvailable) => {
    // Check if delivered first
    if (status === 'delivered') return 'bg-green-100 text-green-800';
    
    // Get the actual quantity
    const quantity = quantityAvailable || 0;
    
    // Base status purely on quantity not isAvailable flag
    if (quantity <= 0) return 'bg-red-100 text-red-800';
    if (quantity <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
  
  // Get status text
  const getStatusText = (status, isAvailable, quantityAvailable) => {
    // Check if delivered first
    if (status === 'delivered') return 'Delivered';
    
    // Get the actual quantity
    const quantity = quantityAvailable || 0;
    
    // Base status purely on quantity not isAvailable flag
    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= 5) return 'Low Stock';
    return 'Available';
  };
  
  // Modify the handleDelete function to show confirmation first
  const handleDelete = async (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };
  
  // Add the actual delete function to be called after confirmation
  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/donations/deleteFoodItem/${itemToDelete}`);
      
      // Update state
      setFoodItems(foodItems.filter(item => item._id !== itemToDelete));
      setFilteredItems(filteredItems.filter(item => item._id !== itemToDelete));
      
      toast.success('Food item removed successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete food item', error);
      toast.error('Failed to remove food item');
    }
  };
  
  // Handle editing of a food item
  const handleEdit = (item) => {
    setCurrentItem(item);
    setFoodFormData({
      name: item.name || '',
      category: item.category || '',
      price: item.price || 0,
      discountedPrice: item.discountedPrice || 0,
      quantityAvailable: item.quantityAvailable || 0,
      size: item.size || 'medium',
      expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().split('T')[0] : '',
      image: null
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Update the form submit handler to show confirmation for updates
  const handleFormSubmit = async () => {
    // Validate form first
    if (!foodFormData.name?.trim()) {
      toast.error('Food name is required');
      return;
    }
    
    if (!foodFormData.category) {
      toast.error('Please select a category');
      return;
    }
    
    if (!foodFormData.size) {
      toast.error('Please select a size');
      return;
    }
    
    if (foodFormData.quantityAvailable === undefined || foodFormData.quantityAvailable < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    // For new items, validate campaign and business
    if (!isEditing) {
      if (!selectedCampaign) {
        toast.error('Please select a donation campaign');
        return;
      }
      
      if (!selectedBusiness) {
        toast.error('Please select a business');
        return;
      }
    }
    
    // If editing, show confirmation
    if (isEditing) {
      setShowUpdateConfirm(true);
      return;
    }
    
    // Otherwise proceed with creating new item
    submitFormData();
  };
  
  // Extract the actual form submission logic to a separate function
  const submitFormData = async () => {
    try {
      const formData = new FormData();
      
      // Add donation campaign ID if creating a new food item
      if (!isEditing) {
        formData.append('donationId', selectedCampaign);
        formData.append('buisiness_id', selectedBusiness);
        formData.append('status', 'pending');
      }
      
      // Add essential form fields
      formData.append('name', foodFormData.name);
      formData.append('category', foodFormData.category);
      formData.append('size', foodFormData.size);
      
      // Ensure quantity field is correctly named based on backend expectations
      formData.append('quantity', foodFormData.quantityAvailable);
      formData.append('quantityAvailable', foodFormData.quantityAvailable);
      
      // Add expiration date if provided
      if (foodFormData.expiresAt) {
        formData.append('expiresAt', foodFormData.expiresAt);
      }
      
      let response;
      if (isEditing) {
        // Edit existing food item
        response = await axiosInstance.put(`/donations/updateFoodItem/${currentItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new food item
        response = await axiosInstance.post('/donations/addFoodToDonation', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      if (response.data) {
        toast.success(isEditing ? 'Food item updated!' : 'Food item created!');
        
        // Refresh the food items list
        const refreshResponse = await axiosInstance.get('/donations/getAllFoodItems');
        if (refreshResponse.data && refreshResponse.data.data) {
          // Process the data to ensure quantity is handled correctly
          const processedItems = refreshResponse.data.data.map(item => {
            const quantity = item.quantity || item.quantityAvailable || 0;
            return {
              ...item,
              quantity: quantity,
              quantityAvailable: quantity,
              isAvailable: quantity > 0
            };
          });
          
          setFoodItems(processedItems);
          setFilteredItems(processedItems);
        }
        
        setIsModalOpen(false);
        setShowUpdateConfirm(false);
      }
    } catch (error) {
      console.error('Failed to save food item', error);
      toast.error(error.response?.data?.message || 'Failed to save food item');
    }
  };

  // Add new state variables for sales data and filtering
  const [salesLoading, setSalesLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all'); // 'all', 'restaurant', or 'supermarket'
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalItems: 0,
    avgOrder: 0
  });

  // Define fetchFoodSales outside of the SalesAnalyticsTab component
  const fetchFoodSales = async () => {
    setSalesLoading(true);
    try {
      let url = '/food-sale'; // This should match your API route for food sales
      
      // If a specific role is selected, use the role filter endpoint
      if (selectedRole !== 'all') {
        url = `/food-sale/role/${selectedRole}`;
      }
      
      const response = await axiosInstance.get(url);
      
      if (response.data && Array.isArray(response.data)) {
        const salesData = response.data;
        setFoodSales(salesData);
        
        // Calculate statistics using the correct field names
        const totalRevenue = salesData.reduce((sum, sale) => sum + (parseFloat(sale.price) || 0), 0);
        const totalItems = salesData.length;
        const avgOrder = totalItems > 0 ? totalRevenue / totalItems : 0;
        
        setSalesStats({
          totalSales: totalRevenue,
          totalItems: totalItems,
          avgOrder: avgOrder
        });
      } else if (response.data && response.data.data) {
        // Handle case where data is nested under a 'data' key
        const salesData = response.data.data;
        setFoodSales(salesData);
        
        // Same calculations with the correct field names
        const totalRevenue = salesData.reduce((sum, sale) => sum + (parseFloat(sale.price) || 0), 0);
        const totalItems = salesData.length;
        const avgOrder = totalItems > 0 ? totalRevenue / totalItems : 0;
        
        setSalesStats({
          totalSales: totalRevenue,
          totalItems: totalItems,
          avgOrder: avgOrder
        });
      }
    } catch (error) {
      console.error('Failed to fetch food sales', error);
      toast.error('Failed to load sales data');
      
      // Fallback to mock data that matches the schema
      if (foodSales.length === 0) {
        const mockSales = [
          { 
            _id: '1', 
            foodItem: { name: 'Pizza', category: 'cooked' },
            price: 15.00,
            discountedPrice: 12.50,
            quantityAvailable: 10,
            listedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
            businessRole: 'restaurant',
            image: 'uploads/pizza.jpg'
          },
          { 
            _id: '2', 
            foodItem: { name: 'Burger', category: 'cooked' },
            price: 10.00,
            discountedPrice: 8.00,
            quantityAvailable: 15,
            listedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
            businessRole: 'restaurant',
            image: 'uploads/burger.jpg'
          },
          // More mock data...
        ];
        setFoodSales(mockSales);
        
        // Calculate stats from mock data
        const totalRevenue = mockSales.reduce((sum, sale) => sum + (sale.price || 0), 0);
        const totalItems = mockSales.length;
        const avgOrder = totalItems > 0 ? totalRevenue / totalItems : 0;
        
        setSalesStats({
          totalSales: totalRevenue,
          totalItems: totalItems,
          avgOrder: avgOrder
        });
      }
    } finally {
      setSalesLoading(false);
    }
  };

  // Add this effect in the main component, not inside SalesAnalyticsTab
  useEffect(() => {
    if (activeTab === 'sales') {
      fetchFoodSales();
    }
  }, [activeTab, selectedRole]); // Add selectedRole as a dependency

  // Fix the SalesAnalyticsTab component to not use hooks directly
  const SalesAnalyticsTab = () => {
    return (
      <motion.div
        key="sales"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Role filter */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Food Sales </h2>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedRole === 'all' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedRole('all')}
            >
              All Sales
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedRole === 'restaurant' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedRole('restaurant')}
            >
              Restaurants
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedRole === 'supermarket' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedRole('supermarket')}
            >
              Supermarkets
            </button>
          </div>
        </div>
        
        {/* Rest of the component remains the same */}
        {/* Sales Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Sales</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  ${salesStats.totalSales.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </h2>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiShoppingCart className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-xs text-green-600">
              <span className="font-medium">↑ 12.5%</span> vs last month
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Items Sold</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {salesStats.totalItems.toLocaleString()}
                </h2>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiPackage className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              <span className="font-medium">↑ 8.3%</span> vs last month
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Average Order</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  ${salesStats.avgOrder.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </h2>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FiBarChart2 className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-xs text-purple-600">
              <span className="font-medium">↑ 3.2%</span> vs last month
            </div>
          </div>
        </div>
        
        {/* Top Selling Items */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Top Selling Items</h2>
          </div>
          
          {salesLoading ? (
            <div className="p-8 animate-pulse">
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="grid grid-cols-5 gap-4">
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Food Item
                    </th>
                    {/* Removed Category column */}
                    {/* Removed Business Type column */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discounted Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiration Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentSales.map((sale) => (
                    <tr key={sale._id || sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {sale.image ? (
                            <div className="flex-shrink-0 h-12 w-12 mr-3 overflow-hidden rounded-lg border border-gray-200">
                              <img 
                                src={sale.image.startsWith('http') 
                                  ? sale.image 
                                  : `http://localhost:8082${sale.image.startsWith('/') ? '' : '/'}${sale.image}`} 
                                alt={sale.foodItem?.name || 'Food item'}
                                className="h-12 w-12 object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-12 w-12 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FiPackage className="text-gray-400" size={20} />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {/* Fix food item name display by checking all possible properties */}
                            {sale.name || (sale.foodItem && (typeof sale.foodItem === 'object' ? sale.foodItem.name : sale.foodItem)) || sale.foodName || 'Unnamed item'}
                          </div>
                        </div>
                      </td>
                      
                      {/* Original Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${parseFloat(sale.price || 0).toFixed(2)}
                        </div>
                      </td>
                      
                      {/* Discounted Price - new column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${sale.discountedPrice ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                          {sale.discountedPrice ? (
                            <>
                              ${parseFloat(sale.discountedPrice).toFixed(2)}
                              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <FiPercent className="mr-1" size={10} />
                                {calculateDiscount(sale.price, sale.discountedPrice)}% off
                              </span>
                            </>
                          ) : (
                            'No discount'
                          )}
                        </div>
                      </td>
                      
                      {/* Expiration Date - replaces Sale Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          sale.expiresAt && new Date(sale.expiresAt) < new Date() 
                            ? 'text-red-600' 
                            : 'text-gray-500'
                        }`}>
                          {sale.expiresAt ? (
                            <>
                              {new Date(sale.expiresAt).toLocaleDateString()}
                              <span className="block text-xs mt-1">
                                {formatExpiryDate(sale.expiresAt)}
                              </span>
                            </>
                          ) : (
                            'Not specified'
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!salesLoading && foodSales.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiShoppingCart className="text-gray-400" size={24} />
              </div>
              <h3 className="text-gray-500 font-medium">No sales data available</h3>
            </div>
          )}
        </div>
        
        {/* Sales Pagination Controls */}
        {foodSales.length > 0 && totalSalesPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              onClick={() => handleSalesPageChange(Math.max(1, currentSalesPage - 1))}
              disabled={currentSalesPage === 1}
            >
              Prev
            </button>
            {[...Array(totalSalesPages)].map((_, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 rounded ${currentSalesPage === idx + 1 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => handleSalesPageChange(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              onClick={() => handleSalesPageChange(Math.min(totalSalesPages, currentSalesPage + 1))}
              disabled={currentSalesPage === totalSalesPages}
            >
              Next
            </button>
          </div>
        )}
      
      </motion.div>
    );
  };

  // Calculate paginated items for the Food Items tab
  const indexOfLastItem = currentItemsPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalItemPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  // Calculate paginated sales for the Food Sales tab
  const indexOfLastSale = currentSalesPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = foodSales.slice(indexOfFirstSale, indexOfLastSale);
  const totalSalesPages = Math.ceil(foodSales.length / salesPerPage);

  // Add page change handlers
  const handleItemsPageChange = (pageNumber) => {
    setCurrentItemsPage(pageNumber);
  };
  
  const handleSalesPageChange = (pageNumber) => {
    setCurrentSalesPage(pageNumber);
  };

  // Update the component to call fetchFoodSales when tab changes
  useEffect(() => {
    if (activeTab === 'items') {
      // Existing code for food items tab
      // ...
    } else if (activeTab === 'sales') {
      // Initialize sales data when switching to sales tab
      setSalesLoading(true);
      const fetchSalesData = async () => {
        try {
          const response = await axiosInstance.get('/foodsales');
          if (response.data) {
            setFoodSales(Array.isArray(response.data) ? response.data : (response.data.data || []));
          }
        } catch (error) {
          console.error('Failed to fetch initial sales data', error);
        } finally {
          setSalesLoading(false);
        }
      };
      
      fetchSalesData();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab="food"
      />
      
      <div 
        className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} pt-20 pb-8 px-2 md:px-8`}
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Innovative Header with Animated Background */}
          <div className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-r from-green-600 to-emerald-500 shadow-lg">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute right-0 bottom-0 w-96 h-96 bg-white rounded-full transform translate-x-1/3 translate-y-1/3"></div>
              <div className="absolute right-20 top-10 w-24 h-24 bg-white rounded-full"></div>
              <div className="absolute left-20 top-20 w-32 h-32 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            
            <div className="relative z-10 p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                    Food Management Hub
                  </h1>
                  <p className="text-green-50 text-lg max-w-2xl">
                    Centralized platform for managing food inventory, tracking sales, and analyzing performance metrics.
                  </p>
                </div>
                
                {/* Search bar moved to the right */}
                <div className="md:w-96">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search food items..."
                      className="w-full px-4 py-3 pr-10 rounded-xl border-none shadow-md"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400" size={20} />
                    </div>
                    {searchTerm && (
                      <button 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => {
                          setSearchTerm('');
                          filterItems('', filterCategory);
                        }}
                      >
                        <FiX className="text-gray-400 hover:text-gray-600" size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="mt-8">
                <div className="inline-flex p-1 rounded-xl bg-white/20 backdrop-blur-sm">
                  <button
                    className={`py-2 px-5 rounded-lg font-medium transition-all ${
                      activeTab === 'items' 
                        ? 'bg-white text-green-700 shadow-md' 
                        : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => setActiveTab('items')}
                  >
                    <FiPackage className="inline mr-2" /> Food Items
                  </button>
                  <button
                    className={`py-2 px-5 rounded-lg font-medium transition-all ${
                      activeTab === 'sales' 
                        ? 'bg-white text-green-700 shadow-md' 
                        : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => setActiveTab('sales')}
                  >
                    <FiBarChart2 className="inline mr-2" /> Food Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'items' ? (
              <motion.div
                key="items"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Category Filter Pills */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryFilter(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filterCategory === category.toLowerCase() 
                          ? 'bg-green-100 text-green-800 shadow-sm' 
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                {/* Action Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                  <div>
                    <p className="text-gray-600">
                      Showing <span className="font-semibold">{filteredItems.length}</span> items
                      {filterCategory !== 'all' && (
                        <span> in <span className="font-semibold capitalize">{filterCategory}</span> category</span>
                      )}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentItem(null);
                      setFoodFormData({
                        name: '',
                        category: '',
                        price: 0,
                        discountedPrice: 0,
                        quantityAvailable: 0,
                        size: 'medium',
                        expiresAt: '',
                        image: null
                      });
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium shadow-md hover:bg-green-700 transition-colors"
                  >
                    <FiPlus className="mr-2" /> Add New Food Item
                  </button>
                </div>
                
                {/* Food Items Table - Simplified by removing Category, Price, and Expiry columns */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                  {isLoading ? (
                    // Loading skeleton
                    <div className="p-8 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="grid grid-cols-4 gap-4">
                            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                            <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                                Food Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                                Size
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                                Quantity
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredItems.length > 0 ? (
                              currentItems.map((item) => (
                                <tr 
                                  key={item._id} 
                                  className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                  {/* Food Name - improved layout */}
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm border border-gray-200">
                                        {item.image ? (
                                          <img 
                                            src={`http://localhost:8082/${item.image}`}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <FiPackage className="text-gray-400" size={24} />
                                        )}
                                      </div>
                                      <div className="ml-4">
                                        <div className="font-medium text-gray-900 text-sm md:text-base">{item.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {item.category || 'Uncategorized'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  
                                  {/* Size - with icon */}
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <FiTag className="text-gray-400 mr-2" size={16} />
                                      <span className="text-sm text-gray-900 capitalize">{item.size || '-'}</span>
                                    </div>
                                  </td>
                                  
                                  {/* Quantity - improved indicator */}
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <span className="text-sm font-semibold text-gray-900 mr-2">
                                        {item.quantity || item.quantityAvailable || 0}
                                      </span>
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full ${
                                            (item.quantity || item.quantityAvailable) <= 0 ? 'bg-red-500' : 
                                            (item.quantity || item.quantityAvailable) <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                                          }`}
                                          style={{ width: `${Math.min(100, ((item.quantity || item.quantityAvailable || 0) / 20) * 100)}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </td>
                                  
                                  {/* Status - better visual indicators */}
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                      getStatusColor(item.status, true, item.quantity || item.quantityAvailable)
                                    }`}>
                                      <span className={`h-2 w-2 rounded-full mr-2 ${
                                        (item.quantity || item.quantityAvailable) <= 0 ? 'bg-red-500' : 
                                        (item.quantity || item.quantityAvailable) <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                                      }`}></span>
                                      {getStatusText(item.status, true, item.quantity || item.quantityAvailable)}
                                    </span>
                                  </td>
                                  
                                  {/* Actions - better buttons */}
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                      <button 
                                        className="group relative p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                        onClick={() => handleEdit(item)}
                                        title="Edit"
                                      >
                                        <FiEdit size={16} />
                                        <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          Edit
                                        </span>
                                      </button>
                                      <button 
                                        className="group relative p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                        onClick={() => handleDelete(item._id)}
                                        title="Delete"
                                      >
                                        <FiTrash2 size={16} />
                                        <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          Delete
                                        </span>
                                      </button>
                                      <button 
                                        className="group relative p-2 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                                        title="Details"
                                      >
                                        <FiInfo size={16} />
                                        <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          Details
                                        </span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="px-6 py-10 text-center">
                                  <p className="text-gray-500">No matching food items found</p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Improved empty state with better visuals */}
                      {filteredItems.length === 0 && !isLoading && (
                        <div className="text-center py-16 px-6">
                          <div className="mx-auto w-24 h-24 bg-gray-100 flex items-center justify-center rounded-full mb-6 shadow-inner">
                            <FiPackage size={36} className="text-gray-400" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-700 mb-3">No food items found</h3>
                          <p className="text-gray-500 max-w-md mx-auto mb-6">
                            {searchTerm 
                              ? `We couldn't find any food items matching "${searchTerm}"`
                              : filterCategory !== 'all'
                                ? `There are no food items in the "${filterCategory}" category yet`
                                : "Your food inventory is empty. Add your first item to get started!"
                          }
                          </p>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setCurrentItem(null);
                              setFoodFormData({
                                name: '',
                                category: '',
                                price: 0,
                                discountedPrice: 0,
                                quantityAvailable: 0,
                                size: 'medium',
                                expiresAt: '',
                                image: null
                              });
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors"
                          >
                            <FiPlus className="mr-2" /> {searchTerm || filterCategory !== 'all' ? 'Add New Item' : 'Add Your First Item'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Items Pagination Controls */}
                {filteredItems.length > 0 && totalItemPages > 1 && (
                  <div className="px-6 py-4 flex items-center justify-center border-t border-gray-200">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                        onClick={() => handleItemsPageChange(Math.max(1, currentItemsPage - 1))}
                        disabled={currentItemsPage === 1}
                      >
                        Prev
                      </button>
                      {[...Array(totalItemPages)].map((_, idx) => (
                        <button
                          key={idx}
                          className={`px-3 py-1 rounded ${currentItemsPage === idx + 1 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                          onClick={() => handleItemsPageChange(idx + 1)}
                        >
                          {idx + 1}
                        </button>
                      ))}
                      <button
                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                        onClick={() => handleItemsPageChange(Math.min(totalItemPages, currentItemsPage + 1))}
                        disabled={currentItemsPage === totalItemPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <SalesAnalyticsTab />
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Food Item Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 py-4 px-6">
              <h3 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Food Item' : 'Add New Food Item'}
              </h3>
            </div>
                
            <div className="p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      value={foodFormData.name}
                      onChange={(e) => setFoodFormData({...foodFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Food item name"
                    />
                  </div>
                  
                  {/* Campaign selection - only for new items */}
                  {!isEditing && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Donation Campaign</label>
                      <select 
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select campaign</option>
                        {campaigns.map(campaign => (
                          <option key={campaign._id} value={campaign._id}>
                            {campaign.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Business selection - only for new items */}
                  {!isEditing && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
                      <select 
                        value={selectedBusiness}
                        onChange={(e) => setSelectedBusiness(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select business</option>
                        {businesses.map(business => (
                          <option key={business._id} value={business._id}>
                            {business.fullName || business.restaurantName || business.supermarketName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      value={foodFormData.category}
                      onChange={(e) => setFoodFormData({...foodFormData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select category</option>
                      {availableCategories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <select 
                      value={foodFormData.size}
                      onChange={(e) => setFoodFormData({...foodFormData, size: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select size</option>
                      {availableSizes.map(size => (
                        <option key={size} value={size}>
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
                    <input 
                      type="number" 
                      value={foodFormData.quantityAvailable}
                      onChange={(e) => setFoodFormData({...foodFormData, quantityAvailable: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                    <input 
                      type="date" 
                      value={foodFormData.expiresAt}
                      onChange={(e) => setFoodFormData({...foodFormData, expiresAt: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </form>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFormSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Add Confirmation Dialogs */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-red-600 py-4 px-6">
              <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
            </div>
            <div className="p-6">
              <p className="mb-6 text-gray-700">Are you sure you want to delete this food item? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showUpdateConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-green-600 py-4 px-6">
              <h3 className="text-xl font-bold text-white">Confirm Update</h3>
            </div>
            <div className="p-6">
              <p className="mb-6 text-gray-700">Are you sure you want to update this food item?</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowUpdateConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitFormData}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminFoodTab;