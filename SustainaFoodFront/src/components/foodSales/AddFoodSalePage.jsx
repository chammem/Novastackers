import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../config/axiosInstance';
import { FiUpload, FiAlertCircle, FiArrowLeft, FiMapPin } from 'react-icons/fi';
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
    focus: { scale: 1.01, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
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
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8 flex items-center">
        <button 
          className="btn btn-ghost btn-circle mr-4" 
          onClick={() => navigate('/food-sale')}
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-primary">Add Food Item For Sale</h1>
      </div>

      {error && (
        <div className="alert alert-error shadow-lg mb-6">
          <div>
            <FiAlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Food Name</span>
                </label>
                <motion.input
                  whileFocus="focus"
                  variants={inputVariants}
                  type="text"
                  name="name"
                  placeholder="E.g., Vegetable Pasta"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Regular Price ($)</span>
                </label>
                <motion.input
                  whileFocus="focus"
                  variants={inputVariants}
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  placeholder="10.99"
                  className="input input-bordered w-full"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Discounted Price ($)</span>
                  <span className="label-text-alt">Optional</span>
                </label>
                <motion.input
                  whileFocus="focus"
                  variants={inputVariants}
                  type="number"
                  name="discountedPrice"
                  step="0.01"
                  min="0"
                  placeholder="5.99"
                  className="input input-bordered w-full"
                  value={formData.discountedPrice}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Quantity Available</span>
                </label>
                <motion.input
                  whileFocus="focus"
                  variants={inputVariants}
                  type="number"
                  name="quantityAvailable"
                  min="1"
                  placeholder="3"
                  className="input input-bordered w-full"
                  value={formData.quantityAvailable}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Expiry Date & Time</span>
                </label>
                <motion.input
                  whileFocus="focus"
                  variants={inputVariants}
                  type="datetime-local"
                  name="expiresAt"
                  className="input input-bordered w-full"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <motion.select
                  whileFocus="focus"
                  variants={inputVariants}
                  name="category"
                  className="select select-bordered w-full"
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
                <label className="label">
                  <span className="label-text">Allergens</span>
                  <span className="label-text-alt">Optional</span>
                </label>
                <motion.input
                  whileFocus="focus"
                  variants={inputVariants}
                  type="text"
                  name="allergens"
                  placeholder="E.g., Gluten, Nuts, Dairy"
                  className="input input-bordered w-full"
                  value={formData.allergens}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Size</span>
                </label>
                <motion.select
                  whileFocus="focus"
                  variants={inputVariants}
                  name="size"
                  className="select select-bordered w-full"
                  value={formData.size}
                  onChange={handleChange}
                  required
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </motion.select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Food Image</span>
                  <span className="label-text-alt">Optional</span>
                </label>
                <div className="flex flex-col items-center">
                  {preview ? (
                    <div className="mb-4 relative">
                      <img src={preview} alt="Preview" className="h-32 w-auto rounded-lg object-cover" />
                      <button 
                        type="button" 
                        className="btn btn-circle btn-xs absolute top-0 right-0 bg-error text-white"
                        onClick={() => {
                          setPreview(null);
                          setFormData({...formData, image: ''});
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center mb-4">
                      <label className="w-full flex flex-col items-center px-4 py-6 bg-base-200 text-primary rounded-lg shadow-lg tracking-wide border border-dashed border-primary cursor-pointer hover:bg-base-300 transition">
                        <FiUpload size={24} />
                        <span className="mt-2 text-sm">Select an image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col mt-3 pt-3 border-t border-base-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="avatar">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                    {user?.role?.charAt(0).toUpperCase() || "R"}
                  </div>
                </div>
                <span className="text-sm font-medium truncate">
                  {user?.businessName || "View restaurant details"}
                </span>
              </div>
              <motion.button 
                className="btn btn-sm btn-outline btn-secondary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/restaurant/${user?._id}`);
                }}
              >
                <FiMapPin className="mr-1" /> View Restaurant Details
              </motion.button>
            </div>

            <div className="mt-8">
              <button 
                type="submit" 
                className={`btn btn-primary btn-block ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Adding Item...' : 'Add Food Item for Sale'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default AddFoodSalePage;