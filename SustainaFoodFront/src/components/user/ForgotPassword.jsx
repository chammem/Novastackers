import axios from "axios";
import React, { useContext } from "react";
import { RecoveryContext } from "../../context/RecoveryContext";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
    const recoveryContext = useContext(RecoveryContext);
    if (!recoveryContext) {
        console.error("RecoveryContext is undefined. Make sure the provider is wrapped around the component.");
        return <p className="text-red-500 text-center">Error: Context not found.</p>;
    }

    const { setEmail, setPage, email, setOTP } = recoveryContext;
    const navigate = useNavigate();

    // Function to navigate to OTP input page
    function navigateToOtp() {
      if (!email) {
          alert("Please enter your email");
          return;
      }
   
      axios.post("http://localhost:8082/api/forgot-password", { email })
          .then(() => {
              console.log("Navigating to OTP page...");
              setPage("otp"); // Set page context for OTP
              navigate("/otp"); // Navigate to OTP input page
          })
          .catch((error) => {
              console.error("Error sending OTP:", error.response?.data || error.message);
              if (error.response?.data?.message === "Utilisateur non trouvé.") {
                  alert("Email address not found. Please check your email and try again.");
              } else {
                  alert("Failed to send OTP. Please try again.");
              }
          });
    }

    return (
        <section className="h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-xl p-8 w-96">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Forgot Password</h2>
                <p className="text-gray-600 text-sm text-center mb-6">Enter your email address to receive an OTP for password recovery.</p>
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
                    onClick={navigateToOtp} // Ensure this triggers the OTP sending and navigation
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                    Send OTP
                </button>
                <p className="text-center text-sm mt-4">
                    Remember your password? <a href="/" className="text-blue-600 font-semibold hover:underline">Login</a>
                </p>
            </div>
        </section>
    );
}
