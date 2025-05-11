import React, { useEffect, useState, useRef } from "react";
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
  FiCamera,
  FiSettings,
  FiActivity,
  FiStar,
  FiHeart,
  FiSmile,
  FiCloud,
  FiThumbsUp,
  FiCalendar,
  FiEdit,
} from "react-icons/fi";
import AddressAutoComplete from "../AddressAutoComplete";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("updateProfile");
  const [submitting, setSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [joinDate, setJoinDate] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Replace userStats with actual activity data
  const [userActivity, setUserActivity] = useState([]);
  const [donationsData, setDonationsData] = useState([]);
  const [foodDonations, setFoodDonations] = useState([]);
  const [donationCount, setDonationCount] = useState(0);

  // Remove impact animation states
  // const impact = useMotionValue(0);
  // const impactProgress = useTransform(impact, [0, 100], [0, 100]);

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
        // Fetch basic user profile data
        const response = await axiosInstance.get("/user-details");
        if (response.data?.data) {
          const userData = response.data.data;
          setUser(userData);
          
          // Set form values
          setValueProfile("fullName", userData.fullName);
          setValueProfile("email", userData.email);
          setValueProfile("phoneNumber", userData.phoneNumber);
          setValueProfile("address", userData.address);

          setSelectedAddress(userData.address || "");
          setCoordinates({
            lat: userData.lat || null,
            lng: userData.lng || null,
          });

          // Set allergies and preferences
          setValueAllergiesPreferences("allergies", userData.allergies || "");
          setValueAllergiesPreferences("preferences", userData.preferences || "");

          // Set join date
          if (userData.createdAt) {
            setJoinDate(new Date(userData.createdAt));
          }
          
          // Set profile image if exists
          if (userData.profileImage) {
            setPreviewImage(`${process.env.REACT_APP_API_URL || 'http://localhost:8082'}/${userData.profileImage}`);
          }
          
          // Calculate recent activity based on user's updatedAt
          if (userData.updatedAt) {
            const recentActivity = [{
              id: 'profile-update',
              type: 'update',
              title: 'Profile updated',
              date: new Date(userData.updatedAt)
            }];
            setUserActivity(recentActivity);
          }
          
          // Fetch data based on user role but only keep what's real
          try {
            if (userData.role === "charity") {
              // Only get real campaign data
              const campaignsResponse = await axiosInstance.get(`/donations/ngo-campaigns/${userData._id}`);
              if (campaignsResponse.data) {
                const campaigns = Array.isArray(campaignsResponse.data) 
                  ? campaignsResponse.data 
                  : [];
                
                setFoodDonations(campaigns);
                
                // Count actual foods
                let totalFoods = 0;
                
                campaigns.forEach(campaign => {
                  if (campaign.foods && Array.isArray(campaign.foods)) {
                    totalFoods += campaign.foods.length;
                  }
                  
                  // Add to recent activity
                  if (campaign.createdAt) {
                    userActivity.push({
                      id: campaign._id,
                      type: 'campaign',
                      title: `Campaign "${campaign.name}" created`,
                      date: new Date(campaign.createdAt)
                    });
                  }
                });
                
                setDonationCount(totalFoods);
              }
            } else if (userData.role === "volunteer") {
              // Just get assignment count
              const assignmentsResponse = await axiosInstance.get(`/donations/volunteer-assignments/${userData._id}`);
              if (assignmentsResponse.data) {
                const assignments = Array.isArray(assignmentsResponse.data) 
                  ? assignmentsResponse.data 
                  : [];
                
                setDonationCount(assignments.length);
                
                // Add actual assignments to activity
                assignments.forEach(assignment => {
                  if (assignment.created_at || assignment.createdAt) {
                    userActivity.push({
                      id: assignment._id,
                      type: assignment.status || 'assigned',
                      title: `${assignment.name || 'Food'} ${assignment.status || 'assigned'}`,
                      date: new Date(assignment.created_at || assignment.createdAt)
                    });
                  }
                });
              }
            } else if (userData.role === "restaurant" || userData.role === "supermarket") {
              // Get actual donation count
              const donationsResponse = await axiosInstance.get(`/donations/business-donations/${userData._id}`);
              if (donationsResponse.data) {
                const donations = Array.isArray(donationsResponse.data)
                  ? donationsResponse.data
                  : [];
                
                setDonationCount(donations.length);
                
                // Add real donation activities
                donations.forEach(donation => {
                  if (donation.created_at || donation.createdAt) {
                    userActivity.push({
                      id: donation._id,
                      type: donation.status || 'donated',
                      title: `${donation.name || 'Food item'} donated`,
                      date: new Date(donation.created_at || donation.createdAt)
                    });
                  }
                });
              }
            }
            
            // Sort activities by date (most recent first) and limit to 3
            userActivity.sort((a, b) => b.date - a.date);
            setUserActivity(userActivity.slice(0, 3));
            
          } catch (dataError) {
            console.error("Error fetching role-specific data:", dataError);
          }
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

  // Remove the useEffect for animating impact score

  // Profile image handler - optimized for backend storage
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file is too large. Maximum size is 5MB.");
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload a JPG, PNG, GIF or WebP image.");
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update with proper FormData for image upload
  const onSubmitProfile = async (data) => {
    if (!user?._id) return;
    setSubmitting(true);
    setUpdateSuccess(false);

    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      
      // Append address and coordinates
      if (coordinates.lat && coordinates.lng) {
        formData.append('lat', coordinates.lat);
        formData.append('lng', coordinates.lng);
      }
      
      if (selectedAddress || data.address) {
        formData.append('address', selectedAddress || data.address);
      }
      
      // Append profile image if selected
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      console.log("Submitting profile update");
      
      const response = await axiosInstance.put(
        `/update-profile/${user._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update user data with the response data
      if (response.data && response.data.data) {
        setUser(response.data.data);
        
        // Update preview image with the new image path from server
        if (response.data.data.profileImage && !response.data.data.profileImage.startsWith('data:')) {
          setPreviewImage(`${process.env.REACT_APP_API_URL || 'http://localhost:8082'}/${response.data.data.profileImage}`);
        }
      }
      
      setUpdateSuccess(true);
      
      // Show success toast
      toast.success("Profile updated successfully!", {
        position: "top-right",
        icon: "🎉",
        style: {
          borderRadius: '10px',
          background: '#4CAF50',
          color: '#fff',
        },
      });

      // Reset success state after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
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

  // Handle allergies and preferences submission
  const onSubmitAllergiesPreferences = async (data) => {
    if (!user?._id) return;
    setSubmitting(true);
    
    try {
      const response = await axiosInstance.put(
        `/update-profile/${user._id}`,
        data
      );
      
      setUser(response.data.data);
      setUpdateSuccess(true);
      toast.success("Preferences updated successfully!");
      
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error(error.response?.data?.message || "Failed to update preferences.");
    } finally {
      setSubmitting(false);
    }
  };

  // Add a function to render user activity items from real data
  const renderActivityItems = () => {
    if (!userActivity || userActivity.length === 0) {
      return (
        <div className="flex items-center justify-center py-4">
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      );
    }

    return userActivity.map((activity, index) => {
      // Determine icon and color based on activity type
      let icon = <FiThumbsUp />;
      let bgColor = "bg-green-100";
      let textColor = "text-green-600";
      
      if (activity.type === "delivered" || activity.type === "completed") {
        icon = <FiHeart />;
        bgColor = "bg-green-100";
        textColor = "text-green-600";
      } else if (activity.type === "pending" || activity.type === "assigned" || activity.type === "campaign") {
        icon = <FiStar />;
        bgColor = "bg-green-100";
        textColor = "text-green-600";
      } else if (activity.type === "update") {
        icon = <FiEdit />;
        bgColor = "bg-green-100";
        textColor = "text-green-600";
      }
      
      // Format date as relative time if less than 7 days ago, otherwise as date
      const now = new Date();
      const activityDate = new Date(activity.date);
      const diffDays = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));
      
      let dateDisplay;
      if (diffDays < 1) {
        dateDisplay = "Today";
      } else if (diffDays === 1) {
        dateDisplay = "Yesterday";
      } else if (diffDays < 7) {
        dateDisplay = `${diffDays} days ago`;
      } else {
        dateDisplay = activityDate.toLocaleDateString();
      }
      
      return (
        <div key={activity.id || index} className="flex items-start gap-3">
          <div className={`${bgColor} rounded-full p-2`}>
            <div className={textColor}>{icon}</div>
          </div>
          <div>
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-xs text-gray-500">{dateDisplay}</p>
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-50 via-blue-50 to-purple-50">
        <div className="card shadow-lg p-8 bg-white/90 backdrop-blur-md rounded-2xl">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-t-4 border-green-500 animate-spin"></div>
              <div className="absolute inset-3 rounded-full bg-green-100 flex items-center justify-center">
                <FiUser className="text-green-600" />
              </div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-700">Preparing your profile...</p>
            <p className="text-sm text-gray-500 mt-2">This will only take a moment</p>
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
        className="min-h-screen bg-gradient-to-b from-green-50 to-green-50 py-12 px-4"
      >
        <div className="max-w-5xl mx-auto">
          {/* Top profile summary card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 h-40 relative">
              {/* Animated floating bubbles for visual effect */}
              <div className="absolute w-20 h-20 rounded-full bg-white/10 top-5 left-10 animate-pulse"></div>
              <div className="absolute w-12 h-12 rounded-full bg-white/10 top-20 left-40 animate-pulse" style={{ animationDelay: "1s" }}></div>
              <div className="absolute w-16 h-16 rounded-full bg-white/10 top-10 right-20 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
            </div>
            
            <div className="flex flex-col md:flex-row px-6 py-6 relative">
              {/* Profile picture with upload capability */}
              <div className="absolute -top-20 left-10 md:left-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-white shadow-lg">
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200 text-green-600">
                        <span className="text-5xl font-bold">
                          {user?.fullName?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current.click()} 
                    className="absolute bottom-0 right-0 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiCamera size={18} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* User info */}
              <div className="mt-14 md:mt-0 md:ml-40">
                <h1 className="text-3xl font-bold text-gray-800">{user?.fullName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    {user?.role}
                  </span>
                  {user?.active ? (
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                      <FiCheckCircle className="mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                      <FiAlertCircle className="mr-1" /> Pending Verification
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-2 flex items-center">
                  <FiCalendar className="mr-2" />
                  Joined: {joinDate ? joinDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Unknown'}
                </p>
              </div>
              
              {/* Remove the Stats summary section with all metrics */}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tabs and main content */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="card bg-white shadow-xl overflow-hidden rounded-2xl"
              >
                {/* Tabs */}
                <div className="px-6 pt-6">
                  <div className="tabs">
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
                    <button
                      className={`tab tab-lifted text-lg font-medium ${
                        activeTab === "preferences" ? "tab-active" : ""
                      }`}
                      onClick={() => setActiveTab("preferences")}
                    >
                      <FiSettings className="mr-2" /> Preferences
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
                              <AddressAutoComplete
                                initialValue={selectedAddress} // Pass the initial value
                                onSelect={(place) => {
                                  const address = place.display_name;
                                  setSelectedAddress(address);
                                  // This is important - manually update the form value
                                  setValueProfile("address", address);
                                  setCoordinates({
                                    lat: parseFloat(place.lat),
                                    lng: parseFloat(place.lon),
                                  });
                                }}
                              />
                              {/* Use defaultValue instead of value to avoid React controlled component warnings */}
                              <input
                                type="hidden"
                                {...registerProfile("address", {
                                  required: "Address is required",
                                  minLength: {
                                    value: 5,
                                    message: "Address must be at least 5 characters",
                                  },
                                })}
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
                                className="bg-green-500 h-2.5 rounded-full"
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

                    {activeTab === "preferences" && (
                      <motion.div
                        key="preferences"
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
                            Set your preferences and dietary restrictions to personalize your experience.
                          </span>
                        </div>

                        <form
                          onSubmit={handleSubmitAllergiesPreferences(onSubmitAllergiesPreferences)}
                          className="space-y-6"
                        >
                          <div className="divider">Dietary Information</div>

                          {/* Allergies */}
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">
                                Allergies & Restrictions
                              </span>
                            </label>
                            <textarea
                              {...registerAllergiesPreferences("allergies")}
                              className="textarea textarea-bordered h-24 focus:textarea-primary transition-all duration-300"
                              placeholder="Enter any food allergies or dietary restrictions (e.g., peanuts, gluten, dairy)"
                            ></textarea>
                          </div>

                          {/* Preferences */}
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">
                                Food Preferences
                              </span>
                            </label>
                            <textarea
                              {...registerAllergiesPreferences("preferences")}
                              className="textarea textarea-bordered h-24 focus:textarea-primary transition-all duration-300"
                              placeholder="Enter your food preferences (e.g., vegetarian, vegan, pescatarian)"
                            ></textarea>
                          </div>

                          {/* Notification preferences */}
                          <div className="divider">Notification Preferences</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                              <label className="label cursor-pointer justify-start gap-3">
                                <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
                                <span className="label-text">Email notifications</span>
                              </label>
                            </div>
                            <div className="form-control">
                              <label className="label cursor-pointer justify-start gap-3">
                                <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
                                <span className="label-text">Campaign updates</span>
                              </label>
                            </div>
                            <div className="form-control">
                              <label className="label cursor-pointer justify-start gap-3">
                                <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
                                <span className="label-text">Donation confirmations</span>
                              </label>
                            </div>
                            <div className="form-control">
                              <label className="label cursor-pointer justify-start gap-3">
                                <input type="checkbox" className="checkbox checkbox-primary" defaultChecked />
                                <span className="label-text">Weekly digest</span>
                              </label>
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
                                  <FiSave className="mr-2" /> Save Preferences
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
                                  <FiCheckCircle className="mr-2" /> Preferences
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

            {/* Side panel with stats, achievements, etc. */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-1 space-y-6"
            >
              {/* Remove the Impact Dashboard section */}
              
              {/* Keep the Recent activity section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FiActivity className="mr-2 text-green-500" /> Recent Activity
                </h3>
                <div className="space-y-4">
                  {renderActivityItems()}
                </div>
              </div>
              
              {/* Account Status - focused on real data */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FiUser className="mr-2 text-green-500" /> Account Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FiUser className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Account Type</p>
                      <p className="text-xs text-gray-600">
                        {user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}
                      </p>
                    </div>
                  </div>
                  
                  {donationCount > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <FiStar className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {user?.role === "volunteer" ? "Assignments" : 
                           user?.role === "charity" ? "Foods in Campaigns" : "Donations"}
                        </p>
                        <p className="text-xs text-gray-600">{donationCount}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <FiCalendar className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-xs text-gray-600">
                        {joinDate ? joinDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Profile;
