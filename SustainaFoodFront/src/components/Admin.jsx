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
    FiChevronRight 
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
      return <div>Loading...</div>;
    }
  
    return (
      <div className="flex h-screen bg-gray-100">
        {user.role === "admin" && (
          <AdminNavbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen} // Doit être passé explicitement
          user={user}
          notifications={notifications}
          onLogout={handleLogout}
        />
        )}
  
        <main
          className={`flex-1 overflow-y-auto p-6 bg-gray-50 transition-all duration-300 ${
            sidebarOpen ? "md:ml-80" : "md:ml-20"
          }`}
        >
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
        </main>
      </div>
    );
  };
  
  export default Admin;