import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter,RouterProvider,BrowserRouter} from 'react-router-dom'
import App from './App.jsx'

import ForgotPassword from './components/user/ForgotPassword.jsx'
import Error404 from './components/Error404.jsx'
import Account from './components/user/Account.jsx'
import Connect from './components/user/Connect.jsx'
import RoleChoice from './components/user/RoleChoice.jsx'
import TabArea from "./components/user/TabArea.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import VerifyAccount from './components/user/forms/VerifyAccount.jsx'
import UserForm from './components/user/RegisterTest.jsx'
import Home from './components/Home.jsx'
import UserProfile from './components/user/UserProfile.jsx'
import AdminVerificationComponent from './components/user/adminVerificationComponent.jsx'
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
    path:'/userProfile',
    element:<UserProfile/>
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
,
  {
    path: "/TabArea",
    element: <TabArea />,
  },

])


createRoot(document.getElementById('root')).render(
  <StrictMode>
  
    <RouterProvider router={router} />
  *
</StrictMode>
  
 
);
