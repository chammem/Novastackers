// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get('/check-auth');
        setLoading(false);
      } catch (err) {
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true
        });
      }
    };
    checkAuth();
  }, [navigate, location]);

  if (loading) return <div>Loading...</div>;
  return <Outlet />;
};
export default ProtectedRoute