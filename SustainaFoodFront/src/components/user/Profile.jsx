import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import HeaderMid from "../HeaderMid";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("updateProfile"); // State for active tab

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

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get("/user-details");
        if (response.data?.data) {
          setUser(response.data.data);
          // Set form values only if data exists
          setValueProfile("fullName", response.data.data.fullName);
          setValueProfile("email", response.data.data.email);
          setValueProfile("phoneNumber", response.data.data.phoneNumber);
          setValueProfile("address", response.data.data.address);
          setValueAllergiesPreferences("allergies", response.data.data.allergies || "");
          setValueAllergiesPreferences("preferences", response.data.data.preferences || "");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error(error.response?.data?.message || "Failed to fetch user details.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserDetails();
  }, [setValueProfile, setValueAllergiesPreferences]);

  // Handle profile update
  const onSubmitProfile = async (data) => {
    try {
      const response = await axiosInstance.put(`/update-profile/${user._id}`, data);
      toast.success("Profile updated successfully!");
      setUser(response.data.data);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  // Handle password change
  const onSubmitPassword = async (data) => {
    try {
      if (!user?._id) { // Add null check
        throw new Error("User information not available");
      }
      
      await axiosInstance.put(`/change-password/${user._id}`, data);
      toast.success("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Handle allergies and preferences update
  const onSubmitAllergiesPreferences = async (data) => {
    try {
      const response = await axiosInstance.put(`/update-allergies-preferences/${user._id}`, data);
      toast.success("Allergies and preferences updated successfully!");
      setUser(response.data.data);
    } catch (error) {
      console.error("Error updating allergies and preferences:", error);
      toast.error("Failed to update allergies and preferences.");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <HeaderMid />
      <div className="max-w-4xl mx-auto p-6 bg-base-100 shadow-md rounded-lg mt-10">
        <h1 className="text-3xl font-bold text-center mb-6">Profile Settings</h1>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab ${activeTab === "updateProfile" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("updateProfile")}
          >
            Update Profile
          </button>
          <button
            className={`tab ${activeTab === "changePassword" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("changePassword")}
          >
            Change Password
          </button>
          {user?.role === "user" && (
    <button
      className={`tab ${activeTab === "allergiesPreferences" ? "tab-active" : ""}`}
      onClick={() => setActiveTab("allergiesPreferences")}
    >
      Allergies & Preferences
    </button>
  )}
        </div>

        {/* Update Profile Form */}
        {activeTab === "updateProfile" && (
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
            {/* Full Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                {...registerProfile("fullName", { required: "Full Name is required" })}
                className="input input-bordered w-full"
                placeholder="Enter your full name"
              />
              {profileErrors.fullName && (
                <p className="text-sm text-error">{profileErrors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
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
                className="input input-bordered w-full"
                placeholder="Enter your email"
              />
              {profileErrors.email && (
                <p className="text-sm text-error">{profileErrors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="form-control">
              <label className="label">
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
                className="input input-bordered w-full"
                placeholder="Enter your phone number"
              />
              {profileErrors.phoneNumber && (
                <p className="text-sm text-error">{profileErrors.phoneNumber.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="form-control">
              <label className="label">
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
                className="input input-bordered w-full"
                placeholder="Enter your address"
              />
              {profileErrors.address && (
                <p className="text-sm text-error">{profileErrors.address.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control mt-8">
              <button type="submit" className="btn btn-primary w-full">
                Update Profile
              </button>
            </div>
          </form>
        )}

        {/* Change Password Form */}
        {activeTab === "changePassword" && (
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
            {/* Current Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Current Password</span>
              </label>
              <input
                type="password"
                {...registerPassword("currentPassword", {
                  required: "Current Password is required",
                })}
                className="input input-bordered w-full"
                placeholder="Enter your current password"
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-error">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            {/* New Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <input
                type="password"
                {...registerPassword("newPassword", {
                  required: "New Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                className="input input-bordered w-full"
                placeholder="Enter your new password"
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-error">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm New Password</span>
              </label>
              <input
                type="password"
                {...registerPassword("confirmNewPassword", {
                  required: "Please confirm your new password",
                  validate: (value) =>
                    value === getValues("newPassword") || "Passwords do not match",
                })}
                className="input input-bordered w-full"
                placeholder="Confirm your new password"
              />
              {passwordErrors.confirmNewPassword && (
                <p className="text-sm text-error">{passwordErrors.confirmNewPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control mt-8">
              <button type="submit" className="btn btn-primary w-full">
                Change Password
              </button>
            </div>
          </form>
        )}

        {/* Allergies & Preferences Form */}
        {activeTab === "allergiesPreferences" && (
          <form onSubmit={handleSubmitAllergiesPreferences(onSubmitAllergiesPreferences)} className="space-y-6">
            {/* Allergies */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Allergies</span>
              </label>
              <input
                type="text"
                {...registerAllergiesPreferences("allergies")}
                className="input input-bordered w-full"
                placeholder="Enter your allergies"
              />
              {allergiesPreferencesErrors.allergies && (
                <p className="text-sm text-error">{allergiesPreferencesErrors.allergies.message}</p>
              )}
            </div>

            {/* Preferences */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Preferences</span>
              </label>
              <input
                type="text"
                {...registerAllergiesPreferences("preferences")}
                className="input input-bordered w-full"
                placeholder="Enter your preferences"
              />
              {allergiesPreferencesErrors.preferences && (
                <p className="text-sm text-error">{allergiesPreferencesErrors.preferences.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control mt-8">
              <button type="submit" className="btn btn-primary w-full">
                Update Allergies & Preferences
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default Profile;