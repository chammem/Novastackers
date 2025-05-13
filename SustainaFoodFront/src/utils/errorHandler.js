// More advanced error suppression targeting the specific error pattern

// Override window.console methods globally before any other code runs
(function() {
  // Skip if not in browser or already initialized
  if (typeof window === 'undefined' || window.__errorHandlerInitialized) {
    return;
  }

  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  
  // Override console.error with more precise filtering
  console.error = function(...args) {
    // Convert arguments to string for pattern matching
    const errorText = JSON.stringify(args);
    
    // Check for auth-related error patterns in network requests
    if (
      // Specific patterns from the 401 response
      errorText.includes('sustainafood-backend-fzme.onrender.com/api/user-details') ||
      errorText.includes('401 Unauthorized') ||
      // Generic auth error patterns
      (errorText.includes('401') && errorText.includes('user-details')) ||
      errorText.includes('User not logged in') ||
      errorText.includes('Auth') && errorText.includes('status code 401') ||
      (errorText.includes('Request failed') && errorText.includes('401')) ||
      errorText.includes('Error checking auth status')
    ) {
      // Silently ignore these expected auth errors
      return;
    }
    
    // Forward other errors to original console.error
    return originalConsoleError.apply(console, args);
  };
  
  // Do the same for console.log to catch any auth errors logged there
  console.log = function(...args) {
    const logText = JSON.stringify(args);
    
    if (
      logText.includes('User not logged in') ||
      (logText.includes('401') && logText.includes('user-details')) ||
      logText.includes('sustainafood-backend-fzme.onrender.com/api/user-details')
    ) {
      return; // Silent suppress
    }
    
    return originalConsoleLog.apply(console, args);
  };
  
  // Also handle warnings that might contain auth errors
  console.warn = function(...args) {
    const warnText = JSON.stringify(args);
    
    if (
      warnText.includes('401') || 
      warnText.includes('Unauthorized') ||
      warnText.includes('user-details')
    ) {
      return; // Silent suppress
    }
    
    return originalConsoleWarn.apply(console, args);
  };
  
  // Mark as initialized to prevent double initialization
  window.__errorHandlerInitialized = true;
  
  // Log confirmation (will be visible)
  originalConsoleLog('Auth error suppression initialized');
})();

// Export for explicit initialization if needed
export const setupErrorSuppression = () => {
  // Already initialized by the IIFE above
  console.log('Error suppression already initialized');
};
