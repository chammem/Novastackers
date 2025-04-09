import React from 'react'
import AdminUserTab from './AdminUserTab'
import AdminNavbar from './AdminNavbar'
import { useState,useEffect} from 'react';
import AdminFoodTab from './AdminFoodTab';
import axiosInstance from '../config/axiosInstance';
import AdminRoleVerificationTab from './VerificationImages';

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* Passer sidebarOpen à tous les composants enfants */}
      {activeTab === 'users' && <AdminUserTab sidebarOpen={sidebarOpen} />}
      {activeTab === 'food' && <AdminFoodTab sidebarOpen={sidebarOpen} />}
      {activeTab === "verifications" && <AdminRoleVerificationTab sidebarOpen={sidebarOpen} />}
    </div>
  );
}

export default AdminDashboard;