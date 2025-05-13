import axios from "axios";

// Force production URL when in production environment (like Render)
const isProductionHost = window.location.host.includes('onrender.com');

// Determine the base URL based on the environment
const baseURL = isProductionHost
  ? 'https://sustainafood-backend-fzme.onrender.com/api'
  : 'http://localhost:8082/api'; // localhost for development

const axiosInstance = axios.create({
    baseURL,
    headers: { 
        "Content-Type": "application/json"
    },
    withCredentials: true, 
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    // Tag auth check requests for special handling
    if (config.url.includes('user-details')) {
      config._isAuthCheck = true;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to silently handle auth check errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log auth errors from user-details endpoint
    const isAuthCheck = error.config?._isAuthCheck || 
                       error.config?.url?.includes('user-details');
    const isAuthError = error.response?.status === 401;
    
    if (!(isAuthCheck && isAuthError)) {
      // Only log non-auth check errors
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;