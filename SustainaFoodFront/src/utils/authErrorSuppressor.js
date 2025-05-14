/**
 * Auth Error Suppressor
 * 
 * This utility prevents 401 authentication errors from cluttering your console.
 * It patches the console methods to filter out expected authentication errors.
 */

// Run immediately when imported
(() => {
  if (typeof window === 'undefined') return;
  
  // Save original console methods
  const originalConsole = {
    error: console.error,
    log: console.log,
    warn: console.warn
  };
  
  // Check if a message is an auth-related error we want to suppress
  const isAuthError = (args) => {
    const errorString = String(args);
    return (
      (errorString.includes('401') && errorString.includes('user-details')) ||
      errorString.includes('User not logged in') ||
      errorString.includes('Authentication required') ||
      (errorString.includes('GET') && errorString.includes('user-details') && errorString.includes('401'))
    );
  };
  
  // Override console.error to filter out auth errors
  console.error = function(...args) {
    if (isAuthError(args)) return; // Silently ignore
    originalConsole.error.apply(console, args);
  };
  
  // Override console.log for auth messages
  console.log = function(...args) {
    if (isAuthError(args)) return; // Silently ignore
    originalConsole.log.apply(console, args);
  };
  
  // Report initialization once
  originalConsole.log('%c[Auth Error Suppressor] Enabled', 'color:#888');
})();
