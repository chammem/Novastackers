import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeaderMid from './HeaderMid';

// Access denied component for authenticated non-volunteer users
const AccessDenied = () => {
  return (
    <>
      <HeaderMid />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg text-center">
          <div className="text-red-500 text-5xl mb-4">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Sorry, you don't have permission to access this page. This area is restricted to volunteer accounts only.
          </p>
          <a href="/" className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors">
            Return to Homepage
          </a>
        </div>
      </div>
    </>
  );
};

const VolunteerProtectedRoute = () => {
  const { user, isAuthenticated } = useAuth();
  
  // If not authenticated at all, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/Error404" replace />;
  }
  
  // If authenticated but not a volunteer, show access denied
  if (user?.role !== 'volunteer') {
    return <AccessDenied />;
  }
  
  // Render child routes if user is authenticated and is a volunteer
  return <Outlet />;
};

export default VolunteerProtectedRoute;
