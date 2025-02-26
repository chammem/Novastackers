import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";

function UserProfile() {
  const [user, setUser] = useState(null); // State to store user details
  const [vehiculeType, setVehiculeType] = useState("");
  const [driverLicense, setDriverLicense] = useState(null);
  const [vehiculeRegistration, setVehiculeRegistration] = useState(null);
  const [businessLicenseNumber, setBusinessLicenseNumber] = useState(null);
  const [taxId, setTaxId] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch user details (including role and ID) on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get("/user-details");
        setUser(response.data.data); // Update state with user details
        console.log("User details:", response.data.data); // Log the user details
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  // Handle driver document upload
  const handleDriverSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("driverId", user._id.toString()); // Convert to string
    formData.append("vehiculeType", vehiculeType);
    formData.append("driverLicense", driverLicense);
    formData.append("vehiculeRegistration", vehiculeRegistration);

    // Log FormData for debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axiosInstance.post("/upload-driver-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error uploading driver documents");
      console.error(error);
    }
  };

  // Handle restaurant document upload
  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("restaurantId", user._id.toString()); // Convert to string
    formData.append("businessLicenseNumber", businessLicenseNumber);
    formData.append("taxId", taxId);

    // Log FormData for debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axiosInstance.post("/upload-buisness-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error uploading restaurant documents");
      console.error(error);
    }
  };

  // Handle supermarket document upload
  const handleSupermarketSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("supermarketId", user._id.toString()); // Convert to string
    formData.append("businessLicenseNumber", businessLicenseNumber);
    formData.append("taxId", taxId);

    // Log FormData for debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axiosInstance.post("/upload-buisness-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error uploading supermarket documents");
      console.error(error);
    }
  };

  // Render nothing until user details are fetched
  if (!user) {
    return <p>Loading user details...</p>;
  }

  // Check if the role is valid
  if (!user.role || !["driver", "restaurant", "supermarket"].includes(user.role)) {
    return <p>Invalid role. Please contact support.</p>;
  }

  return (
    <div>
      <h2>Upload Documents</h2>
      {user.role === "driver" ? (
        <form onSubmit={handleDriverSubmit}>
          <div>
            <label>Vehicle Type:</label>
            <select
              value={vehiculeType}
              onChange={(e) => setVehiculeType(e.target.value)}
              required
            >
              <option value="">Select Vehicle Type</option>
              <option value="motor">Motor</option>
              <option value="car">Car</option>
            </select>
          </div>
          <div>
            <label>Driver License:</label>
            <input
              type="file"
              onChange={(e) => setDriverLicense(e.target.files[0])}
              required
            />
          </div>
          <div>
            <label>Vehicle Registration:</label>
            <input
              type="file"
              onChange={(e) => setVehiculeRegistration(e.target.files[0])}
              required
            />
          </div>
          <button type="submit">Upload Driver Documents</button>
        </form>
      ) : user.role === "restaurant" ? (
        <form onSubmit={handleRestaurantSubmit}>
          <div>
            <label>Business License Number:</label>
            <input
              type="file"
              onChange={(e) => setBusinessLicenseNumber(e.target.files[0])}
              required
            />
          </div>
          <div>
            <label>Tax ID:</label>
            <input
              type="file"
              onChange={(e) => setTaxId(e.target.files[0])}
              required
            />
          </div>
          <button type="submit">Upload Restaurant Documents</button>
        </form>
      ) : user.role === "supermarket" ? (
        <form onSubmit={handleSupermarketSubmit}>
          <div>
            <label>Business License Number:</label>
            <input
              type="file"
              onChange={(e) => setBusinessLicenseNumber(e.target.files[0])}
              required
            />
          </div>
          <div>
            <label>Tax ID:</label>
            <input
              type="file"
              onChange={(e) => setTaxId(e.target.files[0])}
              required
            />
          </div>
          <button type="submit">Upload Supermarket Documents</button>
        </form>
      ) : (
        <p>Invalid role. Please contact support.</p>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default UserProfile;