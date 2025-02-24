import axios from "axios";
import React, { useContext } from "react";
import { RecoveryContext } from "../../context/RecoveryContext";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react"; // Import de l'icône Mail

export default function ForgotPassword() {
  const recoveryContext = useContext(RecoveryContext);
  
  if (!recoveryContext) {
    console.error("RecoveryContext is undefined. Make sure the provider is wrapped around the component.");
    return <p className="text-red-500 text-center">Error: Context not found.</p>;
  }

  const { setEmail, setPage, email, setOTP } = recoveryContext;
  const navigate = useNavigate();

  function navigateToOtp() {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    const OTP = Math.floor(Math.random() * 9000 + 1000);
    console.log("Generated OTP:", OTP);
    setOTP(OTP);

    axios
      .post("http://localhost:5000/send_recovery_email", {
        OTP,
        recipient_email: email,
      })
      .then(() => {
        setPage("otp");
        navigate("/otp"); // Redirige vers la page OTP
      })
      .catch((error) => {
        console.error("Error sending OTP:", error);
        alert("Failed to send OTP. Please try again.");
      });
  }

  return (
    <section className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-96">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Forgot Password
        </h2>
        
        <p className="text-gray-600 text-sm text-center mb-6">
          Enter your email address to receive an OTP for password recovery.
        </p>

        <div className="relative mb-4">
          <Mail className="absolute left-3 top-3 text-blue-500" size={20} />
          <input
            onChange={(e) => setEmail && setEmail(e.target.value)}
            type="email"
            value={email || ""}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <button
          onClick={navigateToOtp}
          className="w-full px-6 py-3 bg-blue-600 text-red rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Send OTP
        </button>

        <p className="text-center text-sm mt-4">
          Remember your password?{" "}
          <a href="/" className="text-blue-600 font-semibold hover:underline">
            Login
          </a>
        </p>
      </div>
    </section>
  );
}
