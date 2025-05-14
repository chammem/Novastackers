import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axiosInstance from "../config/axiosInstance";
import { 
  FiChevronLeft, FiChevronRight, FiUser, FiLogOut, FiX, FiMenu, 
  FiHome, FiUsers, FiShield, FiPackage, FiTruck, FiPieChart, FiSettings,
  FiBell, FiTrash2, FiEdit
} from "react-icons/fi";

const AdminNavbar = ({
  sidebarOpen,
  setSidebarOpen,
  user,
  notifications = [],
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPath = location.pathname;
  

  const { user: authUser, logout, checkAuthStatus } = useAuth();

  // Utilisez authUser en priorité, puis fallback sur user des props
  const currentUser = authUser || user;

  // Notifications non lues
  const [unreadCount, setUnreadCount] = useState(0);
  // S'assurer que notifications est toujours un tableau
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  
  // Mise à jour du décompte des notifications non lues avec vérification supplémentaire
  useEffect(() => {
    try {
      setUnreadCount(safeNotifications.filter(n => n && n.read === false).length);
    } catch (error) {
      setUnreadCount(0);
    }
  }, [safeNotifications]);

  // Suppression notification(s)
  const deleteOne = async (id) => {
    try {
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };
  const clearAll = async () => {
    try {
      toast.success("All notifications cleared");
    } catch (err) {
      toast.error("Failed to clear notifications");
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/userLogout");
      if (typeof onLogout === 'function') onLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  // Version optimisée des helpers pour avatar et prénom
  const getAvatarLetter = () => {
    try {
      return currentUser?.fullName?.trim()[0]?.toUpperCase() || "A";
    } catch (error) {
      return "A";
    }
  };
  
  const getFirstName = () => {
    try {
      return currentUser?.fullName?.trim().split(" ")[0] || "Admin";
    } catch (error) {
      return "Admin";
    }
  };

  // Assurons-nous que le contenu s'affiche même si user est null
  const renderUserContent = () => {
    // Toujours afficher le contenu, même si user est null
    return (
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
              {unreadCount > 0 && (
                <span className="badge badge-xs badge-primary indicator-item">
                  {unreadCount}
                </span>
              )}
            </div>
          </motion.div>
          <div
            tabIndex={0}
            className="dropdown-content card card-compact w-64 p-2 shadow bg-base-100"
          >
            {/* ...existing notification content... */}
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
                  {getAvatarLetter()}
                </div>
              </div>
            </div>
            <span className="hidden sm:inline">
              {getFirstName()}
            </span>
          </motion.div>
          <ul
            tabIndex={0}
            className="dropdown-content menu menu-sm p-2 shadow bg-base-100 rounded-box w-52 mt-2"
          >
            {/* Email */}
            <li className="menu-title">
              <span className="text-xs text-gray-500 truncate">
                {currentUser?.email || "admin@sustainafood.com"}
              </span>
            </li>
            
            {/* Profile */}
            <li>
              <Link to="/profile" className="flex items-center">
                <FiUser className="w-4 h-4" />
                Profile
              </Link>
            </li>
            
            {/* Logout */}
            <li>
              <button
                onClick={() => {
                  if (logout) logout();
                  else handleLogout();
                }}
                className="text-error flex items-center"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-base-200 dark:bg-neutral text-base-content dark:text-neutral-content z-50 transition-all duration-300 ease-in-out overflow-hidden shadow-xl ${
        sidebarOpen ? "w-64" : "w-16"
      }`}>
        <div className={`p-4 ${sidebarOpen ? "min-w-[220px]" : "min-w-[64px]"}`}>
          <div className="flex items-center justify-between h-12">
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <NavLink to="/" className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg overflow-hidden"
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
              ) : (
                <NavLink to="/">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                  >
                    <img 
                      src="/images/logo.png" 
                      alt="SustainaFood Logo" 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </NavLink>
              )}
            </AnimatePresence>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
                sidebarOpen 
                  ? "p-1.5 hover:bg-base-100" 
                  : "w-8 h-8 bg-primary text-white hover:bg-primary-focus"
              }`}
            >
              {sidebarOpen ? (
                <FiChevronLeft className={`w-5 h-5 ${sidebarOpen ? "text-primary" : "text-white"}`} />
              ) : (
                <FiChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <nav className="mt-6 space-y-1 flex flex-col">
            <NavItem icon={<FiHome />} text="Dashboard" to="/admin/dashboard" sidebarOpen={sidebarOpen} currentPath={currentPath} />
            <NavItem icon={<FiUsers />} text="Users" to="/admin/users" sidebarOpen={sidebarOpen} currentPath={currentPath} />
            <NavItem icon={<FiShield />} text="Roles" to="/admin/roles-verification" sidebarOpen={sidebarOpen} currentPath={currentPath} />
            <NavItem icon={<FiPackage />} text="Campaigns" to="/admin/campaigns" sidebarOpen={sidebarOpen} currentPath={currentPath} />
            <NavItem icon={<FiTruck />} text="Food" to="/admin/food" sidebarOpen={sidebarOpen} currentPath={currentPath} />
            <NavItem icon={<FiPieChart />} text="Reports" to="/reports" sidebarOpen={sidebarOpen} currentPath={currentPath} />
            <NavItem icon={<FiSettings />} text="Settings" to="/settings" sidebarOpen={sidebarOpen} currentPath={currentPath} />
          </nav>
        </div>
      </div>
      
      {/* Top Navigation */}
      <motion.header
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 right-0 z-40 transition-all duration-300 bg-base-200 bg-opacity-80 dark:bg-neutral dark:bg-opacity-80 ${sidebarOpen ? "left-64" : "left-16"} shadow-md rounded-none`}
      >
        <div className="flex justify-between items-center px-4 py-3">
          {/* Partie gauche de la navbar - peut contenir un titre ou d'autres éléments */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base-content"></span>
          </div>

          {/* Partie droite de la navbar - notifications et avatar */}
          <div className="flex items-center gap-2">
            {renderUserContent()}
            
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
            className="h-full bg-base-100 white:bg-neutral w-3/4 max-w-xs shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-base-200 dark:border-neutral-focus">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-base-100 dark:text-neutral flex items-center justify-center">
                  {getAvatarLetter()}
                </div>
                <span className="font-semibold">{getFirstName()}</span>
              </div>
            </div>
            <nav className="mt-4">
              <MobileNavItem icon={<FiHome />} text="Dashboard" to="/admin/dashboard" />
              <MobileNavItem icon={<FiUsers />} text="Users" to="/admin/users" />
              <MobileNavItem icon={<FiShield />} text="Verifications" to="/admin/roles-verification" />
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
        `flex items-center p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
          isActive 
            ? "bg-primary bg-opacity-20 text-white font-medium" 
            : "text-base-content dark:text-neutral-content hover:bg-base-300 dark:hover:bg-neutral-focus"
        } ${!sidebarOpen ? "justify-center" : "px-4"}`
      }
    >
      {/* Affiche l'icône avec une couleur conditionnelle */}
      <span className={`text-xl flex items-center ${({ isActive }) => isActive ? "text-white" : ""}`}>
        {icon}
      </span>
      {sidebarOpen && (
        <span className="ml-3 whitespace-nowrap overflow-hidden">
          {text}
        </span>
      )}
    </NavLink>
  );
};

const MobileNavItem = ({ icon, text, to }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-4 text-base ${
          isActive ? "bg-primary bg-opacity-10 text-primary" : "hover:bg-base-200 dark:hover:bg-neutral-focus"
        }`
      }
    >
      <span className={`text-xl mr-3 ${isActive ? "text-primary" : ""}`}>{icon}</span>
      {text}
    </NavLink>
  );
};

export default AdminNavbar;
