// src/components/HeaderMid.jsx
import React from 'react';
import { useNavigate, Link, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext"; // use auth context
import { useNotifications } from "../context/NotificationContext";
import axiosInstance from "../config/axiosInstance";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiTrash2,
  FiEdit,
} from "react-icons/fi";

function HeaderMid() {
  const navigate = useNavigate();
  const { user, logout, checkAuthStatus } = useAuth();
  const { notifications, unreadCount, setNotifications } = useNotifications();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track scroll for navbar appearance change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Force refresh user data when component mounts or route changes
  useEffect(() => {
    checkAuthStatus();
  }, [window.location.pathname]);

  // Check if user needs activation and show notification
  useEffect(() => {
    // Only run when user data changes and user exists
    if (user) {
      // Get the flag from sessionStorage
      const activationToastShown = sessionStorage.getItem('activationToastShown');
      
      // Check if the user is a restaurant or volunteer and not active, and toast hasn't been shown
      if ((user.role === "restaurant" || user.role === "volunteer" || user.role === "supermarket" || user.role === "driver") && 
          !user.active && 
          activationToastShown !== 'true') {
        
        // Set the flag before showing toast
        sessionStorage.setItem('activationToastShown', 'true');
        
        toast.warning(
          <div>
            Your account needs activation. 
            <button 
              className="btn btn-xs btn-warning ml-2"
              onClick={() => navigate("/activateAccount")}
            >
              Activate Now
            </button>
          </div>, 
          {
            autoClose: 10000, // Keep open longer than default
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      // Use the enhanced logout method from axiosInstance
      const result = await axiosInstance.logout();
      
      // This will run even if API call fails
      logout(); // Call the context logout
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Error logging out");
      // Force logout anyway for safety
      localStorage.removeItem('token');
      logout();
      navigate("/login");
    }
  };

  const clearAll = async () => {
    try {
      await axiosInstance.delete(`/notification/clear-all/${user._id}`);
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch {
      toast.error("Error clearing notifications");
    }
  };

  const deleteOne = async (id) => {
    try {
      await axiosInstance.delete(`/notification/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 shadow-md backdrop-blur-sm" : "bg-white"
        }`}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center py-3 px-4">
          <NavLink to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg overflow-hidden"
            >
              <img 
                src="/images/logo.png" 
                alt="SustainaFood Logo" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <span className="text-xl font-bold text-primary hidden sm:block">
              SustainaFood
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {/* Home link first */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `btn btn-sm ${
                  isActive
                    ? "btn-primary text-white"
                    : "btn-ghost text-gray-700"
                }`
              }
            >
              Home
            </NavLink>

            {/* Role-specific links directly after Home */}
            {user?.role === "charity" && (
              <>
                <NavLink
                  to="/my-campaigns"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  My Campaigns
                </NavLink>
              </>
            )}
            {user?.role === "volunteer" && (
              <>
                <NavLink
                  to="/volunteer"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/volunteer-availability"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  Availability
                </NavLink>
                <NavLink
                  to="/requested-assignments"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  Assignments
                </NavLink>
                <NavLink
                  to="/donations"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  Volunteer
                </NavLink>
              </>
            )}
            {user?.role === "restaurant" && (
              <>
                <NavLink
                  to="/donations"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  Donate
                </NavLink>
                <NavLink
                  to="/my-donations"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  My Donations
                </NavLink>
                <NavLink
                  to="/food-sales"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  Food Sales
                </NavLink>
                <NavLink
                  to="/suggested-products-list"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  Suggested
                </NavLink>
              </>
            )}
            {user?.role === "supermarket" && (
              <>
                <NavLink
                  to="/donations"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  Donate
                </NavLink>
                <NavLink
                  to="/my-donations"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                 My donations
                </NavLink>
              </>
            )}
            {user?.role === "user" && (
              <>
                <NavLink
                  to="/available-food"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  Food Sale
                </NavLink>
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                  Orders
                </NavLink>
              </>
            )}

            {user?.role === "driver" && (
              <>
                 <NavLink
                  to="/driver-dashboard"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
              Driver dashboard
                </NavLink>
                <NavLink
                  to="/requested-deliveries"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive
                        ? "btn-primary text-white"
                        : "btn-ghost text-gray-700"
                    }`
                  }
                >
                 Deliveries
                </NavLink>
            
              </>
            )}

            {/* Other common links after role-specific ones */}
            {[
              { to: "/features", label: "Features" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `btn btn-sm ${
                    isActive
                      ? "btn-primary text-white"
                      : "btn-ghost text-gray-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* User Actions Section */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <div className="dropdown dropdown-end">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <div className="indicator">
                      <FiBell className="h-5 w-5" />
                      <AnimatePresence>
                        {unreadCount > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="badge badge-xs badge-primary indicator-item"
                          >
                            {unreadCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                  <div
                    tabIndex={0}
                    className="dropdown-content card card-compact w-64 p-2 shadow bg-base-100"
                  >
                    <div className="card-body">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Notifications</h3>
                        <div className="flex gap-1">
                          {notifications.length > 0 && (
                            <>
                              <button
                                className="btn btn-xs btn-ghost text-error"
                                onClick={clearAll}
                              >
                                <FiTrash2 className="w-3 h-3" />
                                <span className="ml-1">Clear</span>
                              </button>
                              <Link
                                to="/notifications"
                                className="btn btn-xs btn-ghost text-primary"
                              >
                                <span>View All</span>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="divider my-1"></div>
                      <div className="max-h-48 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 5).map((n, i) => (
                            <motion.div
                              key={n._id || i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="py-2 border-b last:border-0 border-base-200 relative group"
                            >
                              <p className="text-sm">{n.message}</p>
                              <span className="text-xs text-gray-500">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                className="absolute right-0 top-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deleteOne(n._id)}
                              >
                                <FiX size={16} />
                              </button>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <FiBell className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              No notifications
                            </p>
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <Link
                          to="/notifications"
                          className="btn btn-xs btn-primary w-full mt-2"
                        >
                          View All ({notifications.length})
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Avatar dropdown */}
                <div className="dropdown dropdown-end">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    tabIndex={0}
                    className="btn btn-primary btn-sm gap-2 normal-case"
                  >
                    <div className="avatar">
                      <div className="w-6 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                        <div className="flex items-center justify-center bg-white text-primary h-full w-full">
                          {user?.fullName?.charAt(0).toUpperCase() || "U"}
                        </div>
                      </div>
                    </div>
                    <span className="hidden sm:inline">
                      {user?.fullName?.split(" ")[0] || "User"}
                    </span>
                  </motion.div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu menu-sm p-2 shadow bg-base-100 rounded-box w-52 mt-2"
                  >
                    <li className="menu-title">
                      <span className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </span>
                    </li>
                    <li>
                      <Link to="/profile" className="flex items-center">
                        <FiUser className="w-4 h-4" />
                        Profile
                      </Link>
                    </li>
                    {/* Add NGO Profile Update Link for charity/NGO users */}
                    {user?.role === "charity" && (
                      <li>
                        <Link to="/ngo-profile" className="flex items-center">
                          <FiEdit className="w-4 h-4" />
                          NGO Profile
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={handleLogout}
                        className="text-error flex items-center"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-sm btn-ghost"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/role">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-sm btn-primary"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden btn btn-sm btn-ghost btn-circle"
          >
            {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white shadow-lg md:hidden overflow-hidden"
          >
            <ul className="menu menu-sm p-4">
              {/* Home link first */}
              <li>
                <NavLink
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Home
                </NavLink>
              </li>

              {/* Role specific links directly after Home */}
              {user?.role === "charity" && (
                <>
                  <li>
                    <NavLink
                      to="/donationForm"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      Create Campaign
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/my-campaigns"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      My Campaigns
                    </NavLink>
                  </li>
                </>
              )}
              {user?.role === "volunteer" && (
                <>
                  <li>
                    <NavLink
                      to="/volunteer"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      Volunteer Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/volunteer/availability"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      Manage Availability
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/requested-assignments"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      Requested Assignments
                    </NavLink>
                  </li>
                </>
              )}
              {user?.role === "restaurant" && (
                <>
                  <li>
                    <NavLink
                      to="/donations"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      Donate
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/my-donations"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      My donations
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/food-sales"
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      Food Sales
                    </NavLink>
                  </li>
                </>
              )}
              {user?.role === "supermarket" && (
                <li>
                  <NavLink
                    to="/my-pickups"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    My donations
                  </NavLink>
                </li>
              )}

              {/* Other common links after role-specific ones */}
              <li>
                <NavLink
                  to="/features"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Features
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  About
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Contact
                </NavLink>
              </li>

              {/* User section */}
              <div className="divider"></div>

              {user ? (
                <>
                  <div className="flex items-center p-2 bg-base-200 rounded-lg mb-3">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                        {user?.fullName?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <li>
                    <Link
                      to="/profile"
                      className="flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiUser className="mr-2" /> Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-error"
                    >
                      <FiLogOut className="mr-2" /> Logout
                    </button>
                  </li>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="btn btn-outline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/role"
                    className="btn btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-16"></div>
    </>
  );
}

export default HeaderMid;