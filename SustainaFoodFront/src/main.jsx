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
import VerifyAccount from './components/user/forms/VerifyAccount.jsx';
import UserForm from './components/user/RegisterTest.jsx';
import Home from './components/Home.jsx';
import ForgotPasswordFlow from './components/user/forgotpassword/ForgotPasswordFlow.jsx';
import AdminVerificationComponent from './components/user/adminVerificationComponent.jsx';
import Profile from './components/user/Profile.jsx';
import ActivateAccount from './components/user/ActivateAccount.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import CreateDonationForm from './components/donations/CreateDonationForm.jsx';
import DonationsList from './components/donations/DonationsList.jsx';
import AddFoodToDonation from './components/donations/AddFoodToDonation.jsx';
import CharityEventDetails from './components/donations/CharityEventDetails.jsx';
import TestCharityPage from './components/donations/TestCharityPage.jsx';
import DonationListNgo from './components/donations/DonationsListNgo.jsx';
import ViewCampaignProgress from './components/donations/ViewCampaignProgress.jsx';
import VolunteerDashboard from './components/donations/VolunteerDashboard.jsx';
import NotificationsPage from './components/NotificationPage.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import NGOProfileUpdate from './components/NGOProfileUpdate.jsx';
import MyFoodDonations from './components/donations/MyFoodDonations.jsx';
import AddressAutoComplete from './components/AddressAutoComplete.jsx';
import MapView from './components/MapView.jsx';
import RouteDetailsPage from './components/donations/RouteDetailsPage.jsx';
import RequestedAssignments from './components/donations/RequestedAssignments.jsx';
import AdminFoodTab from './components/AdminFoodTab.jsx';
import VerificationImages from './components/VerificationImages.jsx';
import Admin from './components/Admin.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdminUsersTab from './components/AdminUserTab.jsx';
import AdminDonationsList from './components/AdminDonationsList.jsx';
import VolunteerAvailability from './components/VolunteerAvailability.jsx';
import BatchRouteDetails from './components/donations/BatchRouteDetails.jsx';
import FoodSalePage from './components/foodSales/FoodSalePage.jsx';
import AddFoodSalePage from './components/foodSales/AddFoodSalePage.jsx';
import RestaurantDetailsPage from './components/foodSales/RestaurantDetailsPage.jsx';
import OrderConfirmationPage from './components/foodSales/OrderConfirmationPage.jsx';
import OrderSuccessPage from './components/foodSales/OrderSuccessPage.jsx';
import OrderPaymentPage from './components/foodSales/OrderPaymentPage.jsx';
import AvailableFoodList from './components/AvailableFoodList.jsx';
import FoodRecommendations from './components/FoodRecommendations.jsx';
import MysteryPackList from "./components/MysteryPacks/MysteryPackList.jsx";
import MysteryPackCard from "./components/MysteryPacks/MysteryPackCard.jsx";
import { initializeCopyFeature } from './utils/modernCopy';

// Initialize modern copy functionality
initializeCopyFeature();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error404 />,
    children: [
      // Routes publiques
      { index: true, element: <Home /> },
      { path: "login", element: <Connect /> },
      { path: "register/:role", element: <UserForm /> },
      { path: "activateAccount", element: <ActivateAccount /> },
      { path: "forgot-password", element: <ForgotPasswordFlow /> },
      { path: "role", element: <RoleChoice /> },
      { path: "verify", element: <VerifyAccount /> },
      { path: "available-food", element: <AvailableFoodList /> },
      { path: "mysterypack", element: <MysteryPackList /> },
      { path: "mysterypackcard", element: <MysteryPackCard /> },
      { path: "recommendations", element: <ProtectedRoute><FoodRecommendations /></ProtectedRoute> },

      // Routes protégées normales
      { path: "donationForm", element: <CreateDonationForm /> },
      { path: "donations", element: <DonationsList /> },
      { path: "addfoodtodonation", element: <AddFoodToDonation /> },
      { path: "donations/:id", element: <CharityEventDetails /> },
      { path: "test", element: <TestCharityPage /> },
      { path: "my-campaigns", element: <DonationListNgo /> },
      { path: "my-campaigns/:id", element: <ViewCampaignProgress /> },
      { path: "volunteer", element: <VolunteerDashboard /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "ngo-profile", element: <NGOProfileUpdate /> },
      { path: "my-donations", element: <MyFoodDonations /> },
      { path: "test-map/:batchId", element: <MapView /> },
      { path: "adress", element: <AddressAutoComplete /> },
      { path: "route/:foodId", element: <RouteDetailsPage /> },
      { path: "requested-assignments", element: <RequestedAssignments /> },
      { path: "volunteer-availability", element: <VolunteerAvailability /> },
      { path: "batch/:batchId/route", element: <BatchRouteDetails /> },
      { path: "food-sales", element: <FoodSalePage /> },
      { path: "add-food-sale", element: <AddFoodSalePage /> },
      { path: "restaurant/:restaurantId", element: <RestaurantDetailsPage /> },
      { path: "order-confirmation/:foodId", element: <OrderConfirmationPage /> },
      { path: "order-success/:orderId", element: <OrderSuccessPage /> },
      { path: "order-payment", element: <OrderPaymentPage /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: "account", element: <Account /> },
          { path: "profile", element: <Profile /> }
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
