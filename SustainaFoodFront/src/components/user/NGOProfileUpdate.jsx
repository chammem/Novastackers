import React, { useEffect, useState, useRef } from "react";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiInstagram,
  FiTwitter,
  FiInfo,
  FiUpload,
  FiSave,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";

const NGOProfileUpdate = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    organizationName: "",
    email: "",
    phone: "",
    address: "",
    mission: "",
    description: "",
    website: "",
    instagram: "",
    twitter: "",
  });

  const [originalProfile, setOriginalProfile] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");
  const fileInputRef = useRef(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/user-details");
        const userData = res.data.data;

        setProfile({
          fullName: userData.fullName || "",
          organizationName: userData.organizationName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          mission: userData.mission || "",
          description: userData.description || "",
          website: userData.website || "",
          instagram: userData.instagram || "",
          twitter: userData.twitter || "",
        });

        setOriginalProfile(userData);

        if (userData.logoUrl) {
          setLogoPreview(`http://localhost:8082${userData.logoUrl}`);
        }
      } catch (error) {
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo image must be less than 2MB");
      return;
    }

    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // First update profile data
      await axiosInstance.patch("/ngo/update-profile", profile);

      // If logo was changed, upload it
      if (logo) {
        const formData = new FormData();
        formData.append("logo", logo);

        await axiosInstance.post("/ngo/upload-logo", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      toast.success("Profile updated successfully");

      // Refresh profile data
      const res = await axiosInstance.get("/user-details");
      setOriginalProfile(res.data.data);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (isLoading) {
    return (
      <>
        <HeaderMid />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh]"
        >
          <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
          <p className="text-base-content/70">Loading your profile...</p>
        </motion.div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeaderMid />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-green-50 to-green-50 py-12 px-4"
      >
        <div className="max-w-5xl mx-auto">
          {/* Profile header with gradient background */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 h-40 relative">
              {/* Animated floating bubbles for visual effect */}
              <div className="absolute w-20 h-20 rounded-full bg-white/10 top-5 left-10 animate-pulse"></div>
              <div
                className="absolute w-12 h-12 rounded-full bg-white/10 top-20 left-40 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute w-16 h-16 rounded-full bg-white/10 top-10 right-20 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>

              {/* Logo/Profile image */}
              <div className="absolute -bottom-16 left-10">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                  {logoPreview ? (
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={logoPreview}
                      alt="Organization Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-green-100 text-4xl font-bold text-green-700">
                      {profile.organizationName?.charAt(0) ||
                        profile.fullName?.charAt(0) ||
                        "?"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-20 pb-6 px-10">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {profile.organizationName || "Your Organization"}
                  </h1>
                  <p className="text-green-600 font-medium mt-1">
                    {profile.fullName || "Contact Person"}
                  </p>
                  <p className="text-gray-500 mt-2">
                    {profile.mission || "Your organization's mission statement"}
                  </p>
                </div>

                <div className="mt-4 md:mt-0">
                  <button
                    onClick={triggerFileInput}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    <FiUpload size={16} className="mr-2" />
                    Change Logo
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <div className="flex items-center text-gray-500 text-sm">
                  <FiMail className="mr-2" />{" "}
                  {profile.email || "email@example.com"}
                </div>
                {profile.phone && (
                  <div className="flex items-center text-gray-500 text-sm ml-4">
                    <FiPhone className="mr-2" /> {profile.phone}
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-center text-gray-500 text-sm ml-4">
                    <FiMapPin className="mr-2" /> {profile.address}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tab Selection */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              className={`py-3 px-5 font-medium ${
                activeSection === "basic"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveSection("basic")}
            >
              <FiUser className="inline mr-2" /> Basic Information
            </button>
            <button
              className={`py-3 px-5 font-medium ${
                activeSection === "details"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveSection("details")}
            >
              <FiInfo className="inline mr-2" /> Organization Details
            </button>
            <button
              className={`py-3 px-5 font-medium ${
                activeSection === "social"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveSection("social")}
            >
              <FiGlobe className="inline mr-2" /> Online Presence
            </button>
          </div>

          {/* Form Sections */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {activeSection === "basic" && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Organization Name
                        </label>
                        <input
                          type="text"
                          name="organizationName"
                          value={profile.organizationName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Your organization's name"
                        />
                      </div>

                      <div className="form-control">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Person Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={profile.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Full name of the contact person"
                        />
                      </div>

                      <div className="form-control">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="text-gray-500" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="contact@organization.org"
                          />
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiPhone className="text-gray-500" />
                          </div>
                          <input
                            type="text"
                            name="phone"
                            value={profile.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Your phone number"
                          />
                        </div>
                      </div>

                      <div className="form-control md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMapPin className="text-gray-500" />
                          </div>
                          <input
                            type="text"
                            name="address"
                            value={profile.address}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Organization address"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Organization Details
                    </h2>

                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mission Statement
                      </label>
                      <input
                        type="text"
                        name="mission"
                        value={profile.mission}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="A brief statement of your organization's mission"
                      />
                    </div>

                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={profile.description}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-32"
                        placeholder="Detailed description of your organization, its history, and its activities"
                      ></textarea>
                    </div>
                  </motion.div>
                )}

                {activeSection === "social" && (
                  <motion.div
                    key="social"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Online Presence
                    </h2>

                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiGlobe className="text-gray-500" />
                        </div>
                        <input
                          type="url"
                          name="website"
                          value={profile.website}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="https://yourorganization.org"
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instagram
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiInstagram className="text-gray-500" />
                        </div>
                        <input
                          type="url"
                          name="instagram"
                          value={profile.instagram}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="https://instagram.com/yourorganization"
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiTwitter className="text-gray-500" />
                        </div>
                        <input
                          type="url"
                          name="twitter"
                          value={profile.twitter}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="https://twitter.com/yourorganization"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FiX size={16} className="inline mr-2" /> Cancel
                </button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isSaving}
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={16} className="inline mr-2" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>

      <Footer />
    </>
  );
};

export default NGOProfileUpdate;
