import React from 'react'
import AdminUserTab from './AdminUserTab'
import AdminNavbar from './AdminNavbar'
import { useState,useEffect} from 'react';
import AdminFoodTab from './AdminFoodTab';
import axiosInstance from '../config/axiosInstance';
import AdminRoleVerificationTab from './VerificationImages';
function AdminDashboard() {



    const [activeTab, setActiveTab] = useState('users'); 
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'users' && <AdminUserTab />}
       {activeTab === 'food' && <AdminFoodTab />} 
       {activeTab === "verifications" && <AdminRoleVerificationTab />}
    </div>
  )
}

export default AdminDashboard