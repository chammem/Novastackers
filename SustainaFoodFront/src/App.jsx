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
  const [email, setEmail] = useState(""); // Stocker l'email de l'utilisateur
  const [OTP, setOTP] = useState(""); // Stocker l'OTP envoyé

  useEffect(() => {
    console.log(`Page actuelle : ${page}`);
  }, [page]);

  const components = {
    "forgot-password": <ForgotPassword setPage={setPage} setEmail={setEmail} setOTP={setOTP} />,
    "reset-password": <ResetPassword setPage={setPage} email={email} OTP={OTP} />,
    "user-form": <UserForm />,
  };

  return (
    <RecoveryContext.Provider value={{ page, setPage, email, setEmail, OTP, setOTP }}>
      <HeaderTop />
      <HeaderMid />

      <div className="flex justify-center items-center min-h-screen">
        {components[page] || <ForgotPassword setPage={setPage} setEmail={setEmail} setOTP={setOTP} />}
      </div>

      <Footer />
    </RecoveryContext.Provider>
  );
}

export default App;
