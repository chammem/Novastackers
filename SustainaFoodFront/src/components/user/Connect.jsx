import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosInstance'; // Ensure you have this configured
import HeaderMid from '../HeaderMid';
import BreadCrumb from '../BreadCrumb';
import axios from 'axios';
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
    <>
      <HeaderMid />
      <BreadCrumb name="Login" />
      <div className="ltn__login-area pb-65">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title-area text-center">
                <h1 className="section-title">Sign In <br />To Your Account</h1>
                <p>Access your account and start shopping today.</p>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="account-login-inner">
                <form className="ltn__form-box contact-form-box" onSubmit={handleSubmit}>
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                  {error && <p className="error-message">{error}</p>}
                  <div className="btn-wrapper mt-0">
                    <button className="theme-btn-1 btn" type="submit" disabled={isLoading}>
                      {isLoading ? 'Signing In...' : 'SIGN IN'}
                    </button>
                  </div>
                  <div className="go-to-btn mt-20">
                    <a href="#"><small>FORGOTTEN YOUR PASSWORD?</small></a>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="account-create text-center pt-50">
                <h4>DON'T HAVE AN ACCOUNT?</h4>
                <p>Create an account to track orders, save items, and more.</p>
                <div className="btn-wrapper">
                  <a href="/register" className="theme-btn-1 btn black-btn">CREATE ACCOUNT</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Connect;
