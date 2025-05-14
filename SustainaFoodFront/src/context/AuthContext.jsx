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
      const response = await axiosInstance.get("/user-details"); // Endpoint that returns current user from cookie
      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
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

  const login = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    return Promise.resolve(); // Return a resolved promise to allow awaiting
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/userLogout");
      // Clear token from localStorage to prevent auto-login on refresh
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear the token even if API call fails
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
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
