import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../config/axiosInstance";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiX, FiEdit, FiTrash2, FiUsers, FiMapPin, FiCalendar } from 'react-icons/fi';
import AdminNavbar from './AdminNavbar';

const AdminDonationsList = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState(null);
  const [editingDonation, setEditingDonation] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    endingDate: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Ajouter ces nouveaux états pour la modale de création
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    endingDate: ''
  });
  const [createImageFile, setCreateImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  // Ajouter un état pour l'utilisateur actuel
  const [currentUser, setCurrentUser] = useState(null);

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Récupérer les informations de l'utilisateur depuis le contexte d'authentification ou une API
        const response = await axiosInstance.get("/users/current-user");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Failed to fetch current user", error);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  // Gérer l'ouverture de la modale de création
  const handleCreateClick = () => {
    setCreateForm({
      name: '',
      description: '',
      endingDate: ''
    });
    setCreateImageFile(null);
    setPreviewImage(null);
    setIsCreating(true);
    setFormType('create');
  };
  
  // Gérer les changements du formulaire de création
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm({ ...createForm, [name]: value });
  };
  
  // Gérer l'upload d'image pour la création
  const handleCreateImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCreateImageFile(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Soumettre le formulaire de création
  const handleCreateSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validation de base
      if (!createForm.name.trim()) {
        toast.error("Le nom de la campagne est requis");
        setIsLoading(false);
        return;
      }
      
      // Préparer les données
      const formData = new FormData();
      Object.keys(createForm).forEach(key => {
        if (createForm[key]) formData.append(key, createForm[key]);
      });
      
      if (createImageFile) {
        formData.append('image', createImageFile);
      }
      
      // Envoyer la requête
      const response = await axiosInstance.post(
        "/donations/create-donation",
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      // Traiter la réponse
      if (response.data) {
        // Ajouter la nouvelle campagne à la liste
        const newDonation = response.data.donation || response.data.data;
        setDonations([newDonation, ...donations]);
        setFilteredDonations([newDonation, ...filteredDonations]);
        
        toast.success("Campagne créée avec succès!");
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error(error.response?.data?.message || "Échec de la création de la campagne");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axiosInstance.get("/donations/get-all-donations");
        setDonations(response.data);
        setFilteredDonations(response.data);
      } catch (error) {
        toast.error("Failed to load donations");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setFilteredDonations(donations);
    } else {
      const filtered = donations.filter(donation => 
        donation.name.toLowerCase().includes(term) || 
        donation.description.toLowerCase().includes(term) ||
        (donation.organization?.name && donation.organization.name.toLowerCase().includes(term))
      );
      setFilteredDonations(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredDonations(donations);
  };

  const handleDeleteClick = (donationId) => {
    setDonationToDelete(donationId);
    setShowConfirmDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/donations/deleteDonation/${donationToDelete}`);
      setDonations(prev => prev.filter(d => d._id !== donationToDelete));
      setFilteredDonations(prev => prev.filter(d => d._id !== donationToDelete));
      toast.success("Donation deleted successfully");
    } catch (error) {
      toast.error("Failed to delete donation");
      console.error(error);
    } finally {
      setShowConfirmDialog(false);
      setDonationToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmDialog(false);
    setDonationToDelete(null);
  };

  const handleEditClick = (donation) => {
    setEditingDonation(donation);
    setEditForm({
      name: donation.name || '',
      description: donation.description || '',
      endingDate: donation.endingDate ? new Date(donation.endingDate).toISOString().split('T')[0] : ''
    });
    setIsEditing(true);
    setFormType('edit');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        if (editForm[key]) formData.append(key, editForm[key]);
      });
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      // Essayons d'utiliser une URL différente pour le debug
      // Au lieu de /donations/update/:id, essayons une alternative
      console.log(`Trying alternate endpoint for update: /donations/updateDonation/${editingDonation._id}`);
      
      const response = await axiosInstance.put(
        `/donations/updateDonation/${editingDonation._id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      // Log plus détaillé de la réponse
      console.log("Update response:", response);
      
      if (response.data.success) {
        const updatedDonations = donations.map(d => 
          d._id === editingDonation._id ? response.data.data : d
        );
        setDonations(updatedDonations);
        setFilteredDonations(
          searchTerm 
            ? updatedDonations.filter(d => 
                d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : updatedDonations
        );
        
        toast.success("Donation updated successfully");
        setIsEditing(false);
        setEditingDonation(null);
        setImageFile(null);
      } else {
        toast.error(response.data.message || "Failed to update donation");
      }
    } catch (error) {
      console.error("Error updating donation:", error);
      
      // Ajouter des logs détaillés pour mieux comprendre l'erreur
      if (error.response) {
        // Le serveur a répondu avec un statut d'erreur
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        console.log("Error response headers:", error.response.headers);
      } else if (error.request) {
        // La requête a été faite mais pas de réponse reçue
        console.log("Error request:", error.request);
      }
      
      // Afficher une erreur plus précise pour l'utilisateur
      toast.error(
        error.response?.data?.message || 
        `Update failed: ${error.message}. Please check console for details.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Ajouter de nouveaux états pour la confirmation
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingFormSubmit, setPendingFormSubmit] = useState(null);
  const [formType, setFormType] = useState(''); // 'edit' ou 'create'

  // Nouvelles fonctions pour gérer la confirmation avant enregistrement
  const handleFormSubmit = (e, type) => {
    e.preventDefault();
    setPendingFormSubmit(e);
    setFormType(type);
    setShowSaveConfirm(true);
  };

  const confirmSubmit = () => {
    if (!pendingFormSubmit) return;
    
    if (formType === 'edit') {
      handleEditSubmit(pendingFormSubmit);
    } else {
      handleCreateSubmit(pendingFormSubmit);
    }
    
    setShowSaveConfirm(false);
    setPendingFormSubmit(null);
  };

  // Créer une fonction pour déterminer le statut basé sur la date de fin
  const getDonationStatus = (endDate) => {
    if (!endDate) return 'Active';
    
    const now = new Date();
    const end = new Date(endDate);
    
    return end < now ? 'Expired' : 'Active';
  };

  if (isLoading) {
    return (
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-20'} flex flex-col items-center justify-center min-h-[50vh] p-8`}>
        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
        <p className="text-gray-600 text-lg">Loading campaigns...</p>
      </div>
    );
  }

  return (
      <>
        <AdminNavbar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab="campaigns"
        />
    
        <div 
          className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} pt-20 pb-8 px-2 md:px-8`}
          style={{ minHeight: "calc(100vh - 64px)" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-green-700 mb-1">
                  Donation Campaigns
                </h1>
                <p className="text-gray-500 text-base md:text-lg">
                  Manage all donation campaigns and track their progress in real-time.
                </p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold shadow hover:bg-green-200 transition-colors"
                  onClick={handleCreateClick}
                >
                  <FiPlus className="inline mr-1" /> New Campaign
                </button>
              </div>
            </div>
  
            {showConfirmDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full">
                  <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
                  <p>Are you sure you want to delete this campaign?</p>
                  <div className="flex justify-end gap-4 mt-6">
                    <button onClick={handleDeleteCancel} className="btn btn-outline">
                      Cancel
                    </button>
                    <button onClick={handleDeleteConfirm} className="btn btn-error text-white">
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
  
            {isEditing && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 p-0 rounded-xl shadow-2xl max-w-2xl w-full my-8"
                >
                  {/* Bannière supérieure fixe */}
                  <div className="bg-gradient-to-r from-green-600 to-green-700 py-6 px-8 rounded-t-xl sticky top-0 z-10">
                    <h3 className="text-2xl font-bold text-white">Edit Campaign</h3>
                    <p className="text-green-100 text-sm mt-1">Update your campaign details below</p>
                  </div>
                  
                  {/* Contenu avec scrolling */}
                  <div className="max-h-[70vh] overflow-y-auto">
                    <form onSubmit={(e) => handleFormSubmit(e, 'edit')} className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              Campaign Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={editForm.name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                              required
                              placeholder="Enter campaign name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              Description
                            </label>
                            <textarea
                              name="description"
                              value={editForm.description}
                              onChange={handleInputChange}
                              rows="5"
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                              placeholder="Describe your campaign"
                            ></textarea>
                          </div>
                          
                          {/* Le champ "Location" a été supprimé */}
                        </div>
                        
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                End Date
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <FiCalendar className="text-gray-400" />
                                </div>
                                <input
                                  type="date"
                                  name="endingDate"
                                  value={editForm.endingDate}
                                  onChange={handleInputChange}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              Campaign Image
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-green-500 dark:hover:border-green-500 transition-colors">
                              <div className="space-y-1 text-center">
                                {editingDonation.imageUrl && !imageFile ? (
                                  <div className="relative">
                                    <img 
                                      src={`http://localhost:8082/${editingDonation.imageUrl}`}
                                      alt="Current campaign"
                                      className="mx-auto h-32 object-cover rounded"
                                    />
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                      Current image
                                    </p>
                                  </div>
                                ) : imageFile ? (
                                  <div className="relative">
                                    <img 
                                      src={URL.createObjectURL(imageFile)}
                                      alt="New campaign"
                                      className="mx-auto h-32 object-cover rounded"
                                    />
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                      New image selected
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      No image selected
                                    </p>
                                  </>
                                )}
                                <div className="flex justify-center text-sm text-gray-600 dark:text-gray-400">
                                  <label htmlFor="edit-image-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input 
                                      id="edit-image-upload" 
                                      name="edit-image-upload" 
                                      type="file" 
                                      className="sr-only"
                                      accept="image/*"
                                      onChange={handleImageChange}
                                    />
                                  </label>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  PNG, JPG, GIF up to 5MB
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Déplacer les boutons en dehors du formulaire pour les fixer en bas */}
                    </form>
                  </div>
                  
                  {/* Boutons fixes en bas */}
                  <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
                    <div className="flex justify-end gap-4">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditingDonation(null);
                          setImageFile(null);
                        }}
                        className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                        disabled={isLoading}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleFormSubmit(e, 'edit')}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-colors shadow-md"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : "Continue"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
  
            {/* Modale de création de campagne - harmonisée avec la modale d'édition */}
            {isCreating && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 p-0 rounded-xl shadow-2xl max-w-2xl w-full my-8"
                >
                  {/* Bannière supérieure fixe - même style que l'édition */}
                  <div className="bg-gradient-to-r from-green-600 to-green-700 py-6 px-8 rounded-t-xl sticky top-0 z-10">
                    <h3 className="text-2xl font-bold text-white">Create New Campaign</h3>
                    <p className="text-green-100 text-sm mt-1">Set up a new donation campaign</p>
                  </div>
                  
                  {/* Contenu avec scrolling - identique à la forme d'édition */}
                  <div className="max-h-[70vh] overflow-y-auto">
                    <form onSubmit={(e) => handleFormSubmit(e, 'create')} className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              Campaign Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={createForm.name}
                              onChange={handleCreateInputChange}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                              required
                              placeholder="Enter campaign name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              Description
                            </label>
                            <textarea
                              name="description"
                              value={createForm.description}
                              onChange={handleCreateInputChange}
                              rows="5"
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                              placeholder="Describe your campaign"
                            ></textarea>
                          </div>
                          
                          {/* Le champ "Location" a été supprimé */}
                        </div>
                        
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                End Date
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <FiCalendar className="text-gray-400" />
                                </div>
                                <input
                                  type="date"
                                  name="endingDate"
                                  value={createForm.endingDate}
                                  onChange={handleCreateInputChange}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 dark:text-white transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              Campaign Image
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-green-500 dark:hover:border-green-500 transition-colors">
                              <div className="space-y-1 text-center">
                                {previewImage ? (
                                  <div className="relative">
                                    <img 
                                      src={previewImage}
                                      alt="Preview"
                                      className="mx-auto h-32 object-cover rounded"
                                    />
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                      Image preview
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      No image selected
                                    </p>
                                  </>
                                )}
                                <div className="flex justify-center text-sm text-gray-600 dark:text-gray-400">
                                  <label htmlFor="create-image-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-green-600 dark:text-green-400 hover:text-green-500 focus-within:outline-none">
                                    <span>Upload a file</span>
                                    <input 
                                      id="create-image-upload" 
                                      name="create-image-upload" 
                                      type="file" 
                                      className="sr-only"
                                      accept="image/*"
                                      onChange={handleCreateImageChange}
                                    />
                                  </label>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  PNG, JPG, GIF up to 5MB
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Déplacer les boutons en dehors du formulaire pour les fixer en bas */}
                    </form>
                  </div>
                  
                  {/* Boutons fixes en bas */}
                  <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
                    <div className="flex justify-end gap-4">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button" 
                        onClick={() => setIsCreating(false)}
                        className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                        disabled={isLoading}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleFormSubmit(e, 'create')}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-colors shadow-md"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                          </span>
                        ) : "Continue"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
  
            <div className="mb-8">
              <div className="form-control w-full max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    className="input input-bordered w-full pl-4 pr-14"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-primary btn-sm"
                    type="button"
                  >
                    {isSearching ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <FiSearch size={18} />
                    )}
                  </button>
                </div>
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="btn btn-sm btn-ghost flex items-center gap-1 mt-2"
                  >
                    <FiX size={16} /> Clear search
                  </button>
                )}
              </div>
            </div>
  
            <AnimatePresence mode="wait">
              {filteredDonations.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto"
                >
                  {filteredDonations.map((donation, index) => {
                    return (
                      <motion.div
                        key={donation._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        className="group"
                      >
                        <div className="relative h-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
                          {donation.imageUrl && (
                            <div className="relative overflow-hidden h-44">
                              <img
                                src={`http://localhost:8082/${donation.imageUrl}`}
                                alt={donation.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              
                              <div className="absolute top-3 left-3">
                                <div className={`px-2.5 py-1 text-xs rounded-full ${
                                  getDonationStatus(donation.endingDate) === 'Active' 
                                    ? 'bg-green-500/80' 
                                    : 'bg-red-500/80'
                                  } backdrop-blur-sm text-white font-medium`}>
                                  {getDonationStatus(donation.endingDate)}
                                </div>
                              </div>
                              
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className="text-base font-bold text-white line-clamp-1">{donation.name}</h3>
                              </div>
                            </div>
                          )}
                          
                          <div className="p-4">
                            {!donation.imageUrl && (
                              <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">{donation.name}</h3>
                            )}
                            
                            <div className="flex items-center text-sm text-gray-600 mt-2">
                              <FiUsers size={14} className="mr-1.5 text-green-500" />
                              <span className="line-clamp-1 font-medium">
                                {donation.ngoId?.fullName || 
                                 (currentUser?.fullName ? `Created by: ${currentUser.fullName}` : "Admin")}
                              </span>
                            </div>
                            
                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {donation.description || "No description"}
                            </p>
                            
                            {/* La section location a été supprimée */}
                            
                            <div className="mt-4 flex justify-end gap-2">
                              <button
                                className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium flex items-center"
                                onClick={() => handleEditClick(donation)}
                              >
                                <FiEdit size={14} className="mr-1" /> Edit
                              </button>
                              <button
                                className="px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium flex items-center"
                                onClick={() => handleDeleteClick(donation._id)}
                              >
                                <FiTrash2 size={14} className="mr-1" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12"
                >
                  <div className="max-w-md mx-auto bg-base-100 p-6 rounded-xl shadow-md">
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto">
                        <FiSearch size={24} className="text-gray-400" />
                      </div>
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-gray-800">No campaigns found</h3>
                    <p className="mt-2 text-gray-600">
                      {searchTerm 
                        ? "Try different search terms" 
                        : "No campaigns available at the moment"}
                    </p>
                    {searchTerm && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClearSearch}
                        className="mt-4 btn btn-outline btn-sm"
                      >
                        Clear search
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Boîte de dialogue de confirmation avant enregistrement - nouvelle et innovante */}
        {showSaveConfirm && (
          <div className="fixed inset-0 bg-gradient-to-br from-black/70 to-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl max-w-md w-full"
            >
              <div className="relative">
                {/* Bannière graphique supérieure */}
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-32 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 rounded-full bg-white/10 animate-pulse"></div>
                    <div className="w-48 h-48 rounded-full bg-white/20 absolute animate-ping"></div>
                  </div>
                  <div className="text-white text-2xl font-bold z-10 drop-shadow-lg">Confirm Your Action</div>
                </div>
                
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formType === 'edit' ? 'Save Changes?' : 'Create Campaign?'}
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      {formType === 'edit' 
                        ? "You're about to update this donation campaign. This will be visible to all users."
                        : "You're about to create a new donation campaign. This will be visible to all users."}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-medium"
                      onClick={() => setShowSaveConfirm(false)}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white font-medium shadow-lg shadow-green-500/20"
                      onClick={confirmSubmit}
                    >
                      {formType === 'edit' ? 'Save Changes' : 'Create Campaign'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </>
    );
};

export default AdminDonationsList;