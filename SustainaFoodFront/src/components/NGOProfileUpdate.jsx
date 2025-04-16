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
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto py-12 px-6"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-base-100 shadow-xl rounded-xl overflow-hidden"
        >
          <div className="bg-primary text-primary-content p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FiEdit /> Update NGO Profile
            </h2>
            <p className="mt-2 opacity-90">
              Enhance your organization's presence and reach more supporters
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
                onHoverStart={() => setUploadHover(true)}
                onHoverEnd={() => setUploadHover(false)}
              >
                <label htmlFor="logoUpload" className="cursor-pointer block">
                  <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 flex items-center justify-center shadow-lg relative group">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                    ) : (
                      <div className="bg-base-200 w-full h-full flex items-center justify-center">
                        <FiUser className="w-16 h-16 text-base-content/30" />
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: uploadHover ? 0.9 : 0 }}
                      className="absolute inset-0 bg-primary/80 flex items-center justify-center text-white"
                    >
                      <div className="text-center">
                        <FiUpload className="mx-auto w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Update Logo</span>
                      </div>
                    </motion.div>
                  </div>
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
              </motion.div>
              <span className="text-xs text-base-content/60 mt-2">
                Click to upload a new logo
              </span>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="md:col-span-2"
              >
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-medium">Mission</span>
                  </div>
                  <input
                    {...register("mission")}
                    className="input input-bordered w-full focus:input-primary transition-all duration-300"
                    placeholder="Your organization's mission"
                  />
                  {errors.mission && (
                    <div className="label">
                      <span className="label-text-alt text-error">
                        {errors.mission.message}
                      </span>
                    </div>
                  )}
                </label>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="md:col-span-2"
              >
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-medium">Description</span>
                  </div>
                  <textarea
                    {...register("description")}
                    className="textarea textarea-bordered w-full h-32 focus:textarea-primary transition-all duration-300"
                    placeholder="Describe your organization's work and impact"
                  />
                  {errors.description && (
                    <div className="label">
                      <span className="label-text-alt text-error">
                        {errors.description.message}
                      </span>
                    </div>
                  )}
                </label>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-medium flex items-center gap-1">
                      <FiLink className="text-primary" /> Website
                    </span>
                  </div>
                  <input
                    {...register("website")}
                    className="input input-bordered w-full focus:input-primary transition-all duration-300"
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.website && (
                    <div className="label">
                      <span className="label-text-alt text-error">
                        {errors.website.message}
                      </span>
                    </div>
                  )}
                </label>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-medium flex items-center gap-1">
                      <FiFacebook className="text-blue-600" /> Facebook
                    </span>
                  </div>
                  <input
                    {...register("facebook")}
                    className="input input-bordered w-full focus:input-primary transition-all duration-300"
                    placeholder="https://facebook.com/yourpage"
                  />
                  {errors.facebook && (
                    <div className="label">
                      <span className="label-text-alt text-error">
                        {errors.facebook.message}
                      </span>
                    </div>
                  )}
                </label>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-medium flex items-center gap-1">
                      <FiInstagram className="text-pink-600" /> Instagram
                    </span>
                  </div>
                  <input
                    {...register("instagram")}
                    className="input input-bordered w-full focus:input-primary transition-all duration-300"
                    placeholder="https://instagram.com/yourpage"
                  />
                  {errors.instagram && (
                    <div className="label">
                      <span className="label-text-alt text-error">
                        {errors.instagram.message}
                      </span>
                    </div>
                  )}
                </label>
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-medium flex items-center gap-1">
                      <FiTwitter className="text-sky-500" /> Twitter
                    </span>
                  </div>
                  <input
                    {...register("twitter")}
                    className="input input-bordered w-full focus:input-primary transition-all duration-300"
                    placeholder="https://twitter.com/yourhandle"
                  />
                  {errors.twitter && (
                    <div className="label">
                      <span className="label-text-alt text-error">
                        {errors.twitter.message}
                      </span>
                    </div>
                  )}
                </label>
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
                disabled={!isValid || isSubmitting || loading}
                className={`btn btn-primary gap-2 px-8 ${
                  loading ? "loading" : ""
                }`}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiSave /> Update Profile
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-base-content/60 text-sm mt-8"
        >
          Keep your profile updated to increase visibility and trust with donors
          and volunteers
        </motion.p>
      </motion.div>
    </>
  );
};

export default NGOProfileUpdate;
