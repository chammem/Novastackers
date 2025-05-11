import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";
import AdminNavbar from "../AdminNavbar";

const AdminVerificationComponent = (props) => {
  const {
    sidebarOpen,
    setSidebarOpen,
    user,
    notifications,
    onLogout,
  } = props;

  const [localSidebarOpen, setLocalSidebarOpen] = useState(true);
  const effectiveSidebarOpen = typeof sidebarOpen === "boolean" ? sidebarOpen : localSidebarOpen;
  const effectiveSetSidebarOpen = setSidebarOpen || setLocalSidebarOpen;

  const [verifications, setVerifications] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPendingVerifications = async () => {
      try {
        const response = await axiosInstance.get("/pending-verification");
        setVerifications(response.data);
      } catch (error) {
        setMessage("Failed to fetch verifications");
      }
    };
    fetchPendingVerifications();
  }, []);

  // Correction: Use the correct backend endpoint and method (action in URL, not body)
  const handleVerification = async (id, action) => {
    try {
      const response = await axiosInstance.post(`/verification/${id}/${action}`);
      setMessage(response.data.message);

      // Remove the processed verification from the list
      setVerifications((prev) =>
        prev.filter((verification) => verification._id !== id)
      );
    } catch (error) {
      setMessage("Failed to update verification");
    }
  };

  // Ajout d'un padding left selon l'état du sidebar
  const contentPadding = effectiveSidebarOpen
    ? "md:ml-80 ml-20"
    : "md:ml-20 ml-20";

  return (
    <div className="min-h-screen bg-base-100 dark:bg-neutral">
      <AdminNavbar
        sidebarOpen={effectiveSidebarOpen}
        setSidebarOpen={effectiveSetSidebarOpen}
        user={user}
        notifications={notifications}
        onLogout={onLogout}
      />
      <div 
        className={`transition-all duration-300 ${effectiveSidebarOpen ? 'ml-64' : 'ml-16'} pt-20 pb-8 px-2 md:px-8`}
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header créatif et simple */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-green-700 mb-1">
                Verification Management
              </h1>
              <p className="text-gray-500 text-base md:text-lg">
                Review and manage user verification requests with a modern, clear interface.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold shadow">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
          {message && (
            <div className="alert alert-error mb-4">
              <span>{message}</span>
            </div>
          )}

          {verifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="text-gray-400 text-lg">No pending verifications.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {verifications.map((verification) => (
                <div
                  key={verification._id}
                  className="relative bg-gradient-to-br from-white to-base-100 dark:from-base-200 dark:to-neutral-800 rounded-2xl shadow-xl p-8 flex flex-col gap-4 border border-base-200 hover:shadow-green-200 hover:border-green-200 transition-all duration-300 group"
                >
                  {/* Decorative badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`badge px-3 py-1 text-xs font-bold uppercase tracking-wider ${verification.status === "pending" ? "badge-warning" : verification.status === "approved" ? "badge-success" : "badge-error"}`}>
                      {verification.status}
                    </span>
                  </div>
                  {/* User Info */}
                  <div className="flex items-center gap-4 mb-2">
                    <div className="avatar placeholder">
                      <div className="bg-green-200 text-green-800 rounded-full w-14 h-14 flex items-center justify-center font-bold text-2xl shadow">
                        {verification.userId?.fullName?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-base-content dark:text-neutral-content">
                        {verification.userId?.fullName || "N/A"}
                      </h3>
                      <div className="text-xs text-gray-500">{verification.userId?.email || "N/A"}</div>
                      <div className="badge badge-outline badge-success mt-1">{verification.userId?.role || "N/A"}</div>
                    </div>
                  </div>
                  {/* Documents Carousel avec design amélioré */}
                  <div className="flex flex-row gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-base-200 p-1">
                    {verification.driverLicense && (
                      <DocCard
                        title="Driver License"
                        url={verification.driverLicense.url}
                        verified={verification.driverLicense.verified}
                      />
                    )}
                    {verification.vehiculeRegistration && (
                      <DocCard
                        title="Vehicle Registration"
                        url={verification.vehiculeRegistration.url}
                        verified={verification.vehiculeRegistration.verified}
                      />
                    )}
                    {verification.businessLicenseNumber && (
                      <DocCard
                        title="Business License"
                        url={verification.businessLicenseNumber.url}
                        verified={verification.businessLicenseNumber.verified}
                      />
                    )}
                    {verification.taxId && (
                      <DocCard
                        title="Tax ID"
                        url={verification.taxId.url}
                        verified={verification.taxId.verified}
                      />
                    )}
                  </div>
                  {/* Approve/Reject Buttons avec meilleur contraste (ratio ≥ 4.7:1) */}
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => handleVerification(verification._id, "accept")}
                      className="relative flex-1 py-3 px-4 bg-gradient-to-r from-green-700 to-emerald-800 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-green-200 group overflow-hidden transition-all duration-300"
                    >
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                      <div className="flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current transition-transform group-hover:scale-110">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="font-semibold">Approve</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-xl"></div>
                    </button>
                    <button
                      onClick={() => handleVerification(verification._id, "reject")}
                      className="relative flex-1 py-3 px-4 bg-gradient-to-r from-red-700 to-rose-800 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-red-200 group overflow-hidden transition-all duration-300"
                    >
                      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                      <div className="flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current transition-transform group-hover:scale-110">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span className="font-semibold">Reject</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-xl"></div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Carte document stylée - Avec meilleur contraste
const DocCard = ({ title, url, verified }) => (
  <div className="flex flex-col items-center bg-gradient-to-b from-base-100 to-base-200 dark:from-neutral dark:to-neutral-focus rounded-xl shadow-md hover:shadow-lg p-3 min-w-[140px] max-w-[180px] border border-base-200 hover:border-primary transition-all duration-300 group">
    <h4 className="font-medium text-xs mb-2 text-center text-primary-focus dark:text-primary-content">{title}</h4>
    <div className="relative overflow-hidden rounded-lg border border-base-300 shadow mb-2">
      <img
        src={`http://localhost:8082/${url}`}
        alt={title}
        className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110"
        onClick={() => window.open(`http://localhost:8082/${url}`, '_blank')}
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity cursor-pointer"></div>
    </div>
    <div className={`badge ${verified ? "bg-green-700 text-white" : "bg-amber-700 text-white"} badge-sm gap-1`}>
      {verified ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-3 h-3 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
          Verified
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-3 h-3 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          Pending
        </>
      )}
    </div>
  </div>
);

export default AdminVerificationComponent;
