import React, { useState } from "react";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";

const AddFoodToDonation = ({
  donationId,
  businessId,
  onClose,
  onFoodAdded,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    category: "",
    buisiness_id: businessId, // Keep this with correct spelling to match backend
    size: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
              <span className="label-text">Quantity</span>
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

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Food"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFoodToDonation;