import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiSettings, FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axiosInstance from "../config/axiosInstance";

const AdminNavbar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/userLogout");
      logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 shadow-md backdrop-blur-sm" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
              A
            </div>
            <span className="text-xl font-semibold text-primary hidden sm:block">
              Admin Panel
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            {[ 
              { to: "/admin/dashboard", label: "Dashboard" },
              { to: "/admin/users", label: "Users" },
              { to: "/admin/Food", label: "Food" },
              { to: "/admin/roles-verification", label: "Role Verification" }
            ].map((item) => (
              <NavLink
              
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `btn btn-sm ${
                    isActive ? "btn-primary text-white" : "btn-ghost text-gray-700"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

           
          </nav>

          {/* User Avatar & Logout */}
          <div className="hidden md:flex items-center gap-2">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-sm btn-primary normal-case gap-2">
                <div className="avatar">
                  <div className="w-6 rounded-full bg-white text-primary flex items-center justify-center font-bold">
                    {user?.fullName?.charAt(0).toUpperCase() || "A"}
                  </div>
                </div>
                <span className="hidden sm:inline">{user?.fullName?.split(" ")[0]}</span>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-2"
              >
                <li>
                  <Link to="/admin/profile">
                    <FiUser className="w-4 h-4" />
                    Profile
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="text-error flex items-center">
                    <FiLogOut className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden btn btn-sm btn-ghost btn-circle"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 right-0 bg-white z-40 shadow-md md:hidden overflow-hidden"
          >
            <ul className="menu menu-sm p-4">
              <li>
                <NavLink to="/admin" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/users" onClick={() => setMobileOpen(false)}>
                  Users
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/roles" onClick={() => setMobileOpen(false)}>
                  Roles
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/settings" onClick={() => setMobileOpen(false)}>
                  Settings
                </NavLink>
              </li>
              <li className="divider" />
              <li>
                <button onClick={handleLogout} className="text-error">
                  Logout
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminNavbar;
