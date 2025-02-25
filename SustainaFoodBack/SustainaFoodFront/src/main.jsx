import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter,RouterProvider,BrowserRouter} from 'react-router-dom'
import App from './App.jsx'
import Register from './components/user/Register.jsx'
import ForgotPassword from './components/user/ForgotPassword.jsx'
import Error404 from './components/Error404.jsx'
import Account from './components/user/Account.jsx'
import Connect from './components/user/Connect.jsx'
import RoleChoice from './components/user/RoleChoice.jsx'
import RestaurantForm from './components/user/forms/RestaurantForm.jsx'
import UserForm from './components/user/forms/UserForm.jsx'
import SuperMarketForm from './components/user/forms/SuperMarketForm.jsx'
import DriverForm from './components/user/forms/DriverForm.jsx'


const router = createBrowserRouter([
{
   path:"/",
   element:<App />,
   errorElement:<Error404/>
},  
{
  path:'/register',
  element:<Register/>,
  children:[
    {path:"restaurant",element:<RestaurantForm/>},
    {path:"regularUser",element:<UserForm/>},
    {path:"supermarket",element:<SuperMarketForm/>},
    {path:"driver",element:<DriverForm/>}
  ]
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
}


])


createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
  
 
);
