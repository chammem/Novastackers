import React, { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import HeaderMid from "./HeaderMid";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiSave,
  FiLink,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiEdit,
  FiUser,
} from "react-icons/fi";

const validationSchema = Yup.object().shape({
  mission: Yup.string().required("Mission is required"),
  description: Yup.string().required("Description is required"),
  website: Yup.string()
    .url("Enter a valid URL")
    .matches(/^https?:\/\/.*$/, "URL must start with http:// or https://"),
  facebook: Yup.string()
    .url("Enter a valid Facebook URL")
    .matches(
      /^(https?:\/\/)?(www\.)?facebook\.com\//,
      "Must be a valid Facebook URL"
    ),
  instagram: Yup.string()
    .url("Enter a valid Instagram URL")
    .matches(
      /^(https?:\/\/)?(www\.)?instagram\.com\//,
      "Must be a valid Instagram URL"
    ),
  twitter: Yup.string()
    .url("Enter a valid Twitter URL")
    .matches(
      /^(https?:\/\/)?(www\.)?twitter\.com\//,
      "Must be a valid Twitter URL"
    ),
  logo: Yup.mixed(),
});

const NGOProfileUpdate = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadHover, setUploadHover] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid, dirtyFields },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setInitialLoading(true);
        const res = await axiosInstance.get("/user-details");
        const user = res.data.data;
        setUserId(user._id);
        setValue("mission", user.mission || "");
        setValue("description", user.description || "");
        setValue("website", user.website || "");
        setValue("facebook", user.facebook || "");
        setValue("instagram", user.instagram || "");
        setValue("twitter", user.twitter || "");

        if (user.logoUrl) {
          setPreviewUrl(`http://localhost:8082${user.logoUrl}`);
        }
      } catch (error) {
        toast.error("Failed to load user data");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUser();
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("mission", data.mission);
      formData.append("description", data.description);
      formData.append("website", data.website);
      formData.append("facebook", data.facebook);
      formData.append("instagram", data.instagram);
      formData.append("twitter", data.twitter);
      if (data.logo?.[0]) {
        formData.append("logo", data.logo[0]);
      }

      await axiosInstance.put(`/update-ngo-profile?userId=${userId}`, formData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <>
        <HeaderMid />
        <div className="min-h-screen flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-base-content/70">Loading your profile...</p>
          </div>
        </div>
      </>
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
              <div className="absolute w-12 h-12 rounded-full bg-white/10 top-20 left-40 animate-pulse" style={{ animationDelay: "1s" }}></div>
              <div className="absolute w-16 h-16 rounded-full bg-white/10 top-10 right-20 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
              
              {/* Logo/Profile image */}
              <div className="absolute -bottom-16 left-10">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Logo Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-green-100 text-green-600">
                      <FiUser className="w-16 h-16" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-20 pb-6 px-10">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Organization Profile</h1>
                  <p className="text-green-600 font-medium mt-1">Enhance your organization's presence</p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <label htmlFor="logoUpload" className="cursor-pointer">
                    <button 
                      type="button"
                      onClick={() => document.getElementById('logoUpload').click()}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    >
                      <FiUpload size={16} className="mr-2" />
                      Update Logo
                    </button>
                  </label>
                  <input
                    id="logoUpload"
                    type="file"
                    accept="image/*"
                    {...register("logo")}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPreviewUrl(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="md:col-span-2"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
                  <input
                    {...register("mission")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Your organization's mission"
                  />
                  {errors.mission && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.mission.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="md:col-span-2"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register("description")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-32"
                    placeholder="Describe your organization's work and impact"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      <FiLink className="mr-2 text-green-600" /> Website
                    </span>
                  </label>
                  <input
                    {...register("website")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.website.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      <FiFacebook className="mr-2 text-green-600" /> Facebook
                    </span>
                  </label>
                  <input
                    {...register("facebook")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://facebook.com/yourpage"
                  />
                  {errors.facebook && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.facebook.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      <FiInstagram className="mr-2 text-green-600" /> Instagram
                    </span>
                  </label>
                  <input
                    {...register("instagram")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://instagram.com/yourpage"
                  />
                  {errors.instagram && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.instagram.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center">
                      <FiTwitter className="mr-2 text-green-600" /> Twitter
                    </span>
                  </label>
                  <input
                    {...register("twitter")}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://twitter.com/yourhandle"
                  />
                  {errors.twitter && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.twitter.message}
                    </p>
                  )}
                </motion.div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-4 flex justify-end"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-green-200/50 transition-all"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiSave className="inline mr-2" /> Update Profile
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-gray-500 text-sm mt-8"
          >
            Keep your profile updated to increase visibility and trust with donors and volunteers
          </motion.p>
        </div>
      </motion.div>
    </>
  );
};

export default NGOProfileUpdate;
