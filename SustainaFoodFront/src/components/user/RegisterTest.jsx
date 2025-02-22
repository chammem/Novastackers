import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";

const roleBasedFields = {
  user: ["lastName", "firstName"],
  driver: ["lastName", "firstName", "vehicleType", "licensePlateNumber", "vehicleCapacity", "driverLicenseNumber", "vehicleRegistration"],
  restaurant: ["restaurantName", "businessLicenseNumber", "taxId", "averageQuantityDonated", "preferredPickupTimes"],
  supermarket: ["supermarketName", "businessLicenseNumber", "taxId"],
};

// Utility function to format field names
const formatFieldName = (field) => {
  return field
    .replace(/([A-Z])/g, " $1") // Add a space before uppercase letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
};

function UserForm() {
  const { role } = useParams(); // Get role from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role,
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phoneNumber: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const { firstName, lastName, ...otherFields } = formData; // Destructure to extract firstName and lastName
      const fullName = `${firstName} ${lastName}`;
      const response = await axiosInstance.post("/sign-up", {
        ...otherFields,
        role, // Use the role from URL
        fullName,
      });

      console.log("Signup successful:", response.data);
      alert("A verification code has been sent to your email.");

      navigate("/verify", { state: formData });
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
    }
  };

  // Fields to always display at the top
  const topFields = ["lastName", "firstName", "restaurantName"];

  // Get the fields for the current role
  const fields = roleBasedFields[role] || [];

  // Separate fields into top and bottom
  const topFieldsToRender = fields.filter((field) => topFields.includes(field));
  const bottomFieldsToRender = fields.filter((field) => !topFields.includes(field));

  return (
    <div className="ltn__login-area pb-110">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title-area text-center">
              <h1 className="section-title">Register as {role.charAt(0).toUpperCase() + role.slice(1)}</h1>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-6 offset-lg-3">
            <div className="account-login-inner">
              <form onSubmit={handleSignup} className="ltn__form-box contact-form-box">
                {/* Render top fields first */}
                {topFieldsToRender.map((field, index) => (
                  <input
                    key={`${field}-${index}`}
                    type="text"
                    name={field}
                    placeholder={formatFieldName(field)} // Format field name
                    onChange={handleChange}
                  />
                ))}

                {/* Common fields */}
                <input type="email" name="email" placeholder="Email" onChange={handleChange} />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />
                <input type="text" name="address" placeholder="Address" onChange={handleChange} />
                <input type="text" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} />

                {/* Render bottom fields */}
                {bottomFieldsToRender.map((field, index) => (
                  <input
                    key={`${field}-${index}`}
                    type="text"
                    name={field}
                    placeholder={formatFieldName(field)} // Format field name
                    onChange={handleChange}
                  />
                ))}

                <button className="theme-btn-1 btn reverse-color btn-block" type="submit">
                  CREATE ACCOUNT
                </button>
              </form>

              <div className="by-agree text-center">
                <p>By creating an account, you agree to our:</p>
                <p>
                  <a href="#">TERMS OF CONDITIONS | PRIVACY POLICY</a>
                </p>
                <div className="go-to-btn mt-50">
                  <a href="/login">ALREADY HAVE AN ACCOUNT?</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserForm;