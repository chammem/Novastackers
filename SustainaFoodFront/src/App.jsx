import { useState, useEffect } from "react";
import { RecoveryContext } from "./context/RecoveryContext"; // Import du contexte
import HeaderTop from "./components/HeaderTop";
import HeaderMid from "./components/HeaderMid";
import Footer from "./components/Footer";
import ForgotPassword from "./components/user/ForgotPassword";
import ResetPassword from "./components/user/ResetPassword";
import UserForm from "./components/user/forms/UserForm"; // Ajuste le chemin si besoin

function App() {
  const [page, setPage] = useState("forgot-password"); // Page par défaut
  const [email, setEmail] = useState(""); // État pour stocker l'email de l'utilisateur
  const [OTP, setOTP] = useState(""); // État pour stocker l'OTP

  useEffect(() => {
    console.log(`Page actuelle : ${page}`);
  }, [page]);

  const components = {
    "forgot-password": <ForgotPassword />,
    "reset-password": <ResetPassword />,
    "user-form": <UserForm />,
  };

  return (
    <RecoveryContext.Provider value={{ page, setPage, email, setEmail, OTP, setOTP }}>
      <HeaderTop />
      <HeaderMid />

      <div className="flex justify-center items-center min-h-screen">
        {components[page] || <ForgotPassword />}
      </div>

      <Footer />
    </RecoveryContext.Provider>
  );
}

export default App;
