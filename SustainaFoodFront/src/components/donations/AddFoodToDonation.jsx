import React, { useState, useEffect } from "react";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import uploadImage from "../../helpers/uploadImage";

const AddFoodToDonation = ({
  donationId,
  businessId,
  onClose,
  onFoodAdded,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    expiry_date: "",
    allergens: "",
    nutritional_category: "",
    category: "",
    buisiness_id: businessId,
    size: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");

  useEffect(() => {
    console.log("Updated formData:", formData);
  }, [formData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setIsUploadingImage(true);

      try {
        const uploadImageCloudinary = await uploadImage(file);
        console.log("Cloudinary response:", uploadImageCloudinary);
        console.log("Does secure_url exist?:", !!uploadImageCloudinary.secure_url);
        if (uploadImageCloudinary.secure_url) {
          setFormData((prev) => {
            const updatedFormData = {
              ...prev,
              image_url: uploadImageCloudinary.secure_url,
            };
            console.log("Updated formData after image upload:", updatedFormData);
            return updatedFormData;
          });
          // Wait for state to update before allowing submission
          await new Promise((resolve) => setTimeout(resolve, 0));
        } else {
          toast.error("Failed to upload image to Cloudinary");
        }
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        toast.error("Error uploading image");
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleDeleteImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Attempting to submit form...");

    if (isUploadingImage) {
      toast.error("Please wait, image is still uploading...");
      return;
    }

    setIsSubmitting(true);
    console.log("Form data being sent:", formData);

    if (formData.expiry_date) {
      const expiryDate = new Date(formData.expiry_date);
      const now = new Date();
      if (expiryDate <= now) {
        toast.error("Expiry date must be in the future");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await axiosInstance.post(
        `/donations/add-food-to-donation/${donationId}`,
        formData
      );

      toast.success("Food item added successfully!");
      onFoodAdded(response.data);
      onClose();
    } catch (error) {
      console.error("Error adding food:", error);
      toast.error(error.response?.data?.message || "Failed to add food item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 16);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Add Food Item</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Food Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Quantity (in Kg)</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="input input-bordered"
              min="1"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="select select-bordered"
              required
            >
              <option value="">Select Category</option>
              <option value="perishable">Perishable</option>
              <option value="non-perishable">Non-Perishable</option>
              <option value="cooked">Cooked Food</option>
              <option value="beverages">Beverages</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Size/Volume</span>
            </label>
            <select
              name="size"
              className="select select-bordered w-full"
              value={formData.size}
              onChange={(e) =>
                setFormData({ ...formData, size: e.target.value })
              }
              required
            >
              <option value="" disabled>
                Select size
              </option>
              <option value="small">Small (fits in backpack)</option>
              <option value="medium">Medium (requires car)</option>
              <option value="large">Large (requires van/truck)</option>
            </select>
            <label className="label">
              <span className="label-text-alt">
                Select based on volume and weight
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Expiry Date</span>
            </label>
            <input
              type="datetime-local"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="input input-bordered"
              min={getMinDate()}
              required
            />
            <label className="label">
              <span className="label-text-alt">
                When does this food expire?
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Allergens</span>
            </label>
            <input
              type="text"
              name="allergens"
              value={formData.allergens}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="e.g., Peanuts, Gluten, Dairy"
            />
            <label className="label">
              <span className="label-text-alt">
                List any allergens (optional)
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Nutritional Category</span>
            </label>
            <select
              name="nutritional_category"
              value={formData.nutritional_category}
              onChange={handleChange}
              className="select select-bordered"
            >
              <option value="">Select Nutritional Category (optional)</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="high-protein">High-Protein</option>
              <option value="low-carb">Low-Carb</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="dairy-free">Dairy-Free</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Food Image (optional)</span>
            </label>
            <label htmlFor="uploadFoodImageInput">
              <div className="p-2 bg-base-100 border rounded h-32 w-full flex justify-center items-center cursor-pointer">
                <div className="text-base-content/50 flex justify-center items-center flex-col gap-2">
                  <span className="text-4xl">
                    <FaCloudUploadAlt />
                  </span>
                  <p className="text-sm">Upload Food Image</p>
                  <input
                    type="file"
                    id="uploadFoodImageInput"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>
              </div>
            </label>
            <div>
              {imagePreview ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Food Preview"
                      width={80}
                      height={80}
                      className="bg-base-100 border cursor-pointer rounded"
                      onClick={() => {
                        setOpenFullScreenImage(true);
                        setFullScreenImage(imagePreview);
                      }}
                    />
                    <div
                      className="absolute bottom-0 right-0 p-1 text-white bg-red-600 rounded-full hidden group-hover:block cursor-pointer"
                      onClick={handleDeleteImage}
                    >
                      <MdDelete />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-error text-xs mt-2">
                  No image uploaded yet !
                </p>
              )}
            </div>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isSubmitting || isUploadingImage}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting || isUploadingImage ? "loading" : ""}`}
              disabled={isSubmitting || isUploadingImage}
            >
              {isSubmitting ? "Adding..." : isUploadingImage ? "Uploading Image..." : "Add Food"}
            </button>
          </div>
        </form>
      </div>

      {openFullScreenImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="relative max-w-3xl w-full">
            <button
              className="absolute top-2 right-2 btn btn-circle btn-ghost text-white"
              onClick={() => setOpenFullScreenImage(false)}
            >
              ✕
            </button>
            <img
              src={fullScreenImage}
              alt="Full Screen Food Image"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFoodToDonation;