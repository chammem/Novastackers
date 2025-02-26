import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance'; // Ensure you have this configured
import HeaderMid from '../HeaderMid';
import BreadCrumb from '../BreadCrumb';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCookies } from "react-cookie";
function Connect() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/login", { email, password });

      if (response.data.success) {
        navigate("/home"); // Redirect to home page after login
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg">
        {/* Form Section */}
        <div className="w-1/2 p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                onChange={e=>{{setEmail(e.target.value)}}}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                onChange={e=>{{setPassword(e.target.value);console.log(password)}}}
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="flex items-center justify-between">
              <a
                href="/forgot-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary w-full" >
             {isLoading ? 'Signing In...' : 'SIGN IN'}
            </button>
          </form>

          {/* Social Media Login */}
          <div className="mt-4 flex flex-col gap-2">
            <button className="btn btn-outline btn-google w-full flex items-center justify-center gap-2">
            <img
                src="/images/google.png"
                alt="Google"
                className="h-6 w-6"
              />
              Login with Google
            </button>
          
          </div>

          {/* Create Account Link */}
          <div className="mt-4 text-center">
            <p>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:underline"
              >
                Create one here.
              </Link>
            </p>
          </div>
        </div>

        {/* Image Section */}
        <div
          className="w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/images/login.svg")',
          }}
        ></div>
      </div>
    </div>
  );
}

export default Connect;
