import React from 'react'
import AdminUserTab from './AdminUserTab'
import AdminNavbar from './AdminNavbar'
import { useState,useEffect} from 'react';
import AdminFoodTab from './AdminFoodTab';
import axiosInstance from '../config/axiosInstance';
import AdminRoleVerificationTab from './VerificationImages';
import Dashboard from './Dashboard';
import AdminVerificationComponent from './user/adminVerificationComponent';

import { useLocation } from 'react-router-dom';
import AdminDonationsList from './AdminDonationsList';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  return (
    <div className="min-h-screen bg-base-100 dark:bg-neutral">
      <AdminNavbar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="pt-16">
        {activeTab === 'dashboard' && <Dashboard sidebarOpen={sidebarOpen} />}
        {activeTab === 'users' && <AdminUserTab sidebarOpen={sidebarOpen} />}
        {activeTab === "roles-verification" && (
          <AdminVerificationComponent
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        )}
        {activeTab === 'campaigns' && (
          <AdminDonationsList 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
        )}
        {activeTab === 'food' && <AdminFoodTab sidebarOpen={sidebarOpen} />}
      </div>
    </div>
  );
};

export default AdminDashboard;