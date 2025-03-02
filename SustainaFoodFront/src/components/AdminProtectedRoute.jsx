// src/components/AdminProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';

const AdminProtectedRoute = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axiosInstance.get('/check-auth');
        if (res.data.user.role !== 'admin') throw new Error('Unauthorized');
        setIsAdmin(true);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  return isAdmin ? <Outlet /> : null;
};

export default AdminProtectedRoute;