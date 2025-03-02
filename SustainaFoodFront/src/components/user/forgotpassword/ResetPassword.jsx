import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../../config/axiosInstance";

const ResetPassword = ({ email }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      await axiosInstance.post("/reset-password", { email, password });
      toast.success("Password reset successfully!");
    } catch (error) {
      toast.error("Failed to reset password.");
    }
  };

  return (
    <div className="card w-96 bg-white shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <input
        type="password"
        placeholder="New Password"
        className="input input-bordered w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className="input input-bordered w-full mt-2"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button
        className="btn btn-primary mt-4 w-full"
        onClick={handleResetPassword}
      >
        Reset Password
      </button>
    </div>
  );
};

export default ResetPassword;
