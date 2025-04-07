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
        className="min-h-screen bg-base-200 py-12 px-4"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-center">
              Organization Profile
            </h1>
            <p className="text-center text-base-content/70 mt-2">
              Update your organization's information and presence
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar with Profile Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:w-1/3"
            >
              <div className="card bg-base-100 shadow-lg overflow-hidden">
                <div className="card-body items-center text-center p-6">
                  <div className="avatar">
                    <div className="w-40 h-40 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-300">
                      {logoPreview ? (
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          src={logoPreview}
                          alt="Organization Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-base-300 text-4xl font-bold text-base-content/40">
                          {profile.organizationName?.charAt(0) ||
                            profile.fullName?.charAt(0) ||
                            "?"}
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={triggerFileInput}
                    className="btn btn-outline btn-sm mt-4 gap-2"
                  >
                    <FiUpload size={14} />
                    Change Logo
                  </motion.button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    className="hidden"
                    accept="image/*"
                  />

                  <div className="mt-6 w-full">
                    <ul className="menu bg-base-200 rounded-xl">
                      <li>
                        <button
                          className={activeSection === "basic" ? "active" : ""}
                          onClick={() => setActiveSection("basic")}
                        >
                          <FiUser /> Basic Information
                        </button>
                      </li>
                      <li>
                        <button
                          className={
                            activeSection === "details" ? "active" : ""
                          }
                          onClick={() => setActiveSection("details")}
                        >
                          <FiInfo /> Organization Details
                        </button>
                      </li>
                      <li>
                        <button
                          className={activeSection === "social" ? "active" : ""}
                          onClick={() => setActiveSection("social")}
                        >
                          <FiGlobe /> Online Presence
                        </button>
                      </li>
                    </ul>

                    <div className="mt-6">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn btn-primary btn-block"
                        onClick={handleSubmit}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave size={16} />
                            Save Changes
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:w-2/3"
            >
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body p-6 md:p-8">
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
                          <h2 className="text-xl font-bold border-b pb-2">
                            Basic Information
                          </h2>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">
                                Organization Name
                              </span>
                            </label>
                            <input
                              type="text"
                              name="organizationName"
                              value={profile.organizationName}
                              onChange={handleInputChange}
                              className="input input-bordered"
                              placeholder="Your organization's name"
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">
                                Contact Person Name
                              </span>
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              value={profile.fullName}
                              onChange={handleInputChange}
                              className="input input-bordered"
                              placeholder="Full name of the contact person"
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Email</span>
                            </label>
                            <div className="input-group">
                              <span>
                                <FiMail />
                              </span>
                              <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                placeholder="contact@organization.org"
                              />
                            </div>
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Phone</span>
                            </label>
                            <div className="input-group">
                              <span>
                                <FiPhone />
                              </span>
                              <input
                                type="text"
                                name="phone"
                                value={profile.phone}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                placeholder="Your phone number"
                              />
                            </div>
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Address</span>
                            </label>
                            <div className="input-group">
                              <span>
                                <FiMapPin />
                              </span>
                              <input
                                type="text"
                                name="address"
                                value={profile.address}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                placeholder="Organization address"
                              />
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
                          <h2 className="text-xl font-bold border-b pb-2">
                            Organization Details
                          </h2>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">
                                Mission Statement
                              </span>
                            </label>
                            <input
                              type="text"
                              name="mission"
                              value={profile.mission}
                              onChange={handleInputChange}
                              className="input input-bordered"
                              placeholder="A brief statement of your organization's mission"
                            />
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Description</span>
                            </label>
                            <textarea
                              name="description"
                              value={profile.description}
                              onChange={handleInputChange}
                              className="textarea textarea-bordered h-32"
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
                          <h2 className="text-xl font-bold border-b pb-2">
                            Online Presence
                          </h2>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Website</span>
                            </label>
                            <div className="input-group">
                              <span>
                                <FiGlobe />
                              </span>
                              <input
                                type="url"
                                name="website"
                                value={profile.website}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                placeholder="https://yourorganization.org"
                              />
                            </div>
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Instagram</span>
                            </label>
                            <div className="input-group">
                              <span>
                                <FiInstagram />
                              </span>
                              <input
                                type="url"
                                name="instagram"
                                value={profile.instagram}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                placeholder="https://instagram.com/yourorganization"
                              />
                            </div>
                          </div>

                          <div className="form-control">
                            <label className="label">
                              <span className="label-text">Twitter</span>
                            </label>
                            <div className="input-group">
                              <span>
                                <FiTwitter />
                              </span>
                              <input
                                type="url"
                                name="twitter"
                                value={profile.twitter}
                                onChange={handleInputChange}
                                className="input input-bordered w-full"
                                placeholder="https://twitter.com/yourorganization"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>

                  <div className="card-actions justify-between mt-8 pt-4 border-t">
                    <button
                      onClick={() => window.history.back()}
                      className="btn btn-ghost gap-2"
                    >
                      <FiX size={16} /> Cancel
                    </button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={isSaving}
                      onClick={handleSubmit}
                      className="btn btn-primary gap-2"
                    >
                      {isSaving ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={16} />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <Footer />
    </>
  );
};

export default NGOProfileUpdate;
