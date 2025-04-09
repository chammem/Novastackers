import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import HeaderMid from "../HeaderMid";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("updateProfile");
  const [password, setPassword] = useState(""); // Ajout de l'état pour gérer le mot de passe

  // States for managing password visibility
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setValueProfile,
    formState: { errors: profileErrors },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    getValues,
  } = useForm();

  const {
    register: registerAllergiesPreferences,
    handleSubmit: handleSubmitAllergiesPreferences,
    setValue: setValueAllergiesPreferences,
    formState: { errors: allergiesPreferencesErrors },
  } = useForm();

  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  const handleShowModal = (action) => {
    setModalAction(action);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleConfirmAction = () => {
    if (modalAction === 'updateProfile') {
      handleSubmitProfile(onSubmitProfile)();
    } else if (modalAction === 'changePassword') {
      handleSubmitPassword(onSubmitPassword)();
    }
    handleCloseModal();
  };

  const onSubmitProfile = async (data) => {
    try {
      const response = await axiosInstance.put(`/update-profile/${user._id}`, data);
      toast.success("Profile updated successfully!");
      setUser(response.data.data);
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  const onSubmitPassword = async (data) => {
    console.log("Data sent to backend:", data);
    // Vérifie ici que data.currentPassword et data.newPassword existent
  
    try {
      await axiosInstance.put(`/change-password/${user._id}`, data);
      toast.success("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };
  

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get("/user-details");
        if (response.data?.data) {
          setUser(response.data.data);
          setValueProfile("fullName", response.data.data.fullName);
          setValueProfile("email", response.data.data.email);
          setValueProfile("phoneNumber", response.data.data.phoneNumber);
          setValueProfile("address", response.data.data.address);
          setValueAllergiesPreferences("allergies", response.data.data.allergies || "");
          setValueAllergiesPreferences("preferences", response.data.data.preferences || "");
        }
      } catch (error) {
        toast.error("Failed to fetch user details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [setValueProfile, setValueAllergiesPreferences]);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  
  return (
    <>
      <HeaderMid />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10">
        <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Profile Settings</h1>
  
        {/* Tabs */}
        <div className="tabs tabs-boxed mb-8">
          <button
            className={`tab ${activeTab === "updateProfile" ? "tab-active" : ""} text-lg font-medium text-gray-700`}
            onClick={() => setActiveTab("updateProfile")}
          >
            Update Profile
          </button>
          <button
            className={`tab ${activeTab === "changePassword" ? "tab-active" : ""} text-lg font-medium text-gray-700`}
            onClick={() => setActiveTab("changePassword")}
          >
            Change Password
          </button>
        </div>
  
        {/* Update Profile Form */}
        {activeTab === "updateProfile" && (
          <form onSubmit={(e) => { e.preventDefault(); handleShowModal('updateProfile'); }} className="space-y-6">
            {/* Full Name */}
            <div className="form-control">
              <label className="label text-sm font-semibold text-gray-600">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                {...registerProfile("fullName", { required: "Full Name is required" })}
                className="input input-bordered w-full text-lg p-3 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
              {profileErrors.fullName && (
                <p className="text-sm text-red-500">{profileErrors.fullName.message}</p>
              )}
            </div>
  
            {/* Email */}
            <div className="form-control">
              <label className="label text-sm font-semibold text-gray-600">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                {...registerProfile("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="input input-bordered w-full text-lg p-3 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
              {profileErrors.email && (
                <p className="text-sm text-red-500">{profileErrors.email.message}</p>
              )}
            </div>
  
            {/* Phone Number */}
            <div className="form-control">
              <label className="label text-sm font-semibold text-gray-600">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                type="text"
                {...registerProfile("phoneNumber", {
                  required: "Phone Number is required",
                  pattern: {
                    value: /^\d+$/,
                    message: "Phone number must be numeric",
                  },
                  minLength: {
                    value: 8,
                    message: "Phone number must be at least 8 digits",
                  },
                  maxLength: {
                    value: 15,
                    message: "Phone number must be at most 15 digits",
                  },
                })}
                className="input input-bordered w-full text-lg p-3 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
              {profileErrors.phoneNumber && (
                <p className="text-sm text-red-500">{profileErrors.phoneNumber.message}</p>
              )}
            </div>
  
            {/* Address */}
            <div className="form-control">
              <label className="label text-sm font-semibold text-gray-600">
                <span className="label-text">Address</span>
              </label>
              <input
                type="text"
                {...registerProfile("address", {
                  required: "Address is required",
                  minLength: {
                    value: 5,
                    message: "Address must be at least 5 characters",
                  },
                })}
                className="input input-bordered w-full text-lg p-3 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your address"
              />
              {profileErrors.address && (
                <p className="text-sm text-red-500">{profileErrors.address.message}</p>
              )}
            </div>
  
            {/* Submit Button */}
            <div className="form-control mt-8">
              <button
                type="submit"
                className="btn btn-primary w-full py-3 text-lg font-semibold rounded-md hover:bg-blue-600 transition-all"
              >
                Update Profile
              </button>
            </div>
          </form>
        )}
  
        {/* Change Password Form */}
        {/* Change Password Form */}
        {activeTab === "changePassword" && (
          <form onSubmit={(e) => { e.preventDefault(); handleShowModal('changePassword'); }} className="space-y-6">
          
      {/* Current Password */}
      <div className="form-control">
        <label className="label text-sm font-semibold text-gray-600">
          <span className="label-text">Current Password</span>
        </label>
        <div className="relative">
          <input
            type={showPassword.currentPassword ? "text" : "password"}
            {...registerPassword("currentPassword", {
              required: "Current Password is required",
            })}
            className="input input-bordered w-full text-lg p-3 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your current password"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("currentPassword")}
            className="absolute right-3 top-3 text-gray-500"
          >
            {showPassword.currentPassword ? (
              <EyeOffIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        {passwordErrors.currentPassword && (
          <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
        )}
      </div>

{/* New Password */}
<div className="form-control">
  <label className="label text-sm font-semibold text-gray-600">
    <span className="label-text">New Password</span>
  </label>
  <div className="relative">
    <input
      type={showPassword.newPassword ? "text" : "password"}
      {...registerPassword("newPassword", {
        required: "New Password is required",
      })}
      className="input input-bordered w-full text-lg p-3 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter your new password"
    />
    <button
      type="button"
      onClick={() => togglePasswordVisibility("newPassword")}
      className="absolute right-3 top-3"
    >
      {showPassword.newPassword ? (
        <EyeOffIcon className="h-5 w-5 text-gray-500" />
      ) : (
        <EyeIcon className="h-5 w-5 text-gray-500" />
      )}
    </button>
  </div>
  {passwordErrors.newPassword && (
    <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
  )}
</div>

{/* Confirm New Password */}
<div className="form-control">
  <label className="label text-sm font-semibold text-gray-600">
    <span className="label-text">Confirm New Password</span>
  </label>
  <div className="relative">
  <input
  type={showPassword.confirmNewPassword ? "text" : "password"}
  {...registerPassword("confirmNewPassword", {
    required: "Please confirm your new password",
    validate: (value) =>
      value === getValues("newPassword") || "Passwords do not match",
  })}
  className="input input-bordered w-full text-lg p-3 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Confirm your new password"
/>

    <button
      type="button"
      onClick={() => togglePasswordVisibility("confirmNewPassword")}
      className="absolute right-3 top-3 text-gray-500"
    >
      {showPassword.confirmNewPassword ? (
        <EyeOffIcon className="h-5 w-5 text-gray-500" />
      ) : (
        <EyeIcon className="h-5 w-5 text-gray-500" />
      )}
    </button>
  </div>
  {passwordErrors.confirmNewPassword && (
    <p className="text-sm text-red-500">{passwordErrors.confirmNewPassword.message}</p>
  )}
</div>


            {/* Submit Button */}
            <div className="form-control mt-8">
            <button
              type="submit"
              className="btn btn-primary w-full py-3 text-lg font-semibold rounded-md hover:bg-blue-600 transition-all"
            >
              Change Password
            </button>

      </div>
    </form>
        )}
      </div>
     {/* Modal for Confirmation */}
     {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
            <p className="mb-6">Please confirm your action before proceeding.</p>
            <div className="flex justify-end space-x-4">
              <button onClick={handleCloseModal} className="btn btn-outline btn-secondary">Cancel</button>
              <button onClick={handleConfirmAction} className="btn btn-primary">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;