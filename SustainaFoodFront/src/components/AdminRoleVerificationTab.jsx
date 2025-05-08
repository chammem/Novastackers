import React, { useState, useEffect } from "react";
import axiosInstance from "../config/axiosInstance";

function VerificationImages() {
  const [verifications, setVerifications] = useState([]);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch verifications
  const fetchVerifications = async () => {
    try {
      const response = await axiosInstance.get("/pending-verification");
      setVerifications(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      setError("Failed to fetch verifications. Please try again.");
    }
  };

  // Fetch verifications on component mount
  useEffect(() => {
    fetchVerifications();
  }, []);

  // Open image in a modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Close image modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Handle accept/reject action
  const handleVerificationAction = async (verificationId, action) => {
    try {
      const response = await axiosInstance.post(`/verification/${verificationId}/${action}`);
      if (response.data.success) {
        // Refresh the list of verifications after updating the status
        fetchVerifications();
      }
    } catch (error) {
      console.error(`Error ${action}ing verification:`, error);
      setError(`Failed to ${action} verification. Please try again.`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Verification Images</h1>
      <button onClick={fetchVerifications} className="btn btn-primary mb-6">
        Refresh
      </button>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {verifications.map((verification) => (
          <div key={verification._id} className="card bg-base-100 shadow-md">
            <div className="card-body">
              {/* Display User Information */}
              <h2 className="card-title">{verification.userId?.fullName}</h2>
              <p>Role: {verification.userId?.role}</p>
              <p>Status: {verification.status}</p>

              {/* Display Driver License Image */}
              {verification.driverLicense?.url && (
                <div>
                  <p>Driver License:</p>
                  <img
                    src={`http://localhost:8082/${verification.driverLicense.url}`}
                    alt="Driver License"
                    className="cursor-pointer w-32 h-32 object-cover"
                    onClick={() => openImageModal(verification.driverLicense.url)}
                  />
                </div>
              )}

              {/* Display Vehicle Registration Image */}
              {verification.vehiculeRegistration?.url && (
                <div>
                  <p>Vehicle Registration:</p>
                  <img
                    src={`http://localhost:8082/${verification.vehiculeRegistration.url}`}
                    alt="Vehicle Registration"
                    className="cursor-pointer w-32 h-32 object-cover"
                    onClick={() => openImageModal(verification.vehiculeRegistration.url)}
                  />
                </div>
              )}

              {/* Display Business License Number Image */}
              {verification.businessLicenseNumber?.url && (
                <div>
                  <p>Business License Number:</p>
                  <img
                    src={`http://localhost:8082/${verification.businessLicenseNumber.url}`}
                    alt="Business License Number"
                    className="cursor-pointer w-32 h-32 object-cover"
                    onClick={() => openImageModal(verification.businessLicenseNumber.url)}
                  />
                </div>
              )}

              {/* Display Tax ID Image */}
              {verification.taxId?.url && (
                <div>
                  <p>Tax ID:</p>
                  <img
                    src={`http://localhost:8082/${verification.taxId.url}`}
                    alt="Tax ID"
                    className="cursor-pointer w-32 h-32 object-cover"
                    onClick={() => openImageModal(verification.taxId.url)}
                  />
                </div>
              )}

              {/* Accept and Reject Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleVerificationAction(verification._id, "accept")}
                  className="btn btn-success"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleVerificationAction(verification._id, "reject")}
                  className="btn btn-error"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-base-100 p-6 rounded-lg">
            <img
              src={`http://localhost:8082/${selectedImage}`}
              alt="Enlarged"
              className="max-w-full max-h-screen"
            />
            <button onClick={closeImageModal} className="btn btn-primary mt-4">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificationImages;