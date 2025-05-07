import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";
import HeaderMid from "../HeaderMid";
function ActivateAccount() {
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
    formData.append("driverId", user._id.toString());
    formData.append("vehiculeType", vehiculeType);

    // Add documents based on vehicle type
    if (vehiculeType === "motor") {
      formData.append("vehiculeRegistration", vehiculeRegistration);
    } else if (vehiculeType === "car") {
      formData.append("driverLicense", driverLicense);
      formData.append("vehiculeRegistration", vehiculeRegistration);
    }

    try {
      const response = await axiosInstance.post("/upload-driver-documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error uploading documents");
      console.error(error);
    }
  };

  // Handle restaurant/supermarket document upload
  const handleBusinessSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("businessId", user._id.toString()); // Convert to string
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
      setMessage("Error uploading business documents");
      console.error(error);
    }
  };

  // Render nothing until user details are fetched
  if (!user) {
    return <p className="text-center py-8">Loading user details...</p>;
  }

  // Check if the role is valid
  if (!user.role || !["driver", "restaurant", "supermarket"].includes(user.role)) {
    return <p className="text-center py-8 text-error">Invalid role. Please contact support.</p>;
  }

  return (
    <>
    <HeaderMid/>
    <div className="max-w-4xl mx-auto p-6 bg-base-100 shadow-md rounded-lg mt-10">
      <h2 className="text-3xl font-bold text-center mb-6">Activate Your Account</h2>

      {/* Driver Form */}
      {user.role === "driver" && (
          <form onSubmit={handleDriverSubmit} className="space-y-6">
            {/* Vehicle Type Dropdown */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Vehicle Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={vehiculeType}
                onChange={(e) => setVehiculeType(e.target.value)}
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="bike">Bike</option>
                <option value="motor">Motor</option>
                <option value="car">Car</option>
              </select>
            </div>

            {/* Motor: Only Vehicle Registration */}
            {vehiculeType === "motor" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Vehicle Registration</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => setVehiculeRegistration(e.target.files[0])}
                  required
                />
              </div>
            )}

            {/* Car: Both Driver License and Vehicle Registration */}
            {vehiculeType === "car" && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Driver License</span>
                  </label>
                  <input
                    type="file"
                    className="file-input file-input-bordered w-full"
                    onChange={(e) => setDriverLicense(e.target.files[0])}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Vehicle Registration</span>
                  </label>
                  <input
                    type="file"
                    className="file-input file-input-bordered w-full"
                    onChange={(e) => setVehiculeRegistration(e.target.files[0])}
                    required
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="form-control mt-8">
              <button type="submit" className="btn btn-primary w-full">
                Upload Documents
              </button>
            </div>
          </form>
        )}

      {/* Restaurant/Supermarket Form */}
      {(user.role === "restaurant" || user.role === "supermarket") && (
        <form onSubmit={handleBusinessSubmit} className="space-y-6">
          {/* Business License Number */}
          <div className="form-control">
            <label className="label">
<<<<<<< HEAD
              <span className="label-text">Business License Number (text.pdf)</span>
=======
              <span className="label-text">Business License Number</span>
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              onChange={(e) => setBusinessLicenseNumber(e.target.files[0])}
              required
            />
          </div>

          {/* Tax ID */}
          <div className="form-control">
            <label className="label">
<<<<<<< HEAD
              <span className="label-text">Tax ID (text.pdf)</span>
=======
              <span className="label-text">Tax ID</span>
>>>>>>> 70ed007175c654acdf2834d2f0d751da864c8954
            </label>
            <input
              type="file"
              className="file-input file-input-bordered w-full"
              onChange={(e) => setTaxId(e.target.files[0])}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="form-control mt-8">
            <button type="submit" className="btn btn-primary w-full">
              Upload {user.role === "restaurant" ? "Restaurant" : "Supermarket"} Documents
            </button>
          </div>
        </form>
      )}

      {/* Success/Error Message */}
      {message && (
        <div className={`mt-6 text-center ${message.startsWith("Error") ? "text-error" : "text-success"}`}>
          {message}
        </div>
      )}
    </div>
    </>
  );
}

export default ActivateAccount;