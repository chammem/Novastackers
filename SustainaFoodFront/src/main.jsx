import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import UserForm from './components/user/forms/UserForm.jsx';
import ForgotPassword from "./components/user/ForgotPassword.jsx";
import Error404 from "./components/Error404.jsx";
import Account from "./components/user/Account.jsx";
import Connect from "./components/user/Connect.jsx";
import RoleChoice from "./components/user/RoleChoice.jsx";



// 📌 Définition des routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error404 />,
  },
  {
    path: "/register/:role",
    element: <UserForm />,
  },
  {
    path: "/forget-password",
    element: <ForgotPassword />,
  },
  {
    path: "/account",
    element: <Account />,
  },
  {
    path: "/login",
    element: <Connect />,
  },
  {
    path: "/role",
    element: <RoleChoice />,
  },
  // {
  //   path: "/verify",
  //   element: <VerifyAccount />,
  // },
]);

// 📌 Rendu de l'application
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
