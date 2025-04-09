import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createBrowserRouter,RouterProvider,BrowserRouter} from 'react-router-dom'
import App from './App.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx'
import ForgotPassword from './components/user/ForgotPassword.jsx'
import Error404 from './components/Error404.jsx'
import Account from './components/user/Account.jsx'
import Connect from './components/user/Connect.jsx'
import RoleChoice from './components/user/RoleChoice.jsx'
// import TabArea from "./components/user/TabArea.jsx";
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
import VolunteerAvailability from './components/VolunteerAvailability.jsx'
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error404 />, 
    children: [
      
      { index: true, element: <Home /> },
      { path: "/login", element: <Connect /> },
      { path: "register/:role", element: <UserForm /> },
      { path: "roleVerification", element: <AdminVerificationComponent /> },
      { path: "activateAccount", element: <ActivateAccount /> },
      { path: "forgot-password", element: <ForgotPasswordFlow /> }, 
      { path: "role", element: <RoleChoice /> },
      { path: "verify", element: <VerifyAccount /> },
      {path:"/donationForm",element:<CreateDonationForm/>},
      {path:"/donations",element:<DonationsList/>},
      {path:"/addfoodtodonation",element:<AddFoodToDonation/>},
      {path:"/donations/:id",element:<CharityEventDetails/>},
      {path:"/test",element:<TestCharityPage/>},
      {path:"/my-campaigns" ,element:<DonationListNgo/>},
      {path:"/my-campaigns/:id",element:<ViewCampaignProgress/>},
      {path:"/volunteer",element:<VolunteerDashboard/>},
      {path:"/notifications",element:<NotificationsPage/>},
      { path: "/ngo-profile", element: <NGOProfileUpdate /> },
      {path:"/my-donations",element:<MyFoodDonations/>},
      {path:"/test-map",element:<MapView/>},
      {path:"/adress",element:<AddressAutoComplete/>},
      {path:"/route/:foodId",element:<RouteDetailsPage/>},
      {path:"/requested-assignments",element:<RequestedAssignments/>},
      {path:"/volunteer-availability",element:<VolunteerAvailability/>},
      {
        element: <ProtectedRoute />,
        children: [
          { path: "account", element: <Account /> },
          { path: "profile", element: <Profile /> },
          { path: "admin", element: <AdminDashboard /> }
        ]
      },

      
      {
        element: <AdminProtectedRoute />,
        children: [
         // { path: "admin", element: <AdminDashboard /> }
        ]
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <NotificationProvider>
    <ToastContainer/>

    <RouterProvider router={router} /> {/* Fix: router1 => router */}
    </NotificationProvider>
    </AuthProvider>
  </StrictMode>
);
