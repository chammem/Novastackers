import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { 
    FiHome, 
    FiUsers, 
    FiShield, 
    FiPackage, 
    FiTruck, 
    FiPieChart, 
    FiSettings,
    FiChevronLeft, 
    FiChevronRight,
    FiBell, 
    FiLogOut 
  } from 'react-icons/fi';

// Composants
import AdminUsersTab from './AdminUserTab';
import Profile from './user/Profile';
import AdminFoodTab from './AdminFoodTab';
import VolunteerDashboard from './donations/VolunteerDashboard';
import DonationsList from './donations/DonationsList';
import DonationListNgo from './donations/DonationsListNgo';
import AdminNavbar from './AdminNavbar';



const Admin = () => {
    return <DashboardLayout />;
  };
  
  const DashboardLayout = () => {

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      const fetchUser = async () => {
        const mockUser = {
          _id: "1",
          fullName: "Admin User",
          email: "admin@foodshare.com",
          role: "admin",
          avatar: "https://via.placeholder.com/150"
        };
        setUser(mockUser);
      };
  
      const fetchNotifications = async () => {
        const mockNotifications = [
          { id: 1, message: "New donation campaign created", read: false },
          { id: 2, message: "3 new volunteers registered", read: true }
        ];
        setNotifications(mockNotifications);
      };
  
      fetchUser();
      fetchNotifications();
    }, []);
  
    const handleLogout = () => {
      console.log("User logged out");
    };
  
    if (!user) {
      return (
        <div className="flex items-center justify-center h-screen bg-base-100 dark:bg-neutral">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      );
    }
  
    return (
      <div className="flex h-screen bg-base-100 dark:bg-neutral transition-colors duration-500">
        {user.role === "admin" && (
          <AdminNavbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            user={user}
            notifications={notifications}
            onLogout={handleLogout}
          />
        )}
  
        <main
          className={`flex-1 overflow-y-auto p-0 md:p-6 transition-all duration-300 ${
            sidebarOpen ? "md:ml-80" : "md:ml-20"
          }`}
        >
          {/* En-tête créatif */}
          <div className="w-full px-4 md:px-0 pt-6 pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-green-700 tracking-tight mb-1">
                Admin Panel
              </h1>
              <p className="text-gray-500 text-base">
                Manage users, campaigns, food, and more with a modern interface.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Notifications icon with badge */}
              <div className="relative">
                <button
                  className="p-2 rounded-full bg-green-50 hover:bg-green-100 transition"
                  title="Notifications"
                >
                  <FiBell className="w-6 h-6 text-green-700" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
              </div>
              {/* User avatar or fallback */}
              <div className="flex items-center gap-2">
                <div className="bg-green-100 text-green-700 rounded-full px-4 py-2 font-semibold shadow">
                  {user.fullName}
                </div>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full border-2 border-green-500 shadow object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-green-500 shadow flex items-center justify-center bg-green-200 text-green-800 font-bold text-xl">
                    {user.fullName?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition"
                  title="Logout"
                >
                  <FiLogOut className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
          <div className="w-full h-1 bg-gradient-to-r from-green-400 via-green-200 to-green-400 rounded-full mb-6 opacity-60"></div>
          {/* Fin header créatif */}

          <div className="px-2 md:px-0">
            <Routes>
              <Route path="/campaigns" element={<DonationsList />} />
              <Route path="/campaigns/:campaignId" element={<DonationListNgo />} />
              {user.role === "admin" && (
                <Route path="/admin/users" element={<AdminUsersTab sidebarOpen={sidebarOpen} />} />
              )}
              <Route path="/users/:id" element={<Profile />} />
              <Route
                path="/volunteers/:volunteerId/assignments"
                element={<VolunteerDashboard />}
              />
              <Route path="/food-items" element={<AdminFoodTab />} />
            </Routes>
          </div>
        </main>
      </div>
    );
  };
  
  export default Admin;