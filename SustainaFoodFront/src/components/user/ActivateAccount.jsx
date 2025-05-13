import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";
import HeaderMid from "../HeaderMid";
import {
  FiTruck,
  FiPackage,
  FiBriefcase,
  FiCheckCircle,
  FiAlertCircle,
  FiNavigation,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import { FaCar, FaMotorcycle, FaBicycle } from "react-icons/fa";
import { toast } from "react-toastify";

function ActivateAccount() {
  const [user, setUser] = useState(null);
  const [transportType, setTransportType] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [driverLicense, setDriverLicense] = useState(null);
  const [vehicleRegistration, setVehicleRegistration] = useState(null);
  const [businessLicenseNumber, setBusinessLicenseNumber] = useState(null);
  const [taxId, setTaxId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Update vehicle type automatically based on transport type
  useEffect(() => {
    if (transportType === "walking" || transportType === "bicycle") {
      setVehicleType("small");
    } else if (transportType === "motor" || transportType === "car") {
      setVehicleType("medium");
    } else if (transportType === "truck") {
      setVehicleType("large");
    }
  }, [transportType]);

  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get("/user-details");
        setUser(response.data.data);
        console.log("User details:", response.data.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  // Handle driver document upload
  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("userId", user._id.toString());
    formData.append("transportType", transportType);
    formData.append("transportCapacity", vehicleType);

    // Only append documents for vehicle types that require them
    const requiresDocuments = ["motor", "car", "truck"].includes(transportType);

    if (requiresDocuments) {
      if (transportType === "motor") {
        if (vehicleRegistration) {
          formData.append("vehiculeRegistration", vehicleRegistration);
        }
      } else if (transportType === "car" || transportType === "truck") {
        if (driverLicense) {
          formData.append("driverLicense", driverLicense);
        }
        if (vehicleRegistration) {
          formData.append("vehiculeRegistration", vehicleRegistration);
        }
      }
    }

    try {
      const response = await axiosInstance.post(
        "/upload-driver-documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update local user state with response data
      if (response.data.success) {
        setUser((prev) => ({
          ...prev,
          transportType,
          transportCapacity: vehicleType,
          isActive: ["walking", "bicycle"].includes(transportType)
            ? true
            : prev.isActive,
        }));

        // Show success message
        if (["walking", "bicycle"].includes(transportType)) {
          toast.success("Your account has been automatically activated!");
        } else {
          toast.success("Documents submitted for verification");
        }
      }

      setMessage(response.data.message);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error updating driver information"
      );
      toast.error(
        error.response?.data?.message || "Error updating driver information"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle business document upload (unchanged)
  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("businessId", user._id.toString());
    formData.append("businessLicenseNumber", businessLicenseNumber);
    formData.append("taxId", taxId);

    try {
      const response = await axiosInstance.post(
        "/upload-buisness-documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error uploading business documents");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Render nothing until user details are fetched
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  // Check if the role is valid
  if (
    !user.role ||
    !["driver", "restaurant", "supermarket", "volunteer"].includes(user.role)
  ) {
    return (
      <p className="text-center py-8 text-error">
        Invalid role. Please contact support.
      </p>
    );
  }

  return (
    <>
      <HeaderMid />
      <div className="max-w-4xl mx-auto p-6 bg-base-100 shadow-md rounded-lg mt-10 mb-16">
        <h2 className="text-3xl font-bold text-center mb-6">
          Activate Your Account
        </h2>
        <p className="text-center mb-8 text-sm opacity-70">
          Please provide the necessary information to verify your account. Your
          account will be reviewed by our team within 24-48 hours.
        </p>

        {/* Driver/Volunteer Form */}
        {(user.role === "driver" || user.role === "volunteer") && (
          <form onSubmit={handleDriverSubmit} className="space-y-6">
            {/* Transport Type Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Transport Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                required
              >
                <option value="">Select Transport Type</option>
                <option value="walking">🚶 Walking</option>
                <option value="bicycle">🚲 Bicycle</option>
                <option value="motor">🏍️ Motorcycle</option>
                <option value="car">🚗 Car</option>
                <option value="truck">🚚 Truck</option>
              </select>
            </div>

            {/* Transport Capacity - Read-only and automatic */}
            {transportType && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Transport Capacity
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={vehicleType}
                  disabled={true}
                >
                  <option value="small">Small (1-2 bags)</option>
                  <option value="medium">Medium (3-5 bags)</option>
                  <option value="large">Large (6+ bags)</option>
                </select>
                <label className="label">
                  <span className="label-text-alt">
                    Capacity is automatically determined by transport type
                  </span>
                </label>
              </div>
            )}

            {/* Required Documents Section */}
            {transportType && (
              <div className="p-4 bg-base-200 rounded-lg mt-2">
                <h3 className="font-semibold mb-3">Required Documents</h3>

                {/* No documents needed for walking */}
                {transportType === "walking" && (
                  <div className="flex items-center gap-2 text-success mb-2">
                    <FiCheckCircle />
                    <span>
                      No documents required for walking transport type
                    </span>
                  </div>
                )}

                {/* Bicycle: No documents */}
                {transportType === "bicycle" && (
                  <div className="flex items-center gap-2 text-success mb-2">
                    <FiCheckCircle />
                    <span>No additional documents required for bicycle</span>
                  </div>
                )}

                {/* Motor/Motorcycle: Vehicle Registration */}
                {transportType === "motor" && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Vehicle Registration</span>
                    </label>
                    <input
                      type="file"
                      className="file-input file-input-bordered w-full"
                      onChange={(e) =>
                        setVehicleRegistration(e.target.files[0])
                      }
                      required
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        Upload a clear image of your motorcycle registration
                      </span>
                    </label>
                  </div>
                )}

                {/* Car: Driver License and Vehicle Registration */}
                {transportType === "car" && (
                  <>
                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Driver License</span>
                      </label>
                      <input
                        type="file"
                        className="file-input file-input-bordered w-full"
                        onChange={(e) => setDriverLicense(e.target.files[0])}
                        required
                      />
                      <label className="label">
                        <span className="label-text-alt">
                          Front and back of your driver's license
                        </span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Vehicle Registration</span>
                      </label>
                      <input
                        type="file"
                        className="file-input file-input-bordered w-full"
                        onChange={(e) =>
                          setVehicleRegistration(e.target.files[0])
                        }
                        required
                      />
                    </div>
                  </>
                )}

                {/* Truck: Same as car - just driver license and registration */}
                {transportType === "truck" && (
                  <>
                    <div className="form-control mb-4">
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
                        onChange={(e) =>
                          setVehicleRegistration(e.target.files[0])
                        }
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="form-control mt-8">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={
                  loading ||
                  !transportType ||
                  (transportType === "motor" && !vehicleRegistration) ||
                  ((transportType === "car" || transportType === "truck") &&
                    (!driverLicense || !vehicleRegistration))
                }
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  "Upload Documents"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Restaurant/Supermarket Form - Keeping it untouched as requested */}
        {(user.role === "restaurant" || user.role === "supermarket") && (
          <form onSubmit={handleBusinessSubmit} className="space-y-6">
            {/* Business License Number */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Business License Number</span>
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
                <span className="label-text">Tax ID</span>
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
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  `Upload ${
                    user.role === "restaurant" ? "Restaurant" : "Supermarket"
                  } Documents`
                )}
              </button>
            </div>
          </form>
        )}

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              message.startsWith("Error")
                ? "bg-error/10 text-error"
                : "bg-success/10 text-success"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.startsWith("Error") ? (
                <FiAlertCircle />
              ) : (
                <FiCheckCircle />
              )}
              <span>{message}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ActivateAccount;
