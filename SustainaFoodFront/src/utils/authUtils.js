import axiosInstance from '../config/axiosInstance';

/**
 * Checks user authentication status without logging expected 401 errors
 * @returns {Promise<Object|null>} User object if authenticated, null if not
 */
export const checkAuth = async () => {
  try {
    // Use a modified axios instance just for this call to avoid interceptors
    const response = await axiosInstance.get('/user-details', {
      // Add custom property to identify auth check requests
      _isAuthCheck: true,
    });
    
    return response.data?.data || null;
  } catch (error) {
    // Only log if it's not a 401 (which is expected for auth checks)
    if (error.response?.status !== 401) {
      console.error('Unexpected auth check error:', error);
    }
    return null;
  }
};

/**
 * Sets up auth-related event listeners and error handlers
 */
export const setupAuthErrorHandling = () => {
  // Create a cleaner console.error that doesn't log auth check errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Skip logging auth-related 401 errors
    const isAuthError = args.some(arg => 
      typeof arg === 'string' && 
      (arg.includes('user-details') || arg.includes('User not logged in'))
    );
    
    if (!isAuthError) {
      originalConsoleError(...args);
    }
  };
};
