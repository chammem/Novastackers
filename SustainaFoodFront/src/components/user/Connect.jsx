import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiUser,
  FiLogIn,
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
        className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8 px-4"
      >
        {/* Animated background elements */}
        <div className="container mx-auto relative">
          <motion.div
            className="absolute top-20 right-[10%] w-64 h-64 rounded-full bg-primary/5 filter blur-xl"
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute bottom-40 left-[5%] w-80 h-80 rounded-full bg-success/5 filter blur-xl"
            animate={{
              y: [0, 30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1,
            }}
          />

          <div className="hero">
            <div className="hero-content flex-col lg:flex-row-reverse justify-center gap-12">
              <motion.div
                className="text-center lg:text-left max-w-md w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Image content with adjusted height */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative mb-8 rounded-xl overflow-hidden shadow-xl"
                  whileHover={{
                    y: -5,
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/30 mix-blend-overlay"
                    animate={{ opacity: [0.7, 0.5, 0.7] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <img
                    src="images/login.svg"
                    alt="login"
                    className="object-cover h-[400px] w-full"
                  />
                </motion.div>

                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent flex items-center gap-3">
                    <motion.div
                      className="bg-primary/10 p-2 rounded-full"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <FiUser className="text-primary w-6 h-6" />
                    </motion.div>
                    Welcome Back!
                  </h1>

                  <p className="py-6 text-base-content/70">
                    Sign in to continue your sustainable journey with
                    SustainaFood. Reduce waste and help your community today.
                  </p>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex-shrink-0 w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div className="card bg-base-100 shadow-lg border border-base-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-primary-focus text-primary-content p-6 relative overflow-hidden">
                    <motion.div
                      className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />

                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="relative z-10 flex items-center gap-3"
                    >
                      <motion.div
                        className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
                        animate={{
                          y: [0, -5, 0],
                          boxShadow: [
                            "0 4px 6px rgba(0,0,0,0.1)",
                            "0 10px 15px rgba(0,0,0,0.2)",
                            "0 4px 6px rgba(0,0,0,0.1)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FiLogIn className="text-white w-6 h-6" />
                      </motion.div>
                      <h2 className="card-title text-2xl font-bold">Login</h2>
                    </motion.div>
                  </div>

                  <div className="card-body">
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="alert alert-error shadow-sm mb-4"
                        >
                          <FiAlertTriangle />
                          <span>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <motion.div
                        className="form-control"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="label">
                          <span className="label-text font-medium">Email</span>
                        </label>
                        <div className="relative">
                          <div className="input-group">
                            <span className="bg-base-200">
                              <FiMail />
                            </span>
                            <motion.input
                              type="email"
                              placeholder="Enter your email"
                              className="input input-bordered w-full"
                              onChange={(e) => setEmail(e.target.value)}
                              value={email}
                              required
                              whileFocus={{
                                boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
                              }}
                            />
                          </div>
                          <motion.div
                            className={`absolute bottom-0 left-0 h-1 bg-primary transition-all`}
                            animate={{ width: email ? "100%" : "0%" }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        className="form-control"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label className="label">
                          <span className="label-text font-medium">
                            Password
                          </span>
                          <Link
                            to="/forgot-password"
                            className="label-text-alt link link-hover text-primary"
                          >
                            Forgot password?
                          </Link>
                        </label>
                        <div className="relative">
                          <div className="input-group">
                            <span className="bg-base-200">
                              <FiLock />
                            </span>
                            <motion.input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="input input-bordered w-full"
                              onChange={(e) => setPassword(e.target.value)}
                              value={password}
                              required
                              whileFocus={{
                                boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
                              }}
                            />
                            <motion.button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="btn btn-ghost btn-square"
                              whileHover={{
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {showPassword ? <FiEyeOff /> : <FiEye />}
                            </motion.button>
                          </div>
                          <motion.div
                            className={`absolute bottom-0 left-0 h-1 bg-primary transition-all`}
                            animate={{ width: password ? "100%" : "0%" }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        className="form-control mt-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <motion.button
                          type="submit"
                          disabled={isLoading}
                          className="btn btn-primary"
                          whileHover={{
                            y: -2,
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isLoading ? (
                            <motion.div
                              className="flex items-center gap-2"
                              animate={{ opacity: [0.6, 1, 0.6] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <div className="relative w-5 h-5">
                                <motion.div
                                  className="absolute inset-0 rounded-full border-2 border-white border-t-transparent"
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                />
                              </div>
                              <span>Signing In...</span>
                            </motion.div>
                          ) : (
                            <span>Sign In</span>
                          )}
                        </motion.button>
                      </motion.div>
                    </form>

                    <div className="divider my-6">OR</div>

                    {/* Enhanced Social Media Login */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{
                        y: -2,
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <a
                        href="http://localhost:8082/api/auth/google"
                        className="btn btn-outline w-full flex items-center justify-center gap-2 hover:bg-base-200 border-base-300 rounded-lg"
                        style={{
                          backgroundColor: "#fff",
                          color: "#757575",
                          border: "1px solid #dadce0",
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
                    </motion.div>

                    <motion.div
                      className="text-center mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <p className="text-base-content/70">
                        Don't have an account?{" "}
                        <motion.span whileHover={{ color: "#4338CA" }}>
                          <Link
                            to="/role"
                            className="text-primary font-medium hover:underline"
                          >
                            Create one here
                          </Link>
                        </motion.span>
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      <Footer />
    </>
  );
}

export default Connect;
