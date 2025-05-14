import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import App from './App.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';
import ForgotPassword from './components/user/ForgotPassword.jsx';
import Error404 from './components/Error404.jsx';
import Account from './components/user/Account.jsx';
import Connect from './components/user/Connect.jsx';
import RoleChoice from './components/user/RoleChoice.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VerifyAccount from './components/user/forms/VerifyAccount.jsx'
import UserForm from './components/user/RegisterTest.jsx'
import Home from './components/Home.jsx'
import ForgotPasswordFlow from './components/user/forgotpassword/ForgotPasswordFlow.jsx'
import AdminVerificationComponent from './components/user/adminVerificationComponent.jsx'
import Profile from './components/user/Profile.jsx'
import ActivateAccount from './components/user/ActivateAccount.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import CreateDonationForm from './components/donations/CreateDonationForm.jsx'
import DonationsList from './components/donations/DonationsList.jsx'
import AddFoodToDonation from './components/donations/AddFoodToDonation.jsx'
import CharityEventDetails from './components/donations/CharityEventDetails.jsx'
import TestCharityPage from './components/donations/TestCharityPage.jsx'
import DonationListNgo from './components/donations/DonationsListNgo.jsx'
import ViewCampaignProgress from './components/donations/ViewCampaignProgress.jsx'
import CampaignAnalytics from './components/donations/CampaignAnalytics.jsx'
import VolunteerDashboard from './components/donations/VolunteerDashboard.jsx'
import NotificationsPage from './components/NotificationPage.jsx'
import { NotificationProvider } from './context/NotificationContext';
import NGOProfileUpdate from './components/NGOProfileUpdate.jsx'
import MyFoodDonations from './components/donations/MyFoodDonations.jsx'
import AddressAutoComplete from './components/AddressAutoComplete.jsx'
import MapView from './components/MapView.jsx'
import RouteDetailsPage from './components/donations/RouteDetailsPage.jsx'
import RequestedAssignments from './components/donations/RequestedAssignments.jsx'
import { AuthProvider } from "./context/AuthContext";
import AdminFoodTab from './components/AdminFoodTab.jsx'
import VerificationImages from './components/VerificationImages.jsx'
import Admin from './components/Admin.jsx'
import Dashboard from './components/Dashboard.jsx'
import AdminUsersTab from './components/AdminUserTab.jsx'
import AdminDonationsList from './components/AdminDonationsList.jsx'
import VolunteerAvailability from './components/VolunteerAvailability.jsx'
import BatchRouteDetails from './components/donations/BatchRouteDetails.jsx';
import FoodSalePage from './components/foodSales/FoodSalePage.jsx';
import AddFoodSalePage from './components/foodSales/AddFoodSalePage.jsx';
import RestaurantDetailsPage from './components/foodSales/RestaurantDetailsPage.jsx';
import OrderConfirmationPage from './components/foodSales/OrderConfirmationPage.jsx';
import OrderSuccessPage from './components/foodSales/OrderSuccessPage.jsx';
import OrderPaymentPage from './components/foodSales/OrderPaymentPage.jsx';
import AvailableFoodList from './components/AvailableFoodList.jsx';
import FoodRecommendations from './components/FoodRecommendations.jsx';
import SuggestedProducts from './components/SuggestedProducts';
import AvailableSuggestions from './components/AvailableSuggestions';
import SuggestedProductsList from './components/SuggestedProductsList';
import MyOrdersPage from './components/foodSales/MyOrdersPage.jsx'
import OrderDetailPage from './components/foodSales/OrderDetailPage.jsx';
import DriverDashboard from './components/driver/DriverDashboard.jsx';
import DeliveryNotification from './components/driver/DeliveryNotification.jsx';
import AllDeliveriesMap from './components/driver/AllDeliveriesMap.jsx';
import RequestedDeliveries from './components/driver/RequestedDeliveries.jsx';
import DeliveryRouteDetails from './components/driver/DeliveryRouteDetails.jsx';
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import Features from './components/Features.jsx'
import RestaurantProtectedRoute from './components/RestaurantProtectedRoute.jsx';
import CharityProtectedRoute from './components/CharityProtectedRoute.jsx';
import DriverProtectedRoute from './components/DriverProtectedRoute.jsx';
import VolunteerProtectedRoute from './components/VolunteerProtectedRoute.jsx';
import { initializeCopyFeature } from './utils/copyUtils';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error404 />,
    children: [
      // Routes publiques
      { index: true, element: <Home /> },
      { path: "/login", element: <Connect /> },
      { path: "register/:role", element: <UserForm /> },
      { path: "roleVerification", element: <AdminVerificationComponent /> },
      { path: "activateAccount", element: <ActivateAccount /> },
      { path: "forgot-password", element: <ForgotPasswordFlow /> }, 
      { path: "role", element: <RoleChoice /> },
      { path: "about", element: <About/> },
      { path: "contact", element: <Contact/> },
      { path: "features", element: <Features/> },
      { path: "verify", element: <VerifyAccount /> },
      {path:"/donationForm",element:<CreateDonationForm/>},
      {path:"/addfoodtodonation",element:<AddFoodToDonation/>},
      {path:"/donations/:id",element:<CharityEventDetails/>},
      {path:"/test",element:<TestCharityPage/>},
      {path:"/notifications",element:<NotificationsPage/>},
      { path: "/ngo-profile", element: <NGOProfileUpdate /> },
      {path:"/test-map/:batchId",element:<MapView/>},
      {path:"/adress",element:<AddressAutoComplete/>},
      {path:"/route/:foodId",element:<RouteDetailsPage/>},
      {path:"/batch/:batchId/route", element: <BatchRouteDetails />},
      {path:"/add-food-sale", element: <AddFoodSalePage />},
      {path:"/restaurant/:restaurantId", element:<RestaurantDetailsPage />},
      {path:"/order-confirmation/:foodId", element:<OrderConfirmationPage />},
      {path:"/order-success/:orderId", element:<OrderSuccessPage />},
      {path:"/order-payment", element:<OrderPaymentPage />},
      {path:"/orders",element:<MyOrdersPage />},
      {path:"/orders/:orderId",element:<OrderDetailPage/>},
      {path: "donations", element: <DonationsList />}, // Keep this for restaurant users

      //volunteer protected routes
      {
        element: <VolunteerProtectedRoute />,
        children: [
          { path: "available-food", element: <AvailableFoodList /> },
          { path: "volunteer-availability", element: <VolunteerAvailability /> },
          { path: "requested-assignments", element: <RequestedAssignments /> },
          { path: "volunteer", element: <VolunteerDashboard /> },
        ]
      },

      {
        element: <ProtectedRoute />,
        children: [
          { path: "account", element: <Account /> },
          { path: "profile", element: <Profile /> }
        ]
      },

      //driver protected routes
      {
        element: <DriverProtectedRoute />,
        children: [
          {path: "driver-dashboard", element: <DriverDashboard />},
          {path: "driver-notification", element: <DeliveryNotification />},
          {path: "delivery-route/:orderId", element: <DeliveryRouteDetails />},
          {path: "requested-deliveries", element: <RequestedDeliveries />},
          {path: "deliveries-map", element: <AllDeliveriesMap />}
        ]
      },
      // Charity protected routes
      {
        element: <CharityProtectedRoute />,
        children: [
          {path: "my-campaigns", element: <DonationListNgo />},
          {path: "my-campaigns-analytics", element: <CampaignAnalytics />},
          {path: "my-campaigns/:id", element: <ViewCampaignProgress />}
        ]
      },
   
      // Restaurant protected routes
      {
        element: <RestaurantProtectedRoute />,
        children: [
          {path: "my-donations", element: <MyFoodDonations />},
          {path: "food-sales", element: <FoodSalePage />},
          {path: 'suggested-products-list', element: <SuggestedProductsList /> }
        ]
      },

      // Routes admin
      {
        path: "admin",
        element: <AdminProtectedRoute />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "users", element: <AdminUsersTab /> },
          { path: "Food", element: <AdminFoodTab /> },
          { path: "roles-verification", element: <AdminVerificationComponent /> },
          { path: "campaigns", element: <AdminDonationsList /> },
          { path: "adminOpen", element: <Admin /> }
        ]
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <ToastContainer />
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
);
