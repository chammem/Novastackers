import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";

const AdminVerificationComponent = () => {
  const [verifications, setVerifications] = useState([]); // State to store pending verifications
  const [message, setMessage] = useState(""); // State to display messages

  // Fetch pending verifications on component mount
  useEffect(() => {
    const fetchPendingVerifications = async () => {
      try {
        const response = await axiosInstance.get("/pending-verification");
        setVerifications(response.data);
      } catch (error) {
        console.error("Error fetching pending verifications:", error);
        setMessage("Failed to fetch verifications");
      }
    };

    fetchPendingVerifications();
  }, []);

  // Handle approve/reject action
  //   const handleVerification = async (id, status) => {
  //     try {
  //       const response = await axiosInstance.put(`/verify/${id}`, { status });
  //       setMessage(response.data.message);

  //       // Update the verifications list
  //       const updatedVerifications = verifications.map((verification) =>
  //         verification._id === id ? response.data.verification : verification
  //       );
  //       setVerifications(updatedVerifications);
  //     } catch (error) {
  //       console.error("Error updating verification:", error);
  //       setMessage("Failed to update verification");
  //     }
  //   };

  return (
    <div>
      <h2>Pending Verifications</h2>
      {message && <p>{message}</p>}

      {verifications.length === 0 ? (
        <p>No pending verifications.</p>
      ) : (
        verifications.map((verification) => (
          <div
            key={verification._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <h3>User: {verification.userId?.fullName || "N/A"}</h3>
            <p>Role: {verification.userId?.role || "N/A"}</p>
            <p>Email: {verification.userId?.email || "N/A"}</p>
            <p>Status: {verification.status}</p>

            {/* Display Driver License */}
            {verification.driverLicense && (
              <div>
                <h4>Driver License</h4>
                <img
                  src={`http://localhost:8082/${verification.driverLicense.url}`}
                  alt="Driver License"
                  style={{ width: "200px" }}
                />
                <p>
                  Verified: {verification.driverLicense.verified ? "Yes" : "No"}
                </p>
              </div>
            )}

            {/* Display Vehicle Registration */}
            {verification.vehiculeRegistration && (
              <div>
                <h4>Vehicle Registration</h4>
                <img
                  src={`http://localhost:8082/${verification.vehiculeRegistration.url}`}
                  alt="Vehicle Registration"
                  style={{ width: "200px" }}
                />
                <p>
                  Verified:{" "}
                  {verification.vehiculeRegistration.verified ? "Yes" : "No"}
                </p>
              </div>
            )}

            {/* Display Business License */}
            {verification.businessLicenseNumber && (
              <div>
                <h4>Business License Number</h4>
                <img
                  src={`http://localhost:8082/${verification.businessLicenseNumber.url}`}
                  alt="Business License"
                  style={{ width: "200px" }}
                />
                <p>
                  Verified:{" "}
                  {verification.businessLicenseNumber.verified ? "Yes" : "No"}
                </p>
              </div>
            )}

            {/* Display Tax ID */}
            {verification.taxId && (
              <div>
                <h4>Tax ID</h4>
                <img
                  src={`http://localhost:8082/${verification.taxId.url}`}
                  alt="Tax ID"
                  style={{ width: "200px" }}
                />
                <p>Verified: {verification.taxId.verified ? "Yes" : "No"}</p>
              </div>
            )}

            {/* Approve/Reject Buttons */}
            <div>
              <button
                //onClick={() => handleVerification(verification._id, "approved")}
                style={{
                  marginRight: "10px",
                  backgroundColor: "green",
                  color: "white",
                }}
              >
                Approve
              </button>
              <button
                // onClick={() => handleVerification(verification._id, "rejected")}
                style={{ backgroundColor: "red", color: "white" }}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminVerificationComponent;
