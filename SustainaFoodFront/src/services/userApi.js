import axios from "axios";

const API_URL = "http://localhost:3000/api";

const userApi = {
  // 🔹 Récupérer tous les utilisateurs
  getAllUsers: () => axios.get(`${API_URL}/users`),

  // 🔹 Récupérer un utilisateur par ID
  getUserById: (userId) => axios.get(`${API_URL}/user/${userId}`),

  // 🔹 Mettre à jour un utilisateur
  updateUser: (userId, updatedData) => axios.put(`${API_URL}/updateUser/${userId}`, updatedData),

  // 🔹 Supprimer un utilisateur
  deleteUser: (userId) => axios.delete(`${API_URL}/deleteUser/${userId}`),
};

export default userApi;

