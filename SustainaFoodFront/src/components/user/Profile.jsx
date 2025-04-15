import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import HeaderMid from "../HeaderMid";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiLock,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("updateProfile");
  const [submitting, setSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
    reset: resetPassword,
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
          setValueProfile("fullName", response.data.data.fullName);
          setValueProfile("email", response.data.data.email);
          setValueProfile("phoneNumber", response.data.data.phoneNumber);
          setValueProfile("address", response.data.data.address);
          setValueAllergiesPreferences(
            "allergies",
            response.data.data.allergies || ""
          );
          setValueAllergiesPreferences(
            "preferences",
            response.data.data.preferences || ""
          );
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch user details."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [setValueProfile, setValueAllergiesPreferences]);

  // Handle profile update
  const onSubmitProfile = async (data) => {
    if (!user?._id) return;
    setSubmitting(true);
    setUpdateSuccess(false);

    try {
      const response = await axiosInstance.put(
        `/update-profile/${user._id}`,
        data
      );
      setUser(response.data.data);
      setUpdateSuccess(true);
      toast.success("Profile updated successfully!");

      // Reset success state after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle password change
  const onSubmitPassword = async (data) => {
    if (!user?._id) return;
    setSubmitting(true);

    try {
      await axiosInstance.put(`/change-password/${user._id}`, data);
      toast.success("Password changed successfully!");
      resetPassword();
      setUpdateSuccess(true);

      // Reset success state after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card shadow-lg p-8 bg-base-100">
          <div className="flex flex-col items-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-lg font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeaderMid />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-base-200 py-12 px-4"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="card bg-base-100 shadow-xl overflow-hidden"
          >
            {/* Card header */}
            <div className="bg-primary text-primary-content p-6">
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="opacity-80 mt-2">
                Manage your account information and preferences
              </p>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-6">
              <div className="tabs tabs-lifted">
                <button
                  className={`tab tab-lifted text-lg font-medium ${
                    activeTab === "updateProfile" ? "tab-active" : ""
                  }`}
                  onClick={() => setActiveTab("updateProfile")}
                >
                  <FiUser className="mr-2" /> Profile
                </button>
                <button
                  className={`tab tab-lifted text-lg font-medium ${
                    activeTab === "changePassword" ? "tab-active" : ""
                  }`}
                  onClick={() => setActiveTab("changePassword")}
                >
                  <FiLock className="mr-2" /> Security
                </button>
              </div>
            </div>

            {/* Card body with forms */}
            <div className="card-body pt-4">
              <AnimatePresence mode="wait">
                {activeTab === "updateProfile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form
                      onSubmit={handleSubmitProfile(onSubmitProfile)}
                      className="space-y-6"
                    >
                      {/* Profile avatar and name */}
                      <div className="flex flex-col items-center mb-6">
                        <div className="avatar placeholder mb-4">
                          <div className="bg-primary text-primary-content rounded-full w-24 h-24">
                            <span className="text-3xl">
                              {user?.fullName?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                        </div>
                        <h2 className="text-2xl font-semibold">
                          {user?.fullName}
                        </h2>
                        <div className="badge badge-outline mt-2">
                          {user?.role || "User"}
                        </div>
                      </div>

                      <div className="divider">Personal Information</div>

                      {/* Grid layout for form fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              Full Name
                            </span>
                          </label>
                          <input
                            type="text"
                            {...registerProfile("fullName", {
                              required: "Full Name is required",
                            })}
                            className="input input-bordered w-full focus:input-primary transition-all duration-300"
                            placeholder="Enter your full name"
                          />
                          {profileErrors.fullName && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-error mt-1 flex items-center"
                            >
                              <FiAlertCircle className="mr-1" />{" "}
                              {profileErrors.fullName.message}
                            </motion.p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              Email
                            </span>
                          </label>
                          <input
                            type="email"
                            {...registerProfile("email", {
                              required: "Email is required",
                              pattern: {
                                value:
                                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address",
                              },
                            })}
                            className="input input-bordered w-full focus:input-primary transition-all duration-300"
                            placeholder="Enter your email"
                          />
                          {profileErrors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-error mt-1 flex items-center"
                            >
                              <FiAlertCircle className="mr-1" />{" "}
                              {profileErrors.email.message}
                            </motion.p>
                          )}
                        </div>

                        {/* Phone Number */}
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              Phone Number
                            </span>
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
                                message:
                                  "Phone number must be at least 8 digits",
                              },
                            })}
                            className="input input-bordered w-full focus:input-primary transition-all duration-300"
                            placeholder="Enter your phone number"
                          />
                          {profileErrors.phoneNumber && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-error mt-1 flex items-center"
                            >
                              <FiAlertCircle className="mr-1" />{" "}
                              {profileErrors.phoneNumber.message}
                            </motion.p>
                          )}
                        </div>

                        {/* Address */}
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              Address
                            </span>
                          </label>
                          <input
                            type="text"
                            {...registerProfile("address", {
                              required: "Address is required",
                              minLength: {
                                value: 5,
                                message:
                                  "Address must be at least 5 characters",
                              },
                            })}
                            className="input input-bordered w-full focus:input-primary transition-all duration-300"
                            placeholder="Enter your address"
                          />
                          {profileErrors.address && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-error mt-1 flex items-center"
                            >
                              <FiAlertCircle className="mr-1" />{" "}
                              {profileErrors.address.message}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="mt-8 flex items-center justify-between">
                        <motion.button
                          type="submit"
                          className="btn btn-primary"
                          disabled={submitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {submitting ? (
                            <>
                              <span className="loading loading-spinner loading-xs mr-2"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <FiSave className="mr-2" /> Save Changes
                            </>
                          )}
                        </motion.button>

                        {/* Success indicator */}
                        <AnimatePresence>
                          {updateSuccess && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center text-success"
                            >
                              <FiCheckCircle className="mr-2" /> Saved
                              successfully
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </form>
                  </motion.div>
                )}

                {activeTab === "changePassword" && (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="alert alert-info mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="stroke-current shrink-0 w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>
                        Keep your account secure with a strong password that you
                        don't use elsewhere.
                      </span>
                    </div>

                    <form
                      onSubmit={handleSubmitPassword(onSubmitPassword)}
                      className="space-y-6"
                    >
                      {/* Current Password */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">
                            Current Password
                          </span>
                        </label>
                        <input
                          type="password"
                          {...registerPassword("currentPassword", {
                            required: "Current Password is required",
                          })}
                          className="input input-bordered w-full focus:input-primary transition-all duration-300"
                          placeholder="Enter your current password"
                        />
                        {passwordErrors.currentPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-error mt-1 flex items-center"
                          >
                            <FiAlertCircle className="mr-1" />{" "}
                            {passwordErrors.currentPassword.message}
                          </motion.p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* New Password */}
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              New Password
                            </span>
                          </label>
                          <input
                            type="password"
                            {...registerPassword("newPassword", {
                              required: "New Password is required",
                              minLength: {
                                value: 8,
                                message:
                                  "Password must be at least 8 characters",
                              },
                            })}
                            className="input input-bordered w-full focus:input-primary transition-all duration-300"
                            placeholder="Enter your new password"
                          />
                          {passwordErrors.newPassword && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-error mt-1 flex items-center"
                            >
                              <FiAlertCircle className="mr-1" />{" "}
                              {passwordErrors.newPassword.message}
                            </motion.p>
                          )}
                        </div>

                        {/* Confirm New Password */}
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              Confirm New Password
                            </span>
                          </label>
                          <input
                            type="password"
                            {...registerPassword("confirmNewPassword", {
                              required: "Please confirm your new password",
                              validate: (value) =>
                                value === getValues("newPassword") ||
                                "Passwords do not match",
                            })}
                            className="input input-bordered w-full focus:input-primary transition-all duration-300"
                            placeholder="Confirm your new password"
                          />
                          {passwordErrors.confirmNewPassword && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-error mt-1 flex items-center"
                            >
                              <FiAlertCircle className="mr-1" />{" "}
                              {passwordErrors.confirmNewPassword.message}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      {/* Password strength indicator (for visual enhancement) */}
                      <div className="mt-2">
                        <label className="label">
                          <span className="label-text font-medium">
                            Password Strength
                          </span>
                        </label>
                        <div className="w-full bg-base-200 rounded-full h-2.5">
                          <div
                            className="bg-success h-2.5 rounded-full"
                            style={{ width: "70%" }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1 text-base-content/70">
                          Strong passwords include uppercase, lowercase,
                          numbers, and symbols
                        </p>
                      </div>

                      {/* Submit Button */}
                      <div className="mt-8 flex items-center justify-between">
                        <motion.button
                          type="submit"
                          className="btn btn-primary"
                          disabled={submitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {submitting ? (
                            <>
                              <span className="loading loading-spinner loading-xs mr-2"></span>
                              Updating...
                            </>
                          ) : (
                            <>
                              <FiLock className="mr-2" /> Change Password
                            </>
                          )}
                        </motion.button>

                        {/* Success indicator */}
                        <AnimatePresence>
                          {updateSuccess && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center text-success"
                            >
                              <FiCheckCircle className="mr-2" /> Password
                              updated
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Profile;
