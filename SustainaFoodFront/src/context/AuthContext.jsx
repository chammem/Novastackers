import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../config/axiosInstance";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to check authentication status from server
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Skip the API call entirely if no token exists
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Only make the API call if we have a token
      const response = await axiosInstance.get('/user-details');
      
      if (response.data?.data) {
        setUser(response.data.data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      // Don't log this as an error if it's just a 401 - that's normal when not logged in
      if (error.response?.status === 401) {
        console.log('User not authenticated, clearing token');
      } else {
        console.error('Error checking auth status:', error);
      }
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth status when the app loads
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    return Promise.resolve(); // Return a resolved promise to allow awaiting
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
