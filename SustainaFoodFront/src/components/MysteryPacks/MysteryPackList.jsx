import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiAlertCircle, FiMapPin, FiShoppingBag } from 'react-icons/fi';
import mysteryPackApi from '../../services/mysteryPackApi';
import { useAuth } from '../../context/AuthContext';
import HeaderMid from '../HeaderMid';

const MysteryPackList = () => {
  const { user } = useAuth();
  const [packs, setPacks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [foodSales, setFoodSales] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    originalPrice: '',
    discountedPrice: '',
    pickupTime: '',
    location: '',
    category: 'Lunch',
    availableQuantity: '',
    restaurant: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      originalPrice: '',
      discountedPrice: '',
      pickupTime: '',
      location: '',
      category: 'Lunch',
      availableQuantity: '',
      restaurant: '',
    });
    setSelectedItems([]);
  };

  const handleItemSelect = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i._id === item._id);
      if (exists) {
        return prev.filter(i => i._id !== item._id);
      }
      return [...prev, item];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      formDataToSend.append('selectedItems', JSON.stringify(selectedItems));
      
      const response = await mysteryPackApi.createMysteryPackWithItems(formDataToSend);
      
      if (response.data) {
        toast.success("Mystery Pack créé avec succès!");
        resetForm();
        setShowForm(false);
        fetchPacks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const response = await mysteryPackApi.getMysteryPacks();
      setPacks(response.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des mystery packs", err);
      setError("Échec du chargement des packs.");
      toast.error("Une erreur est survenue lors du chargement des packs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodSales = async () => {
    try {
      const response = await mysteryPackApi.getFoodSales();
      setFoodSales(response.data || []);
    } catch (err) {
      console.error('Erreur détaillée:', err);
      toast.error(`Erreur lors du chargement des articles: ${err.response?.status === 404 ? "Service indisponible" : err.message}`);
      setFoodSales([]);
    }
  };

  useEffect(() => {
    fetchPacks();
    fetchFoodSales();
  }, []);

  useEffect(() => {
    if (showItemModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showItemModal]);

  useEffect(() => {
    if (selectedItems.length > 0) {
      setFormData(prev => ({
        ...prev,
        originalPrice: selectedItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0).toFixed(2)
      }));
    }
  }, [selectedItems]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Available Mystery Packs</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-outline btn-sm">
            {showForm ? "Fermer" : "Créer un pack"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-4 mb-6 shadow rounded-xl space-y-2" encType="multipart/form-data">
            <input 
              name="name" 
              placeholder="Nom" 
              value={formData.name}
              onChange={handleChange} 
              required 
              className="input input-bordered w-full" 
            />
            <input 
              name="originalPrice" 
              type="number" 
              placeholder="Prix original" 
              value={formData.originalPrice}
              onChange={handleChange} 
              required 
              className="input input-bordered w-full" 
            />
            <input 
              name="discountedPrice" 
              type="number" 
              placeholder="Prix réduit" 
              value={formData.discountedPrice}
              onChange={handleChange} 
              required 
              className="input input-bordered w-full" 
            />
            <input 
              name="pickupTime" 
              placeholder="Heure retrait (ex: 18h-20h)" 
              value={formData.pickupTime}
              onChange={handleChange} 
              className="input input-bordered w-full" 
            />
            <input 
              name="location" 
              placeholder="Lieu" 
              value={formData.location}
              onChange={handleChange} 
              className="input input-bordered w-full" 
            />
            <select 
              name="category" 
              value={formData.category}
              onChange={handleChange} 
              className="select select-bordered w-full"
            >
              <option>Lunch</option>
              <option>Breakfast</option>
              <option>Dinner</option>
              <option>Bakery</option>
              <option>Groceries</option>
            </select>
            <input
              name="restaurant"
              placeholder="Nom du restaurant"
              value={formData.restaurant}
              onChange={handleChange}
              required
              className="input input-bordered w-full"
            />
            <input 
              name="availableQuantity" 
              type="number" 
              placeholder="Quantité" 
              value={formData.availableQuantity}
              onChange={handleChange} 
              required 
              className="input input-bordered w-full" 
            />

            <div className="flex flex-col gap-2">
              <button 
                type="button"
                onClick={() => setShowItemModal(true)}
                className="btn btn-secondary w-full"
              >
                <FiShoppingBag className="mr-2" />
                Sélectionner des articles ({selectedItems.length})
              </button>
              
              {selectedItems.length > 0 && (
                <div className="bg-gray-50 p-2 rounded">
                  <h3 className="font-semibold mb-2">Articles sélectionnés:</h3>
                  {selectedItems.map(item => (
                    <div key={item._id} className="flex justify-between items-center mb-1">
                      <span>{item.name}</span>
                      <button 
                        type="button"
                        onClick={() => handleItemSelect(item)}
                        className="btn btn-xs btn-error"
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Création en cours...' : 'Valider'}
            </button>
          </form>
        )}

        {showItemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Sélectionner des articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {foodSales.map(item => (
                  <div 
                    key={item._id}
                    className={`p-3 border rounded cursor-pointer ${
                      selectedItems.find(i => i._id === item._id) 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => handleItemSelect(item)}
                  >
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.price} €</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="btn btn-primary"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="alert alert-error shadow-lg mb-6">
            <div>
              <FiAlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-lg">Chargement des packs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map(pack => (
              <motion.div
                key={pack._id}
                className="card bg-white shadow-lg rounded-2xl p-4 hover:shadow-xl transition duration-300"
                whileHover={{ scale: 1.03 }}
              >
                {pack.imageUrl ? (
                  <img
                    src={pack.imageUrl}
                    alt={pack.name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                    <span>Pas d'image</span>
                  </div>
                )}

                <div className="card-body p-0">
                  <h2 className="text-xl font-semibold text-primary mb-1">{pack.name}</h2>
                  <p className="text-gray-600 text-sm mb-2">{pack.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <FiMapPin className="mr-1" />
                    {pack.location || "Lieu non spécifié"}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    📦 À récupérer à {pack.pickupTime || "heure inconnue"}
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-lg font-bold text-green-600">{pack.discountedPrice} €</span>
                    <button
                      onClick={() => alert(`Réservé : ${pack.name}`)}
                      className="btn btn-primary rounded-full px-4 py-2 text-sm"
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default MysteryPackList;
