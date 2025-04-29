import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axiosInstance from "../config/axiosInstance";
import {
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiLogOut,
  FiX,
  FiMenu,
  FiHome,
  FiUsers,
  FiShield,
  FiPackage,
  FiTruck,
  FiPieChart,
  FiSettings,
} from "react-icons/fi";

const AdminNavbar = ({ sidebarOpen, setSidebarOpen, user, onLogout }) => {
  const navigate = useNavigate();
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
      onLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-blue-900 text-white z-50 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-80" : "w-20"
        }`}
      >
        <div className={`p-4 ${sidebarOpen ? "min-w-[320px]" : "min-w-[80px]"}`}>
          <div className="flex items-center justify-between h-12">
            <h1 className="text-2xl font-bold whitespace-nowrap">
              {sidebarOpen ? "SustainaFood Admin" : "SF"}
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-full hover:bg-blue-700 transition-colors"
            >
              {sidebarOpen ? (
                <FiChevronLeft className="w-5 h-5" />
              ) : (
                <FiChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

          <nav className="mt-6 space-y-1">
            <NavItem icon={<FiHome />} text="Dashboard" to="/admin/dashboard" sidebarOpen={sidebarOpen} />
            <NavItem icon={<FiUsers />} text="Users" to="/admin/users" sidebarOpen={sidebarOpen} />
            <NavItem icon={<FiShield />} text="Roles" to="/admin/roles-verification" sidebarOpen={sidebarOpen} />
            <NavItem icon={<FiPackage />} text="Campaigns" to="/admin/campaigns" sidebarOpen={sidebarOpen} />
            <NavItem icon={<FiTruck />} text="Food" to="/admin/food" sidebarOpen={sidebarOpen} />
            <NavItem icon={<FiPackage />} text="Mystery Packs" to="/admin/mysterypack" sidebarOpen={sidebarOpen} />
            <NavItem icon={<FiPieChart />} text="Reports" to="/reports" sidebarOpen={sidebarOpen} />
            <NavItem icon={<FiSettings />} text="Settings" to="/settings" sidebarOpen={sidebarOpen} />
          </nav>
        </div>
      </div>

      {/* Top Navigation */}
      <motion.header
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 shadow-md backdrop-blur-sm" : "bg-white"
        } ${sidebarOpen ? "left-80" : "left-20"}`}
      >
        <div className="flex justify-between items-center px-4 py-3">
          <div></div>

          <div className="flex items-center gap-2">
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
                  <Link to="/profile">
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
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn btn-sm btn-ghost btn-circle"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className="h-full bg-white w-3/4 max-w-xs shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {user?.fullName?.charAt(0)}
                </div>
                <span className="font-semibold">{user?.fullName}</span>
              </div>
            </div>

            <nav className="mt-4">
              <MobileNavItem icon={<FiHome />} text="Dashboard" to="/admin/dashboard" />
              <MobileNavItem icon={<FiUsers />} text="Users" to="/admin/users" />
              <MobileNavItem icon={<FiShield />} text="Roles" to="/admin/roles-verification" />
              <MobileNavItem icon={<FiPackage />} text="Campaigns" to="/admin/campaigns" />
              <MobileNavItem icon={<FiTruck />} text="Food" to="/admin/food" />
              <MobileNavItem icon={<FiPackage />} text="Mystery Packs" to="/admin/mysterypack" />
              <MobileNavItem icon={<FiPieChart />} text="Reports" to="/reports" />
              <MobileNavItem icon={<FiSettings />} text="Settings" to="/settings" />
              <div className="divider my-2" />
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center p-4 text-error hover:bg-red-50 w-full"
                >
                  <FiLogOut className="mr-3" /> Logout
                </button>
              </li>
            </nav>
          </motion.div>
        </div>
      )}
    </>
  );
};

const NavItem = ({ icon, text, to, sidebarOpen }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-md transition-all duration-200 ${
          isActive ? "bg-blue-700 font-medium" : "hover:bg-blue-700/50"
        } ${!sidebarOpen ? "justify-center" : "px-4"}`
      }
    >
      <span className="text-xl">{icon}</span>
      {sidebarOpen && <span className="ml-3 whitespace-nowrap overflow-hidden">{text}</span>}
    </NavLink>
  );
};

const MobileNavItem = ({ icon, text, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-4 text-base ${
          isActive ? "bg-blue-50 text-primary" : "hover:bg-gray-100"
        }`
      }
    >
      <span className="text-xl mr-3">{icon}</span>
      {text}
    </NavLink>
  );
};

export default AdminNavbar;
