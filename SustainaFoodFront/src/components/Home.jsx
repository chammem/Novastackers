import React from 'react'

import HeaderMid from './HeaderMid'

import Footer from './Footer'
import { Link } from "react-router-dom";
import { useState,useEffect } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../config/axiosInstance'
function Home() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get("/user-details");
        setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to fetch user details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }
  return (
    <>
    
    <HeaderMid/>
    <div className="max-w-6xl mx-auto p-6">
      {/* Hero Section */}
      <div className="hero bg-base-200 rounded-lg mb-8">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold">Welcome to SustainaFood!</h1>
            <p className="py-6 text-lg">
              Join us in the fight against food waste. Whether you're a driver, restaurant, or supermarket, together we can make a difference.
            </p>

            {/* Activation Section for Drivers */}
            {user?.role === "driver" && !user?.isActive && (
              <div className="mt-6">
                <div className="alert alert-warning">
                  <div>
                    <span>
                      Your account is not yet active. Please submit your documents to activate your account.
                    </span>
                  </div>
                </div>
                <Link to="/activateAccount" className="btn btn-warning mt-4">
                  Submit Documents
                </Link>
              </div>
            )}

            {/* Call-to-Action for Active Users or Guests */}
            {(!user || user?.isActive) && (
              <div className="mt-6">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary">
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link to="/signup" className="btn btn-primary">
                    Get Started
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold">1. Sign Up</h3>
              <p className="text-gray-700">
                Create an account as a driver, restaurant, or supermarket to join our platform.
              </p>
            </div>
          </div>
          {/* Step 2 */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold">2. Connect</h3>
              <p className="text-gray-700">
                Restaurants and supermarkets list surplus food, and drivers pick up and deliver it to those in need.
              </p>
            </div>
          </div>
          {/* Step 3 */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-xl font-semibold">3. Make an Impact</h3>
              <p className="text-gray-700">
                Reduce food waste, save money, and help your community—all in one platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-base-200 p-8 rounded-lg mb-8">
        <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">10,000+</p>
            <p className="text-gray-700">Meals Saved</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">500+</p>
            <p className="text-gray-700">Partners</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">1M+ lbs</p>
            <p className="text-gray-700">Food Waste Reduced</p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Testimonial 1 */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <p className="text-gray-700 italic">
                "SustainaFood has helped us reduce food waste significantly while supporting our community. Highly recommend!"
              </p>
              <p className="mt-4 font-semibold">— Restaurant Owner</p>
            </div>
          </div>
          {/* Testimonial 2 */}
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <p className="text-gray-700 italic">
                "As a driver, I love being part of a solution that makes a real difference. It's rewarding and impactful."
              </p>
              <p className="mt-4 font-semibold">— Driver</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="hero bg-primary text-primary-content rounded-lg">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="mb-6">
              Join SustainaFood today and start reducing food waste in your community.
            </p>
            {user ? (
              <Link to="/dashboard" className="btn btn-secondary">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/signup" className="btn btn-secondary">
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>


    <Footer/>
    
</>
  )
}

export default Home