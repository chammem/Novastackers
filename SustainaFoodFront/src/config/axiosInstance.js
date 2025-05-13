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

// Add a more robust response interceptor to completely silence auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silence ALL 401 errors from user-details endpoint
    if (
      error.config?.url?.includes('user-details') && 
      error.response?.status === 401
    ) {
      // Create a completely silent error object
      const silentError = new Error('Authentication required');
      silentError.isAuthError = true;
      silentError.response = { status: 401 };
      silentError.silent = true; // Mark it so we can identify it elsewhere
      
      // Return the silent error without logging
      return Promise.reject(silentError);
    }
    
    // For other errors, only log if they're not auth-related
    if (
      !(error.response?.status === 401 && 
        (error.config?.url?.includes('login') || 
         error.config?.url?.includes('user')))
    ) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;