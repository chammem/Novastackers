import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import HeaderMid from "../HeaderMid";

const CreateDonationForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  const {
    register: donationForm,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get("/user-details");
        setUser(response.data.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const ngoId = user?._id;
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("location", data.location);
      formData.append("endingDate", data.endingDate);
      formData.append("description", data.description || "");
      formData.append("ngoId", ngoId);

      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      await axiosInstance.post("/donations/create-donation", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("🎉 Donation created successfully!");
    } catch (error) {
      console.error("Error creating donation:", error);
      toast.error(
        error.response?.data?.message || "Failed to create donation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <HeaderMid />
      <div className="max-w-4xl mx-auto p-6 mt-10 mb-16 bg-base-100 shadow-xl rounded-2xl animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-2"> Create Donation campaign</h1>
          <p className="text-gray-600">
            Fill out the form below to create a new donation campaign.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Donation Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">campaign Name</span>
            </label>
            <input
              type="text"
              {...donationForm("name", {
                required: "Donation name is required",
              })}
              className="input input-bordered w-full"
              placeholder="e.g. Ramadan Food Drive"
            />
            {errors.name && (
              <p className="text-sm text-error mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Location</span>
            </label>
            <input
              type="text"
              {...donationForm("location", {
                required: "Location is required",
              })}
              className="input input-bordered w-full"
              placeholder="e.g. Tunis City Center"
            />
            {errors.location && (
              <p className="text-sm text-error mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Ending Date */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Ending Date</span>
            </label>
            <input
              type="datetime-local"
              {...donationForm("endingDate", {
                required: "Ending date is required",
                validate: (value) =>
                  new Date(value) > new Date() ||
                  "Ending date must be in the future",
              })}
              className="input input-bordered w-full"
            />
            {errors.endingDate && (
              <p className="text-sm text-error mt-1">{errors.endingDate.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              {...donationForm("description")}
              className="textarea textarea-bordered w-full"
              placeholder="Tell us more about your campaign..."
              rows="4"
            ></textarea>
          </div>

          {/* Donation Image */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Donation Image</span>
            </label>
            <input
              type="file"
              {...donationForm("image")}
              className="file-input file-input-bordered w-full"
              accept="image/*"
            />
          </div>

          {/* Submit Button */}
          <div className="form-control mt-10">
            <button
              type="submit"
              className="btn btn-primary w-full btn-lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : " Create Donation Campaign"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateDonationForm;
