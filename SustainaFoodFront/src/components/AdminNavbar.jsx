import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../config/axiosInstance";
import { useEffect, useState } from "react";

const AdminNavbar = ({ activeTab, setActiveTab }) => {
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get("/user-details");
        setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      console.log("Attempting to log out...");
      const response = await axiosInstance.post("/userLogout");
      console.log("Logout response:", response.data);

      setUser(null); // Clear user state
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl" href="#">Admin Dashboard</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal p-0">
          <li>
            <a
              className={activeTab === 'users' ? 'font-bold underline' : ''}
              onClick={() => setActiveTab('users')}
            >
              Users
            </a>
          </li>
          <li>
            <a
              className={activeTab === 'food' ? 'font-bold underline' : ''}
              onClick={() => setActiveTab('food')}
            >
              Food
            </a>
          </li>
          <li>
            <a
              className={activeTab === 'food' ? 'font-bold underline' : ''}
              onClick={() => setActiveTab('verifications')}
            >
              Role Verification
            </a>
          </li>
          <li>
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                {/* Conditional rendering for user avatar */}
                <div className="w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {user ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <Link to="" className="justify-between">
                    Profile
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminNavbar;