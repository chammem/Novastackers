import axios from "axios";

// Detect if we're in production (on Render)
const isProduction = window.location.host.includes('onrender.com');

// Use the appropriate base URL
const baseURL = isProduction
    ? "https://sustainafood-backend-fzme.onrender.com/api"
    : "http://localhost:8082/api";

const axiosInstance = axios.create({
    baseURL,
    headers: { 
        "Content-Type": "application/json"
    },
    withCredentials: true, 
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });
  
export default axiosInstance;