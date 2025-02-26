import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createBrowserRouter,RouterProvider,BrowserRouter} from 'react-router-dom'
import App from './App.jsx'

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

import AdminVerificationComponent from './components/user/adminVerificationComponent.jsx'
import Profile from './components/user/Profile.jsx'
import ActivateAccount from './components/user/ActivateAccount.jsx'
const router = createBrowserRouter([
{
   path:"/",
   element:<App />,
   errorElement:<Home/>
},  
{
  path:'/register/:role',
  element:<UserForm/>,
  
},
{
  path:'/roleVerification',
  element:<AdminVerificationComponent/>
},
  {
    path:'/activateAccount',
    element:<ActivateAccount/>
  },
{
  path:'/forget-password',
  element:<ForgotPassword/>
},
{
  path:'/account',
  element:<Account/>
},
{
  path:'/login',
  element:<Connect/>
},
{
  path:'/role',
  element:<RoleChoice/>
},  {
  path: "/verify", 
  element: <VerifyAccount />,
},
{ path:"/profile",
  element:<Profile/>
}
,


])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastContainer/>
    <RouterProvider router={router} />
  
</StrictMode>
  
 
);
