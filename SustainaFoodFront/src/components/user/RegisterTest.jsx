import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import * as yup from "yup"
import {yupResolver} from "@hookform/resolvers/yup";
import { useState } from "react";

//Yup validation Schema
const registerSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,"Password must contain one uppercase letter, one number, and one special character").required("Password is required"),
  confirmPassword: yup.string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  phoneNumber: yup.string().min(8,"Phone Number must contain at least 8 digits").max(15,"Phone number must contain at maximaume 15 digits").matches(/^\d+$/, "Phone number must be numeric").required("Phone number is required"),
  address:yup.string().min(5,"minimaume of 5 characters").matches(/^[a-zA-Z0-9\s,.'-]{5,100}$/)
});




const roleBasedFields = {
  user: ["lastName", "firstName"],
  driver: ["lastName", "firstName", "vehicleType", "licensePlateNumber", "vehicleCapacity", "driverLicenseNumber", "vehicleRegistration"],
  restaurant: ["restaurantName", "businessLicenseNumber", "taxId", "averageQuantityDonated", "preferredPickupTimes"],
  supermarket: ["supermarketName", "businessLicenseNumber", "taxId"],
};

const formatFieldName = (field) => {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

function UserForm() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({mode:"onChange",resolver:yupResolver(registerSchema)});

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { firstName,lastName, ...otherFields } = data;
      const fullName = `${firstName} ${lastName}`;
      const payload = {
        ...otherFields,
        role, // Add the role from useParams()
        fullName,
      };
      console.log("Payload:", payload);
      const response = await axiosInstance.post("/sign-up",payload);
      console.log("Signup successful:", response.data);
      //alert("A verification code has been sent to your email.");
      setTimeout(() => {
        navigate("/verify", { state: { ...payload, role } });
      }, 100); 
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
    }
      finally{
        setIsSubmitting(false);
      }
  };

  const topFields = ["lastName", "firstName", "restaurantName", "supermarketName"];
  const fields = roleBasedFields[role] || [];
  const topFieldsToRender = fields.filter((field) => topFields.includes(field));
  const bottomFieldsToRender = fields.filter((field) => !topFields.includes(field));

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
                {topFieldsToRender.map((field, index) => (
                  <div key={`${field}-${index}`}>
                  <input
                    type="text"
                    {...register(field, { required: `${formatFieldName(field)} is required` })}
                    placeholder={formatFieldName(field)}
                  />
                  {errors[field] && <p className="error">{errors[field].message}</p>}
                </div>
                ))}
                <input type="email" {...register("email", { required: "Email is required" })} placeholder="Email" />
                {errors.email && <p className="error">{errors.email.message}</p>}
                <input type={showPassword? "text" : "password"} {...register("password", { required: "Password is required" })} placeholder="Password" />
                <button onClick={()=>setShowPassword(!showPassword)}>show</button>
                {errors.password && <p className="error">{errors.password.message}</p>}

                <input type={showPassword? "text" : "password"} {...register("confirmPassword", { required: "Confirm Password is required" })} placeholder="Confirm Password" />
                {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
                <input type="text" {...register("address", { required: "Address is required" })} placeholder="Address" />
                {errors.address && <p className="error">{errors.address.message}</p>}
                <input type="text" {...register("phoneNumber", { required: "Phone Number is required" })} placeholder="Phone Number" />
                {errors.phoneNumber && <p className="error">{errors.phoneNumber.message}</p>}

                {bottomFieldsToRender.map((field, index) => (
                  <input
                    key={`${field}-${index}`}
                    type="text"
                    {...register(field, { required: `${formatFieldName(field)} is required` })}
                    placeholder={formatFieldName(field)}
                  />
                ))}
                <button disabled={isSubmitting}className="theme-btn-1 btn reverse-color btn-block" type="submit">
                 {isSubmitting ?"Submiting":"CREATE ACCOUNT" }    
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
