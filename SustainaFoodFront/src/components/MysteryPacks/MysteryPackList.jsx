import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FiAlertCircle, FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import HeaderMid from '../HeaderMid';

const MysteryPackList = () => {
  const { user } = useAuth();
  const [packs, setPacks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    pickupTime: '',
    location: '',
    category: 'Lunch',
    availableQuantity: '',
    restaurant: '',  // Ajout du champ restaurant
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation simple des champs requis
    if (!formData.name || !formData.description || !formData.originalPrice || !formData.discountedPrice || !formData.availableQuantity || !formData.restaurant) {
      toast.error("Tous les champs requis doivent être remplis.");
      return;
    }

    const data = new FormData();
    for (let key in formData) data.append(key, formData[key]);
    if (image) data.append('image', image);

    try {
      const response = await axios.post('http://localhost:8082/api/mystery-packs/new', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        toast.success("Mystery Pack créé !");
        setShowForm(false);
        fetchPacks(); // Recharge les packs
      } else {
        toast.error("Erreur lors de la création du pack.");
      }
    } catch (err) {
      toast.error(`Erreur lors de la création : ${err.response?.data?.message || "Une erreur inconnue est survenue."}`);
      console.error("Erreur API:", err);
    }
  };

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8082/api/mystery-packs');
      setPacks(response.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des mystery packs", err);
      setError("Échec du chargement des packs.");
      toast.error("Une erreur est survenue lors du chargement des packs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

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
            <input name="name" placeholder="Nom" onChange={handleChange} required className="input input-bordered w-full" />
            <textarea name="description" placeholder="Description" onChange={handleChange} required className="textarea textarea-bordered w-full" />
            <input name="originalPrice" type="number" placeholder="Prix original" onChange={handleChange} required className="input input-bordered w-full" />
            <input name="discountedPrice" type="number" placeholder="Prix réduit" onChange={handleChange} required className="input input-bordered w-full" />
            <input name="pickupTime" placeholder="Heure retrait (ex: 18h-20h)" onChange={handleChange} className="input input-bordered w-full" />
            <input name="location" placeholder="Lieu" onChange={handleChange} className="input input-bordered w-full" />
            <select name="category" onChange={handleChange} className="select select-bordered w-full">
              <option>Lunch</option>
              <option>Breakfast</option>
              <option>Dinner</option>
              <option>Bakery</option>
              <option>Groceries</option>
            </select>
            <input
              name="restaurant"
              placeholder="Nom du restaurant"
              onChange={handleChange}
              required
              className="input input-bordered w-full"
            />
            <input name="availableQuantity" type="number" placeholder="Quantité" onChange={handleChange} required className="input input-bordered w-full" />
            <input type="file" accept="image/*" onChange={handleImageChange} className="file-input file-input-bordered w-full" />
            <button type="submit" className="btn btn-primary">Valider</button>
          </form>
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
