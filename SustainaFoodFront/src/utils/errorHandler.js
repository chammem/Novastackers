// Utility to suppress expected auth check errors
export const setupErrorSuppression = () => {
  // Store original console.error
  const originalConsoleError = console.error;
  
  // Override console.error to filter out expected auth errors
  console.error = (...args) => {
    const errorString = args.toString();
    
    // Skip logging expected authentication errors
    if (
      (errorString.includes('401') && errorString.includes('user-details')) ||
      errorString.includes('User not logged in') ||
      (errorString.includes('Request failed') && errorString.includes('401'))
    ) {
      // Skip logging these expected auth check errors
      return;
    }
    
    // Pass other errors to original console.error
    originalConsoleError.apply(console, args);
  };
};
