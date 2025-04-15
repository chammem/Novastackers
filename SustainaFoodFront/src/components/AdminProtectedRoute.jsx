// src/components/AdminProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Outlet,  useLocation} from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import { LoadingSpinner } from './LoadingSpinner';

const AdminProtectedRoute = () => {
  const [authStatus, setAuthStatus] = useState({
    isAdmin: false,
    loading: true,
    error: null
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const controller = new AbortController();

    const verifyAdmin = async () => {
      try {
        const res = await axiosInstance.get('/check-auth', {
          signal: controller.signal
        });
        
        // Correction: vérification du rôle 'admin'
        if (res.data?.user?.role !== 'admin') {
          throw new Error('Privilèges admin requis');
        }

        setAuthStatus({
          isAdmin: true,
          loading: false,
          error: null
        });

      } catch (err) {
        if (err.name !== 'CanceledError') {
          setAuthStatus({
            isAdmin: false,
            loading: false,
            error: err.message
          });

          navigate('/login', {
            state: {
              from: location.pathname,
              requiresAdmin: true,
              message: 'Authentification admin requise'
            },
            replace: true
          });
        }
      }
    };

    verifyAdmin();
    return () => controller.abort();
  }, [navigate, location]);

  if (authStatus.loading) return <LoadingSpinner fullPage />;
  
  if (authStatus.error) {
    return (
      <div className="p-4 text-red-500">
        {authStatus.error}
      </div>
    );
  }

  return authStatus.isAdmin ? <Outlet /> : null;
};

export default AdminProtectedRoute;