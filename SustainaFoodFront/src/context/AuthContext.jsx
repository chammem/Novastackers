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
      
      // Check for token first
      const token = localStorage.getItem('token');
      if (!token) {
        // If no token, don't even try to call the API
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      
      // Use a custom silent fetch instead of axiosInstance to avoid logging errors
      try {
        const response = await fetch(
          'https://sustainafood-backend-fzme.onrender.com/api/user-details', 
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
          setUser(data.data);
          setIsAuthenticated(true);
        } else {
          // Silently handle auth failure
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (fetchError) {
        // Silently handle network errors
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
