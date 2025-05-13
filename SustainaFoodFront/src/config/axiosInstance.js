import axios from 'axios';

// Force production URL when in production environment (like Render)
const isProductionHost = window.location.host.includes('onrender.com');

// Determine the base URL based on the environment
const baseURL = isProductionHost
  ? 'https://sustainafood-backend-fzme.onrender.com/api'
  : 'http://localhost:10000/api'; // localhost for development

console.log('Using API URL:', baseURL); // Debug log

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;