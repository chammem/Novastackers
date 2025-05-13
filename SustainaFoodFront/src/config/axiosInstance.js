import axios from 'axios';

// Environment detection that works with Jest
const isProd = process.env.NODE_ENV === 'production';

// Determine the base URL based on the environment
const baseURL = isProd
  ? 'https://sustainafood-backend-fzme.onrender.com/api'
  : 'http://localhost:10000/api'; // Updated to match your server port

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