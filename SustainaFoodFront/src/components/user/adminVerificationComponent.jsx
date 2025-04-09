import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";
import AdminNavbar from "../AdminNavbar";

const AdminVerificationComponent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [verifications, setVerifications] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingVerifications = async () => {
      try {
        const response = await axiosInstance.get('/pending-verification');
        setVerifications(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch verifications');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingVerifications();
  }, []);

  const handleVerification = async (id, status) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/verify/${id}`, { status });
      setMessage(response.data.message);
      
      setVerifications(prev => 
        prev.filter(verification => verification._id !== id)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update verification');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab="roles-verification"
      />
      
      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-20'}`}>
        {error && (
          <div className="alert alert-error m-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Pending Verifications</h1>
          
          {message && (
            <div className="alert alert-success mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{message}</span>
            </div>
          )}

          {verifications.length === 0 ? (
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>No pending verifications</span>
            </div>
          ) : (
            <div className="grid gap-6">
              {verifications.map((verification) => (
                <div key={verification._id} className="card bg-white shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">
                      {verification.userId?.fullName || 'N/A'}
                      <div className="badge badge-secondary">
                        {verification.userId?.role || 'N/A'}
                      </div>
                    </h2>
                    <p>{verification.userId?.email || 'N/A'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {verification.driverLicense && (
                        <DocumentPreview 
                          title="Driver License"
                          url={verification.driverLicense.url}
                          verified={verification.driverLicense.verified}
                        />
                      )}
                      
                      {verification.vehiculeRegistration && (
                        <DocumentPreview 
                          title="Vehicle Registration"
                          url={verification.vehiculeRegistration.url}
                          verified={verification.vehiculeRegistration.verified}
                        />
                      )}
                      
                      {verification.businessLicenseNumber && (
                        <DocumentPreview 
                          title="Business License"
                          url={verification.businessLicenseNumber.url}
                          verified={verification.businessLicenseNumber.verified}
                        />
                      )}
                      
                      {verification.taxId && (
                        <DocumentPreview 
                          title="Tax ID"
                          url={verification.taxId.url}
                          verified={verification.taxId.verified}
                        />
                      )}
                    </div>
                    
                    <div className="card-actions justify-end mt-4">
                      <button 
                        onClick={() => handleVerification(verification._id, 'approved')}
                        className="btn btn-success"
                        disabled={loading}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleVerification(verification._id, 'rejected')}
                        className="btn btn-error"
                        disabled={loading}
                      >
                        Reject
                      </button>
                    </div>
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

const DocumentPreview = ({ title, url, verified }) => (
  <div className="border rounded-lg p-4">
    <h3 className="font-bold flex items-center gap-2">
      {title}
      <span className={`badge ${verified ? 'badge-success' : 'badge-warning'}`}>
        {verified ? 'Verified' : 'Pending'}
      </span>
    </h3>
    <img 
      src={`http://localhost:8082/${url}`} 
      alt={title}
      className="mt-2 rounded-md w-full h-auto max-h-40 object-contain"
    />
  </div>
);

export default AdminVerificationComponent;