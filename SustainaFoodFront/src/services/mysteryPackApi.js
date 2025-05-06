// src/services/mysteryPackApi.js
import axiosInstance from "../config/axiosInstance";

const mysteryPackApi = {
  // 🔹 Récupérer tous les MysteryPacks
  getAllMysteryPacks: () => axiosInstance.get("/mystery-packs"),

  // 🔹 Récupérer un MysteryPack par ID
  getMysteryPackById: (packId) => axiosInstance.get(`/mystery-packs/${packId}`),

  // 🔹 Créer un nouveau MysteryPack
  createMysteryPack: (newPackData) => axiosInstance.post("/mystery-packs", newPackData),

  // 🔹 Mettre à jour un MysteryPack
  updateMysteryPack: (packId, updatedData) => axiosInstance.put(`/mystery-packs/${packId}`, updatedData),

  // 🔹 Supprimer un MysteryPack
  deleteMysteryPack: (id) => axiosInstance.delete(`/mystery-packs/${id}`),

  // 🔹 Réserver un MysteryPack
  reserveMysteryPack: (packId) => axiosInstance.patch(`/mystery-packs/${packId}/reserve`),

  // 🔹 Récupérer tous les articles FoodSales
  getFoodSales: () => axiosInstance.get("/foodsales"),

  // 🔹 Créer un mystery pack avec articles sélectionnés
  createMysteryPackWithItems: (formData) => {
    return axiosInstance.post("/mystery-packs/new", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
};

export default mysteryPackApi;
