/**
 * Error Suppressor
 * Prevents authentication-related error messages from being logged to the console
 */

// This will run immediately when imported
(function() {
  if (typeof window === 'undefined') return;
  
  // Save original console methods
  const originalConsole = {
    error: console.error,
    log: console.log,
    warn: console.warn
  };
  
  // Replace console.error
  console.error = function(...args) {
    // Convert to string for easier matching
    const errorString = JSON.stringify(args);
    
    // Skip logging auth-related errors
    if (errorString.includes('user-details') && 
        (errorString.includes('401') || 
         errorString.includes('Unauthorized') || 
         errorString.includes('Authentication required') ||
         errorString.includes('User not logged in'))) {
      // Don't log these expected auth errors
      return;
    }
    
    // Pass through to original console.error
    return originalConsole.error.apply(console, args);
  };
  
  // Replace console.log for some auth messages
  console.log = function(...args) {
    if (args.length === 1 && args[0] === 'User not logged in') {
      return; // Suppress this specific message
    }
    return originalConsole.log.apply(console, args);
  };
  
  // Show a single initialization message (using original console)
  originalConsole.log('%c[Error Suppressor] Authentication errors will be hidden', 'color: #888');
})();

export default {}; // Default export for easier importing
