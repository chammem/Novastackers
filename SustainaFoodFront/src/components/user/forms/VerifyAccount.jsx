import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../config/axiosInstance";


function VerifyAccount() {
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const userInput = state || {};
    console.log(userInput);
    // Get email from URL query parameters
    //const searchParams = new URLSearchParams(location.search);
   // const email = searchParams.get("email");

    // useEffect(() => {
    //     if (!email) {
    //         alert("No email found. Please register first.");
    //         navigate("/signup"); 
    //     }
    // }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        
        try {
            
            console.log("Sending verification request:", { code , userInput });
            const response = await axiosInstance.post("/verification", {userInput,code: code,});
            console.log("Verification successful:", response.data);
            alert("Account successfully verified!");
            navigate("/login");
        } catch (error) {
            console.error("Verification error:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Verification failed.");
        }
    };

    return (
        <div className="container">
            <h2>Verify Your Account</h2>
            <p>A verification code has been sent to <b></b>. Please enter it below:</p>
            <form onSubmit={handleVerify}>
                <input
                    onChange={(e) => setCode(e.target.value)}
                    type="text"
                    name="verificationCode"
                    placeholder="Enter Verification Code"
                    required
                />
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit">Verify</button>
            </form>
        </div>
    );
}

export default VerifyAccount;
