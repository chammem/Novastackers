import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeaderMid from "./HeaderMid";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../config/axiosInstance";

import {
  FiUsers,
  FiTruck,
  FiShoppingBag,
  FiHeart,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";

function Home() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ meals: 0, partners: 0, pounds: 0 });

  useEffect(() => {
  document.title = "Sustainafood | Home";
}, []);


  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await axios.get('http://localhost:8082/api/auth/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch (error) {
        // Check if this is an authentication error (401/403) which is expected when not logged in
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log("User not logged in"); // Expected situation, no need for error toast
          setUser(null);
        } else {
          // For other unexpected errors, we can still log and optionally show a toast
          console.error("Error fetching user details:", error);
          // toast.error("Failed to fetch user details."); // Comment this out or handle conditionally
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  // Animated counter effect for statistics
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        meals: prev.meals < 10000 ? prev.meals + 100 : prev.meals,
        partners: prev.partners < 500 ? prev.partners + 5 : prev.partners,
        pounds: prev.pounds < 1000000 ? prev.pounds + 10000 : prev.pounds,
      }));
    }, 30);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <>
    
      <HeaderMid />

      {/* HERO SECTION - Redesigned with background image */}
      <div className="relative overflow-hidden">
        <div className="hero min-h-[80vh] bg-gradient-to-br from-primary/5 to-primary/20 relative">
          {/* Background pattern 
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974')]"></div>  */}

          <div className="hero-content p-8 flex-col lg:flex-row-reverse max-w-7xl mx-auto">
            {/* Hero image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1580913428706-c311e67898b3?q=80&w=1964"
                alt="Food donation"
                className="rounded-lg shadow-2xl object-cover h-[400px]"
              />
            </motion.div>

            {/* Hero text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <div className="badge badge-secondary mb-4">
                Making An Impact Together
              </div>
            <div>
            <h1 className="text-5xl font-bold leading-tight text-black">
            Save Food, Change Lives
            </h1>
            <div className="w-20 h-1 bg-primary mt-2"></div>
            </div>



              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="py-6 text-lg"
              >
                Join our community fighting food waste while helping those in
                need. SustainaFood connects restaurants, volunteers, and
                charities to make a meaningful difference.
              </motion.p>

              {/* Account Activation Alert */}
              {user &&
                (user.role === "restaurant" || user.role === "volunteer" || user.role ==="driver") &&
                !user.isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="alert alert-warning shadow-lg mb-6"
                  >
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="stroke-current flex-shrink-0 h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div>
                        <h3 className="font-bold">
                          Account Activation Required
                        </h3>
                        <p className="text-sm">
                          Your {user.role} account is pending activation.
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/activateAccount"
                      className="btn btn-sm btn-warning"
                    >
                      Activate Now
                    </Link>
                  </motion.div>
                )}

              {/* Role-based Custom Text */}
              {user?.role === "volunteer" && user?.isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4"
                >
                  <Link to="/volunteer" className="btn btn-primary gap-2">
                    Go to Dashboard <FiArrowRight />
                  </Link>
                </motion.div>
              )}

              {user?.role === "restaurant" && user?.isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4"
                >
                  <Link to="/donations" className="btn btn-primary gap-2">
                    Donate Food <FiArrowRight />
                  </Link>
                </motion.div>
              )}

              {/* Other role conditions */}
              {user?.role === "driver" && user?.isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4"
                >
                  <Link to="/dashboard" className="btn btn-primary gap-2">
                    Go to Dashboard <FiArrowRight />
                  </Link>
                </motion.div>
              )}

              {user?.role === "supermarket" && user?.isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4"
                >
                  <Link to="/dashboard" className="btn btn-primary gap-2">
                    Go to Dashboard <FiArrowRight />
                  </Link>
                </motion.div>
              )}

              {!user && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 flex gap-4"
                >
                  <Link to="/role" className="btn btn-primary gap-2">
                    Get Started <FiArrowRight />
                  </Link>
                  <Link to="/about" className="btn btn-outline">
                    Learn More
                  </Link>
                </motion.div>
              )}

              {user?.isActive && !user?.role && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4"
                >
                  <Link to="/role" className="btn btn-primary gap-2">
                    Choose Your Role <FiArrowRight />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* PARTNERS BANNER */}
      <div className="bg-base-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-4 text-sm font-medium text-base-content/80">
            TRUSTED BY ORGANIZATIONS WORLDWIDE 
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <img
              src="https://pbs.twimg.com/profile_images/1394261489054277638/rijXG1C__400x400.jpg"
              alt="ESPRIT"
              className="h-28"
            />
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbEszBK8o6mRtfD7N1Kjqmvl7bDHHNwXg8mQ&s"
              alt="monoprix"
              className="h-28"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/fr/4/41/Logo_Minist%C3%A8re_de_l%27Agriculture_%28Tunisie%29.png"
              alt="agriculture ministry"
              className="h-28"
            />
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJefSQeY_XQMpyaGR56zyZ5A-a5c4qr0-FCA&s"
              alt="Tunisian Red Crescent"
              className="h-28"
            />
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVxqFqyHLKqm57Y18TuKnYskwrxi5zQlrsAg&s"
              alt="Mazraa Market"
              className="h-28"
            />
          </div>
        </div>
      </div>

      {/* HOW IT WORKS - Enhanced with icons and animations */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="badge badge-primary mb-2">Simple Process</div>
            <h2 className="text-4xl font-bold">How SustainaFood Works</h2>
            <p className="mt-4 text-base-content/70 max-w-2xl mx-auto">
              Our platform makes it easy to reduce food waste and help
              communities in need through a simple three-step process.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "Sign Up",
                text: "Create an account as a restaurant, volunteer, or charity in just a few minutes.",
                icon: <FiUsers className="w-8 h-8" />,
                image: "/images/login2.svg", // Local image path
              },
              {
                step: "Connect",
                text: "Restaurants list surplus food, volunteers transport it, and charities receive donations.",
                icon: <FiTruck className="w-8 h-8" />,
                image: "/images/hero.png", // Local image path
              },
              {
                step: "Make an Impact",
                text: "Track your contribution to reducing food waste and supporting communities.",
                icon: <FiHeart className="w-8 h-8" />,
                image: "/images/impact.JPEG", // Local image path
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all overflow-hidden"
              >
                <figure className="h-48">
               <img
                src={item.image}
                alt={`Illustration for ${item.step} step`}
                className="w-full h-full object-cover"
                />

                </figure>
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-2">
                   <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center shadow">
                  {item.icon}
                  </div>


                    <h3 className="card-title text-xl">
                      Step {i + 1}: {item.step}
                    </h3>
                  </div>
                  <p className="text-base-content/70">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATISTICS - With animated counters */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/20 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="badge badge-secondary mb-2">Our Impact</div>
            <h2 className="text-4xl font-bold">Making A Difference Together</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                value: stats.meals.toLocaleString(),
                label: "Meals Saved",
                icon: <FiShoppingBag className="w-6 h-6" />,
              },
              {
                value: stats.partners.toLocaleString(),
                label: "Active Partners",
                icon: <FiUsers className="w-6 h-6" />,
              },
              {
                value: `${(stats.pounds / 1000000).toFixed(1)}M+ lbs`,
                label: "Food Waste Reduced",
                icon: <FiCheckCircle className="w-6 h-6" />,
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all text-center"
              >
                <div className="card-body p-8">
                  <div className="rounded-full w-16 h-16 bg-primary/30 flex items-center justify-center mx-auto mb-4 text-primary-content">
                    {stat.icon}
                  </div>
                  <h3 className="text-5xl font-bold tracking-tight drop-shadow-sm mb-2" style={{ color: '#06668C' }}>
  {stat.value}
</h3>


                  <p className="text-base-content/70">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - Enhanced with images and better cards */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="badge badge-primary mb-2">Testimonials</div>
            <h2 className="text-4xl font-bold">What Our Users Say</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                text: "SustainaFood has transformed how we handle excess food. Instead of throwing it away, we're now helping our community while reducing waste.",
                author: "Sarah Johnson",
                role: "Restaurant Owner",
                avatar: "https://i.pravatar.cc/150?img=32",
              },
              {
                text: "As a volunteer driver, I love being part of a solution that connects excess food with people who need it. The platform makes it incredibly easy.",
                author: "Michael Chen",
                role: "Volunteer Driver",
                avatar: "https://i.pravatar.cc/150?img=69",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="card-body p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-full">
                        <img src={t.avatar} alt={`Portrait of ${t.author}, ${t.role}`} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{t.author}</h3>
                      <p className="text-sm text-base-content/70">{t.role}</p>
                    </div>
                  </div>
                  <div className="divider my-2"></div>
                  <p className="text-base-content/80 italic">
                    "&nbsp;{t.text}&nbsp;"
                  </p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-amber-700"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION - Enhanced with high contrast */}

<section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-primary/20 relative">
  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531425566628-564f4b433a43?q=80&w=1932')] bg-cover bg-center opacity-15"></div>
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="max-w-3xl mx-auto relative z-10"
  >
    <div className="card bg-white text-gray-800 shadow-lg rounded-2xl">
      <div className="card-body p-10 text-center">
        {/* Rating element */}
      <div className="mb-4 flex justify-center items-center gap-2">
        <span className="text-yellow-700 text-lg">★★★★★</span>
        <span className="text-sm font-semibold text-gray-800">5.0 (1.2k+ reviews)</span>
      </div>
        
        <h2 className="text-3xl font-bold mb-5">
          Ready to Make a Difference?
        </h2>
        
        <p className="mb-8 text-lg max-w-lg mx-auto leading-relaxed">
          Join SustainaFood today and be part of our mission to reduce
          food waste while helping communities in need.
        </p>
        
        {user ? (
          <div className="flex justify-center">
            <Link
              to="/dashboard"
              className="btn btn-md bg-green-600 hover:bg-green-700 text-white gap-2 px-6"
            >
              Go to Dashboard <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
           <Link 
  to="/signup" 
  className="btn btn-md bg-green-700 hover:bg-green-800 text-white gap-2 px-6 font-semibold"
>
  Sign Up Now <FiArrowRight />
</Link>
            <Link
  to="/login"
  className="btn btn-md border-2 border-gray-900 text-gray-900 bg-white hover:bg-gray-50 px-6 font-semibold"
>
  Login
</Link>
          </div>
        )}
      </div>
    </div>
  </motion.div>
</section>

      <Footer />
    </>
  );
}

export default Home;
