import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../config/axiosInstance';
import { FiUpload, FiAlertCircle, FiArrowLeft, FiMapPin, FiPackage, FiDollarSign, FiCalendar, FiShoppingBag } from 'react-icons/fi';
import HeaderMid from '../HeaderMid';

const AddFoodSalePage = () => {
const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountedPrice: '',
    quantityAvailable: 1,
    expiresAt: '',
    category: '',
    allergens: '',
    size: 'small',
    image: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Redirection sécurisée
  if (!user || (user.role !== 'restaurant' && user.role !== 'supermarket')) {
    toast.error("Only restaurants and supermarkets can add food items");
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    const imageFormData = new FormData();
    imageFormData.append('image', file);

    try {
      const response = await axiosInstance.post('/food-sale/upload', imageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData((prev) => ({
        ...prev,
        image: response.data.imagePath,
      }));

      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ← évite le reload automatique du form
    
    if (!selectedFile) {
      toast.error("Please select an image first.");
      return;
    }
  
    const submitData = new FormData();
    submitData.append('image', selectedFile);
    submitData.append('name', formData.name);
    submitData.append('price', formData.price);
    submitData.append('discountedPrice', formData.discountedPrice);
    submitData.append('quantityAvailable', formData.quantityAvailable);
    submitData.append('expiresAt', formData.expiresAt);
    submitData.append('category', formData.category);
    submitData.append('allergens', formData.allergens);
    submitData.append('size', formData.size);
    submitData.append('buisinessId', user?.buisinessId || user?._id);
    submitData.append('businessRole', user?.role);
  
    try {
      setLoading(true);
  
      const response = await axiosInstance.post('/food-sale', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('Upload success:', response.data);
      toast.success('Food item added successfully!');
      navigate('/food-sales'); // ← ici ça marchera correctement
    } catch (error) {
      console.error('Upload error:', error);
      setError(error);
      toast.error('Failed to add food item. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const inputVariants = {
    focus: { scale: 1.01, boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.2)", transition: { duration: 0.2 } },
    blur: { scale: 1, boxShadow: "none", transition: { duration: 0.2 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
    <HeaderMid />
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-lime-50 to-white pb-20"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-40 right-10 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 relative"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl shadow-lg p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-0 -bottom-10 w-64 h-64 bg-white rounded-full"></div>
              <div className="absolute -left-10 -top-10 w-40 h-40 border-4 border-white/30 rounded-full"></div>
              <div className="absolute left-1/3 bottom-0 w-8 h-8 bg-white/20 rounded-full"></div>
            </div>
          
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center">
                <motion.button 
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/20 backdrop-blur-sm rounded-full p-2 mr-4 text-white hover:bg-white/30 transition-colors" 
                  onClick={() => navigate('/food-sales')}
                >
                  <FiArrowLeft size={20} />
                </motion.button>
                
                <div>
                  <h1 className="text-3xl font-bold text-white">Add Food Item For Sale</h1>
                  <p className="text-emerald-50 mt-1 max-w-xl">
                    List your surplus food items to reduce waste and help your community
                  </p>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full flex items-center gap-2 text-white text-sm">
                <FiShoppingBag />
                <span>Reduce Food Waste</span>
              </div>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-lg shadow-md"
          >
            <div className="flex items-center">
              <FiAlertCircle size={24} className="text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          </motion.div>
        )}

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Form Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiPackage className="mr-2 text-emerald-600" />
                Food Item Details
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="text-gray-700 font-medium mb-2 flex items-center">
                      Food Name
                    </label>
                    <motion.input
                      whileFocus="focus"
                      variants={inputVariants}
                      type="text"
                      name="name"
                      placeholder="E.g., Vegetable Pasta"
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-gray-700 font-medium mb-2 flex items-center">
                      <FiDollarSign className="mr-1 text-emerald-600" />
                      Regular Price ($)
                    </label>
                    <motion.input
                      whileFocus="focus"
                      variants={inputVariants}
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      placeholder="10.99"
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-gray-700 font-medium mb-2 flex items-center justify-between">
                      <span className="flex items-center">
                        <FiDollarSign className="mr-1 text-emerald-600" />
                        Discounted Price ($)
                      </span>
                      <span className="text-xs text-gray-500">Optional</span>
                    </label>
                    <motion.input
                      whileFocus="focus"
                      variants={inputVariants}
                      type="number"
                      name="discountedPrice"
                      step="0.01"
                      min="0"
                      placeholder="5.99"
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                      value={formData.discountedPrice}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-gray-700 font-medium mb-2">
                      Quantity Available
                    </label>
                    <motion.input
                      whileFocus="focus"
                      variants={inputVariants}
                      type="number"
                      name="quantityAvailable"
                      min="1"
                      placeholder="3"
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                      value={formData.quantityAvailable}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-gray-700 font-medium mb-2 flex items-center">
                      <FiCalendar className="mr-1 text-emerald-600" />
                      Expiry Date & Time
                    </label>
                    <motion.input
                      whileFocus="focus"
                      variants={inputVariants}
                      type="datetime-local"
                      name="expiresAt"
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                      value={formData.expiresAt}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-gray-700 font-medium mb-2">
                      Category
                    </label>
                    <motion.select
                      whileFocus="focus"
                      variants={inputVariants}
                      name="category"
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full appearance-none bg-white"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Produce">Produce</option>
                      <option value="Meat">Meat</option>
                      <option value="Prepared Meal">Prepared Meal</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Other">Other</option>
                    </motion.select>
                  </div>

                  <div className="form-control">
                    <label className="text-gray-700 font-medium mb-2 flex items-center justify-between">
                      <span>Allergens</span>
                      <span className="text-xs text-gray-500">Optional</span>
                    </label>
                    <motion.input
                      whileFocus="focus"
                      variants={inputVariants}
                      type="text"
                      name="allergens"
                      placeholder="E.g., Gluten, Nuts, Dairy"
                      className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                      value={formData.allergens}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-gray-700 font-medium mb-2">
                      Size
                    </label>
                    <motion.div className="grid grid-cols-3 gap-2">
                      {['small', 'medium', 'large'].map(size => (
                        <motion.button
                          key={size}
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`py-2 px-4 rounded-lg border ${
                            formData.size === size 
                              ? 'bg-emerald-500 text-white border-emerald-500' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          } capitalize transition-colors`}
                          onClick={() => setFormData({...formData, size})}
                        >
                          {size}
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>
                </div>

                <div className="mt-10">
                  <motion.button 
                    whileHover={{ scale: 1.01, boxShadow: "0 8px 25px -5px rgba(16, 185, 129, 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className={`w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all ${loading ? 'opacity-80' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Adding Item...' : 'Add Food Item for Sale'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
          
          {/* Right sidebar with image upload and business info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiUpload className="mr-2 text-emerald-600" />
                Food Image
              </h2>
              
              <div className="flex flex-col items-center">
                {preview ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 relative w-full rounded-2xl overflow-hidden shadow-lg"
                  >
                    <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button" 
                      className="absolute top-3 right-3 bg-white text-red-500 rounded-full p-2 shadow-md"
                      onClick={() => {
                        setPreview(null);
                        setFormData({...formData, image: ''});
                      }}
                    >
                      ✕
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div 
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    className="w-full"
                  >
                    <label className="flex flex-col items-center px-4 py-10 bg-gradient-to-b from-gray-50 to-gray-100 text-emerald-600 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="bg-emerald-100 rounded-full p-4 mb-4">
                        <FiUpload size={28} className="text-emerald-600" />
                      </div>
                      <span className="text-lg font-medium text-gray-700">Upload Image</span>
                      <span className="mt-2 text-sm text-gray-500 text-center max-w-xs">
                        Drag and drop or click to select a file. Max 5MB.
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </motion.div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiMapPin className="mr-2 text-emerald-600" />
                Business Information
              </h2>
              
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <div className="flex items-center">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white flex items-center justify-center text-xl font-semibold shadow-md">
                      {user?.role?.charAt(0).toUpperCase() || "R"}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-800">
                      {user?.businessName || user?.name || "Your Business"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user?.role === 'restaurant' ? 'Restaurant' : 'Supermarket'}
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02, x: 3 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/restaurant/${user?._id}`);
                }}
              >
                <FiMapPin className="text-emerald-600" /> View Business Profile
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
};

export default AddFoodSalePage;