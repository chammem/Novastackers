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
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error404 />, // Use dedicated error component
    children: [
      // Public routes
      { index: true, element: <Home /> },
      { path: "/login", element: <Connect /> },
      { path: "register/:role", element: <UserForm /> },
      { path: "roleVerification", element: <AdminVerificationComponent /> },
      { path: "activateAccount", element: <ActivateAccount /> },
      { path: "forgot-password", element: <ForgotPasswordFlow /> }, // Single consistent path
      { path: "role", element: <RoleChoice /> },
      { path: "verify", element: <VerifyAccount /> },

      // Protected user routes
      {
        element: <ProtectedRoute />,
        children: [
          { path: "account", element: <Account /> },
          { path: "profile", element: <Profile /> },
          { path: "admin", element: <AdminDashboard /> }
        ]
      },

      // Admin routes
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
    <ToastContainer/>
    <RouterProvider router={router} /> {/* Fix: router1 => router */}
  </StrictMode>
);
