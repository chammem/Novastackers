import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../config/axiosInstance";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to check authentication status from server
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Use silentAuthCheck to avoid console errors
      const userData = await axiosInstance.silentAuthCheck();
      
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Clean up if not authenticated
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Silently handle auth errors
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status when the app loads
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Login function using fetch to ensure cookies are properly handled
  const login = async (email, password) => {
    try {
      // Use our custom fetch-based login
      const result = await axiosInstance.loginWithFetch(email, password);
      
      if (result.success) {
        // Refresh user data
        await checkAuthStatus();
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/userLogout");
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        checkAuthStatus, // Export this to allow manual refresh of auth state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
