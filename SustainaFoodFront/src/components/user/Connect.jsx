import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
} from "react-icons/fi";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";

function Connect() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/login", { email, password });
      if (response.data.success) {
        await login(response.data.data);
        toast.success("Login successful!");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 100);
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <HeaderMid />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="hero min-h-screen bg-base-200"
      >
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="text-center lg:text-left lg:w-1/3 lg:ml-6">
            {/* Animated Image Above Welcome Back */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-md mb-6"
            >
              <img
                src="https://thumbs.dreamstime.com/b/bouton-rond-vert-vitreux-de-s%C3%A9curit%C3%A9-ic-ne-de-cadenas-97495264.jpg"
                alt="login"
                className="rounded-lg shadow-2xl object-cover h-[350px] w-full"
              />
            </motion.div>

            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold">Welcome Back!</h1>
              <p className="py-6">
                Sign in to continue your sustainable journey with SustainaFood.
                Reduce waste and help your community today.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="card flex-shrink-0 w-full max-w-sm shadow-lg bg-base-100"
          >
            <div className="card-body">
              <h2 className="card-title justify-center text-2xl font-bold">
                Login
              </h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="alert alert-error shadow-sm"
                >
                  <FiAlertTriangle />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                      placeholder="Enter your email"
                      className="input input-bordered w-full"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Password</span>
                    <Link
                      to="/forgot-password"
                      className="label-text-alt link link-hover"
                    >
                      Forgot password?
                    </Link>
                  </label>
                  <div className="input-group">
                    <span>
                      <FiLock />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="input input-bordered w-full"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn btn-ghost btn-square"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="form-control mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
              </form>

              <div className="divider">OR</div>

              {/* Social Media Login */}
              <div className="mt-2">
                <a
                  href="http://localhost:8082/api/auth/google"
                  className="btn btn-outline w-full flex items-center justify-center gap-2 hover:bg-gray-100 border-gray-300"
                  style={{
                    backgroundColor: "#fff",
                    color: "#757575",
                    border: "1px solid #dadce0",
                    borderRadius: "4px",
                    padding: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    textTransform: "none",
                  }}
                >
                  <img
                    src="/images/google.png"
                    alt="Google"
                    className="h-6 w-6"
                  />
                  <span>Sign in with Google</span>
                </a>
              </div>

              <div className="text-center mt-4">
                <p>
                  Don't have an account?
                  <Link to="/role" className="link link-primary ml-1">
                    Create one here
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <Footer />
    </>
  );
}

export default Connect;