import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// Yup Validation Schema
const registerSchema = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain one uppercase letter, one number, and one special character"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  phoneNumber: yup
    .string()
    .min(8, "Phone Number must contain at least 8 digits")
    .max(15, "Phone number must contain at most 15 digits")
    .matches(/^\d+$/, "Phone number must be numeric")
    .required("Phone number is required"),
  address: yup
    .string()
    .min(5, "Minimum of 5 characters")
    .matches(/^[a-zA-Z0-9\s,.'-]{5,100}$/),
});

function RegisterForm() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange", resolver: yupResolver(registerSchema) });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { fullName, ...otherFields } = data;

      const payload = {
        ...otherFields,
        role, // Ensure role is explicitly added
        fullName, // Map name to fullName
      };

      console.log("Payload:", payload);

      const response = await axiosInstance.post("/sign-up", payload);
      console.log("Signup successful:", response.data);

      setTimeout(() => {
        navigate("/verify", { state: { ...payload, role } });
      }, 100);
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg">
        {/* Form Section */}
        <div className="w-1/2 p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Register as {role.charAt(0).toUpperCase() + role.slice(1)}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="Enter your full name"
                className="input input-bordered w-full"
                {...register("fullName")}
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-blue-500 hover:underline mt-2"
              >
                {showPassword ? "Hide" : "Show"} Password
              </button>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                className="input input-bordered w-full"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            {/* Phone Number Field */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium">
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                placeholder="Enter your phone number"
                className="input input-bordered w-full"
                {...register("phoneNumber")}
              />
              {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>}
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium">
                Address
              </label>
              <input
                type="text"
                id="address"
                placeholder="Enter your address"
                className="input input-bordered w-full"
                {...register("address")}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* Already Have an Account Link */}
          <div className="mt-4 text-center">
            <p>
              Already have an account?{" "}
              <a href="/login" className="text-blue-500 hover:underline">
                Login here.
              </a>
            </p>
          </div>
        </div>

        {/* Image Section */}
        <div
          className="w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/images/register.svg")',
          }}
        ></div>
      </div>
    </div>
  );
}

export default RegisterForm;