import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../../config/axiosInstance";

function VerifyAccount() {
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const userInput = state || {};

    const handleVerify = async (e) => {
        e.preventDefault();

        try {
            console.log("Sending verification request:", { code, userInput });
            const response = await axiosInstance.post("/verification", { userInput, code: code });
            console.log("Verification successful:", response.data);
            alert("Account successfully verified!");
            navigate("/login");
        } catch (error) {
            console.error("Verification error:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Verification failed.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold">Verify Your Account</h2>
                    <p className="text-sm text-gray-600">
                        A verification code has been sent to your email. Please enter it below:
                    </p>
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="form-control">
                            <input
                                onChange={(e) => setCode(e.target.value)}
                                type="text"
                                name="verificationCode"
                                placeholder="Enter Verification Code"
                                className="input input-bordered w-full"
                                required
                            />
                        </div>
                        {error && <p className="text-error text-sm">{error}</p>}
                        <div className="form-control">
                            <button type="submit" className="btn btn-primary w-full">
                                Verify
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default VerifyAccount;