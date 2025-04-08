import React, { useState } from "react";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import BreadCrumb from "../BreadCrumb";
import { useNavigate } from "react-router-dom";

function RoleChoice() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (role === "") return;
    navigate(`/register/${role}`);
  };

  return (
    <>
      <HeaderMid />
      
      <div className="max-w-4xl mx-auto p-6 bg-base-100 shadow-md rounded-lg mt-20 mb-40"> {/* Added mb-20 for more space */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Select Your Role</h1>
          <p className="text-gray-600">Choose your role to get started.</p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <form className="space-y-6">
              {/* Role Selection Dropdown */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Select Role</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">----</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="driver">Driver</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="form-control">
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={handleSubmit}
                >
                  Select Role
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default RoleChoice;