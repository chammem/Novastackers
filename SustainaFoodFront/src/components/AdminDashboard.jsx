import React from 'react'
import AdminUserTab from './AdminUserTab'
import AdminNavbar from './AdminNavbar'
import { useState,useEffect} from 'react';
import AdminFoodTab from './AdminFoodTab';
import axiosInstance from '../config/axiosInstance';
import AdminRoleVerificationTab from './VerificationImages';
import Dashboard from './Dashboard';

import { useLocation } from 'react-router-dom';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Détermine l'onglet actif basé sur l'URL
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar 
        activeTab={activeTab} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="pt-16">
        {activeTab === 'users' && <AdminUserTab sidebarOpen={sidebarOpen} />}
        {activeTab === 'dashboard' && <Dashboard sidebarOpen={sidebarOpen} />}
        {activeTab === 'food' && <AdminFoodTab sidebarOpen={sidebarOpen} />}
        {activeTab === "roles-verification" && <AdminVerificationComponent sidebarOpen={sidebarOpen} />}
      </div>
    </div>
  );
};

// Export par défaut ESSENTIEL
export default AdminDashboard;