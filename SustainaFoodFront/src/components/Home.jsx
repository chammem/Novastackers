import React, { useEffect, useState } from 'react';
import HeaderMid from './HeaderMid';
import Footer from './Footer';
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import axiosInstance from '../config/axiosInstance';

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
      <HeaderMid />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
  
        {/* HERO SECTION */}
        <div className="hero min-h-[60vh] bg-base-200 rounded-xl shadow-md">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold leading-tight">Welcome to SustainaFood</h1>
              <p className="py-6 text-lg text-gray-700">
                Join us in the fight against food waste. Whether you're a driver, restaurant, or supermarket, together we can make a difference.
              </p>

              {user?.role === "driver" && !user?.isActive && (
                <div className="mt-6">
                  <div className="alert alert-warning">
                    <span>Your account is not yet active. Please submit your documents to activate your account.</span>
                  </div>
                  <Link to="/activateAccount" className="btn btn-warning mt-4">
                    Submit Documents
                  </Link>
                </div>
              )}

              {/* Role-based Custom Text */}
              {user?.role === "driver" && user?.isActive && (
                <div className="mt-6">
                  <p className="text-lg text-gray-700">
                    As a driver, you can start accepting food donations and deliver them to the NGOs in need. Your first step is to visit your dashboard and start making an impact.
                  </p>
                  <Link to="/dashboard" className="btn btn-primary mt-4">Go to Dashboard</Link>
                </div>
              )}

              {user?.role === "restaurant" && user?.isActive && (
                <div className="mt-6">
                  <p className="text-lg text-gray-700">
                    As a restaurant, you can list surplus food for donation. Start by visiting your dashboard and contributing to the fight against food waste.
                  </p>
                  <Link to="/dashboard" className="btn btn-primary mt-4">Go to Dashboard</Link>
                </div>
              )}

              {user?.role === "supermarket" && user?.isActive && (
                <div className="mt-6">
                  <p className="text-lg text-gray-700">
                    As a supermarket, you can donate excess food to help communities in need. Head to your dashboard to begin donating.
                  </p>
                  <Link to="/dashboard" className="btn btn-primary mt-4">Go to Dashboard</Link>
                </div>
              )}

              {!user && (
                <div className="mt-6">
                  <Link to="/signup" className="btn btn-primary">Get Started</Link>
                </div>
              )}

              {user?.isActive && !user?.role && (
                <div className="mt-6">
                  <p className="text-lg text-gray-700">
                    You're registered but still need to choose your role. Please visit the dashboard to set up your account.
                  </p>
                  <Link to="/signup" className="btn btn-primary mt-4">Choose Your Role</Link>
                </div>
              )}
            </div>
          </div>
        </div>
  
        {/* HOW IT WORKS */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1. Sign Up", text: "Create an account as a driver, restaurant, or supermarket." },
              { step: "2. Connect", text: "List or transport surplus food to those in need." },
              { step: "3. Make an Impact", text: "Reduce food waste and support communities." },
            ].map((item, i) => (
              <div key={i} className="card bg-base-100 shadow-md hover:shadow-xl transition-all">
                <div className="card-body items-center text-center">
                  <div className="text-4xl mb-3">💡</div>
                  <h3 className="card-title text-xl">{item.step}</h3>
                  <p className="text-gray-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
  
        {/* STATISTICS */}
        <section className="bg-base-200 p-8 rounded-xl">
          <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-5xl font-extrabold text-primary">10,000+</p>
              <p className="text-gray-600">Meals Saved</p>
            </div>
            <div>
              <p className="text-5xl font-extrabold text-primary">500+</p>
              <p className="text-gray-600">Partners</p>
            </div>
            <div>
              <p className="text-5xl font-extrabold text-primary">1M+ lbs</p>
              <p className="text-gray-600">Food Waste Reduced</p>
            </div>
          </div>
        </section>
  
        {/* TESTIMONIALS */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { text: "SustainaFood has helped us reduce food waste significantly while supporting our community.", author: "— Restaurant Owner" },
              { text: "As a driver, I love being part of a solution that makes a real difference.", author: "— Driver" },
            ].map((t, i) => (
              <div key={i} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <p className="text-gray-700 italic">"{t.text}"</p>
                  <p className="mt-4 font-semibold">{t.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
  
        {/* CALL TO ACTION */}
        <div className="hero bg-primary text-primary-content rounded-xl shadow-lg">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
              <p className="mb-6">Join SustainaFood today and start reducing food waste in your community.</p>
              {user ? (
                <Link to="/dashboard" className="btn btn-secondary">Go to Dashboard</Link>
              ) : (
                <Link to="/signup" className="btn btn-secondary">Sign Up Now</Link>
              )}
            </div>
          </div>
        </div>
      </div>
  
      <Footer />
    </>
  );
}

export default Home;
