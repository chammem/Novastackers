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

// Ensure the token is properly added to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Set Authorization header with Bearer prefix
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log for debugging (remove in production)
      console.log('Adding token to request:', config.url);
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

// Add a custom logout function that properly clears the token
axiosInstance.logout = async () => {
  try {
    // Call the logout endpoint
    await axiosInstance.post('/userLogout');
    
    // Always clear localStorage, regardless of API response
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Force reload to ensure all app state is reset (uncomment if needed)
    // setTimeout(() => window.location.reload(), 100);
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if API fails, still clear local storage
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    return { success: false, error };
  }
};

// Create a custom auth check function that doesn't use the interceptors
axiosInstance.silentAuthCheck = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Make a direct fetch call without using the intercepted axios
    const response = await fetch(
      `${baseURL}/user-details`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export default axiosInstance;