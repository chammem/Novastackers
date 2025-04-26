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
  
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
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
            activeTab="campaigns" // Mis à jour pour correspondre à l'onglet actif
          />
      
          {/* Sidebar */}
          <div className={`fixed h-full bg-gray-800 text-white transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className="p-4">
              {sidebarOpen ? 'Menu complet' : 'Icônes seulement'}
            </div>
          </div>
      
          {/* Contenu principal */}
          <div className={`transition-all duration-300 min-h-screen ${sidebarOpen ? 'ml-80' : 'ml-20'} pt-16`}>
            <div className="p-8">
      
              {/* Boîte de dialogue de confirmation */}
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
      
              {/* En-tête */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Donation Campaigns</h1>
              </motion.div>
      
              {/* Recherche et ajout */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="form-control w-full md:w-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, description or organization..."
                      className="input input-bordered w-full pl-4 pr-14"
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-primary btn-sm"
                      type="button"
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <FiSearch size={18} />
                      )}
                    </button>
                  </div>
                </div>
      
                <div className="flex gap-2 w-full md:w-auto">
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="btn btn-sm btn-ghost flex items-center gap-1"
                    >
                      <FiX size={16} /> Clear search
                    </button>
                  )}
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/admin/donations/create')}
                  >
                    <FiPlus className="mr-1" /> Add New Campaign
                  </button>
                </div>
              </div>
      
              {/* Grille de campagnes */}
              <AnimatePresence mode="wait">
                {filteredDonations.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {filteredDonations.map((donation, index) => (
                      <motion.div
                        key={donation._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        whileHover={{ y: -5 }}
                        className="card bg-base-100 shadow-lg hover:shadow-xl transition-all border border-base-300"
                      >
                        {donation.imageUrl && (
                          <figure className="overflow-hidden h-48">
                            <img
                              src={`http://localhost:8082/${donation.imageUrl}`}
                              alt={donation.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </figure>
                        )}
                        <div className="card-body">
                          <div className="flex justify-between items-start">
                            <h3 className="card-title text-xl">{donation.name}</h3>
                            <div className="badge badge-primary">
                              {donation.status || 'Active'}
                            </div>
                          </div>
      
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <FiUsers className="mr-1" />
                            <span>{donation.ngoId?.fullName|| "Unknown organization"}</span>
                          </div>
      
                          <p className="mt-3 text-gray-600 line-clamp-3">
                            {donation.description}
                          </p>
      
                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <FiMapPin className="text-primary" />
                              <span>{donation.location || "Location not specified"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiCalendar className="text-primary" />
                              <span>
                                {donation.endingDate 
                                  ? `Until ${formatDate(donation.endingDate)}` 
                                  : "No end date"}
                              </span>
                            </div>
                          </div>
      
                          <div className="card-actions justify-end mt-4">
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              className="btn btn-outline btn-sm"
                              onClick={() => navigate(`/admin/donations/edit/${donation._id}`)}
                            >
                              <FiEdit className="mr-1" /> Edit
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              className="btn btn-error btn-sm text-white"
                              onClick={() => handleDeleteClick(donation._id)}
                            >
                              <FiTrash2 className="mr-1" /> Delete
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
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
        </>
      );
  };
  
  export default AdminDonationsList;