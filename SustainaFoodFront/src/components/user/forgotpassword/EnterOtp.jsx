import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../config/axiosInstance";

const EnterOtp = ({ email, onVerify }) => {
  const [otp, setOtp] = useState("");

  const handleVerifyOTP = async () => {
    try {
      await axiosInstance.post("/verify-otp", { email, otp });
      toast.success("OTP verified!");
      onVerify();
    } catch (error) {
      toast.error("Invalid OTP. Try again!");
    }
  };

  return (
    <div className="card w-96 bg-white shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>
      <input
        type="text"
        placeholder="Enter OTP"
        className="input input-bordered w-full"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button className="btn btn-primary mt-4 w-full" onClick={handleVerifyOTP}>
        Verify OTP
      </button>
    </div>
  );
};

export default EnterOtp;
