import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosInstance';

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosInstance.get('/check-auth');
        setAuth(true);
      } catch {
        setAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  // Rediriger vers /login sauf si déjà dessus
  if (!auth && location.pathname !== '/login') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
