import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../config/axiosInstance";

const EnterEmail = ({ onNext }) => {
  const [email, setEmail] = useState("");

  const handleRequestOTP = async () => {
    try {
      await axiosInstance.post("/request-otp", { email });
      toast.success("OTP sent to your email!");
      onNext(email);
    } catch (error) {
      toast.error("Failed to send OTP. Try again!");
    }
  };

  return (
    <div className="card w-96 bg-white shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        className="input input-bordered w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn btn-primary mt-4 w-full" onClick={handleRequestOTP}>
        Request OTP
      </button>
    </div>
  );
};

export default EnterEmail;
