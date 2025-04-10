// utils/otp.js
import axiosInstance from './axiosInstance';

export const sendOTP = async (email) => {
  return await axiosInstance.post('/auth/send-otp', { email });
};

export const verifyOTP = async (otpData) => {
  return await axiosInstance.post('/auth/verify-otp', otpData);
};
