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
        const response = await axiosInstance.get('http://localhost:8082/api/auth/check-auth', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.isAuthenticated) {
          setLoading(false);
        } else {
          navigate('/login', { 
            state: { from: location.pathname },
            replace: true
          });
        }
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
export default ProtectedRoute;