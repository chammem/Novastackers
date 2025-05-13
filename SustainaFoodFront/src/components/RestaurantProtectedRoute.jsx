import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RestaurantProtectedRoute = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is authenticated AND has the restaurant role
  if (!isAuthenticated || user?.role !== 'restaurant') {
    // Redirect to login if not authenticated or not a restaurant
    return <Navigate to="/Error404" replace />;
  }
  
  // Render child routes if user is authenticated and is a restaurant
  return <Outlet />;
};

export default RestaurantProtectedRoute;
