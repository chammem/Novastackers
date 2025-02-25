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

function UserForm() {
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

      // Debugging step
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
    <div className="ltn__login-area pb-110">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title-area text-center">
              <h1 className="section-title">Register as {role.charAt(0).toUpperCase() + role.slice(1)}</h1>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-6 offset-lg-3">
            <div className="account-login-inner">
              <form noValidate onSubmit={handleSubmit(onSubmit)} className="ltn__form-box contact-form-box">
                {/* Full Name Field */}
                <input
                  type="text"
                  {...register("fullName", { required: "Full Name is required" })}
                  placeholder="Full Name"
                />
                {errors.fullName && <p className="error">{errors.fullName.message}</p>}

                <input type="email" {...register("email", { required: "Email is required" })} placeholder="Email" />
                {errors.email && <p className="error">{errors.email.message}</p>}

                <input type={showPassword ? "text" : "password"} {...register("password")} placeholder="Password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>Show</button>
                {errors.password && <p className="error">{errors.password.message}</p>}

                <input type={showPassword ? "text" : "password"} {...register("confirmPassword")} placeholder="Confirm Password" />
                {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}

                <input type="text" {...register("address")} placeholder="Address" />
                {errors.address && <p className="error">{errors.address.message}</p>}

                <input type="text" {...register("phoneNumber")} placeholder="Phone Number" />
                {errors.phoneNumber && <p className="error">{errors.phoneNumber.message}</p>}

                <button disabled={isSubmitting} className="theme-btn-1 btn reverse-color btn-block" type="submit">
                  {isSubmitting ? "Submitting..." : "CREATE ACCOUNT"}
                </button>
              </form>
              <div className="by-agree text-center">
                <p>By creating an account, you agree to our:</p>
                <p>
                  <a href="#">TERMS OF CONDITIONS | PRIVACY POLICY</a>
                </p>
                <div className="go-to-btn mt-50">
                  <a href="/login">ALREADY HAVE AN ACCOUNT?</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserForm;
