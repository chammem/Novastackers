// utils/auth.js
import axiosInstance from './axiosInstance';
import { getCookie, setCookie } from './cookieUtils';

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/login', credentials);
  if (response.data.token) {
    setCookie('token', response.data.token, 7); // Stocke le token pour 7 jours
  }
  return response.data;
};

export const logoutUser = () => {
  setCookie('token', '', -1); // Supprimer le cookie
};

export const isAuthenticated = () => {
  return !!getCookie('token');
};
