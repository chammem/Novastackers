import React, { useEffect, useState } from "react";
import axiosInstance from "../config/axiosInstance";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import HeaderMid from "./HeaderMid";

const validationSchema = Yup.object().shape({
  mission: Yup.string().required("Mission is required"),
  description: Yup.string().required("Description is required"),
  website: Yup.string()
    .url("Enter a valid URL")
    .matches(/^https?:\/\/.*$/, "URL must start with http:// or https://"),
  facebook: Yup.string()
    .url("Enter a valid Facebook URL")
    .matches(/^(https?:\/\/)?(www\.)?facebook\.com\//, "Must be a valid Facebook URL"),
  instagram: Yup.string()
    .url("Enter a valid Instagram URL")
    .matches(/^(https?:\/\/)?(www\.)?instagram\.com\//, "Must be a valid Instagram URL"),
  twitter: Yup.string()
    .url("Enter a valid Twitter URL")
    .matches(/^(https?:\/\/)?(www\.)?twitter\.com\//, "Must be a valid Twitter URL"),
  logo: Yup.mixed(),
});

const NGOProfileUpdate = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
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
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
            <HeaderMid/>
            <div className="max-w-3xl mx-auto py-8 px-4">
            <h2 className="text-2xl font-bold mb-4">Update NGO Profile</h2>

            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-4">
            <div className="flex flex-col items-center">
  <label htmlFor="logoUpload" className="cursor-pointer">
    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center shadow">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Logo Preview"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-sm text-gray-400">Choose Logo</span>
      )}
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
</div>

        <div>
          <label className="font-medium">Mission</label>
          <input {...register("mission")} className="input input-bordered w-full" />
          {errors.mission && <p className="text-red-500 text-sm">{errors.mission.message}</p>}
        </div>

        <div>
          <label className="font-medium">Description</label>
          <textarea {...register("description")} className="textarea textarea-bordered w-full" />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div>
          <label className="font-medium">Website</label>
          <input {...register("website")} className="input input-bordered w-full" />
          {errors.website && <p className="text-red-500 text-sm">{errors.website.message}</p>}
        </div>

        <div>
          <label className="font-medium">Facebook</label>
          <input {...register("facebook")} className="input input-bordered w-full" />
          {errors.facebook && <p className="text-red-500 text-sm">{errors.facebook.message}</p>}
        </div>

        <div>
          <label className="font-medium">Instagram</label>
          <input {...register("instagram")} className="input input-bordered w-full" />
          {errors.instagram && <p className="text-red-500 text-sm">{errors.instagram.message}</p>}
        </div>

        <div>
          <label className="font-medium">Twitter</label>
          <input {...register("twitter")} className="input input-bordered w-full" />
          {errors.twitter && <p className="text-red-500 text-sm">{errors.twitter.message}</p>}
        </div>

      


        <button
          type="submit"
          disabled={!isValid || isSubmitting || loading}
          className="btn btn-primary"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
    </>
  );
};

export default NGOProfileUpdate;
