import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiTruck, FiBarChart, FiCamera, FiBell, FiMap } from "react-icons/fi";
import HeaderMid from "./HeaderMid";
import Footer from "./Footer";

function Features() {
  const features = [
    {
      title: "Inventory Management",
      description: "Track and list surplus food in real-time.",
      icon: <FiTruck />,
    },
    {
      title: "Logistics Planning",
      description: "Optimize routes for efficient food delivery.",
      icon: <FiMap />,
    },
    {
      title: "Intelligent Sorting",
      description: "AI-powered classification of food items.",
      icon: <FiCamera />,
    },
    {
      title: "Notifications",
      description: "Real-time alerts for donors and recipients.",
      icon: <FiBell />,
    },
    {
      title: "Reports and Analytics",
      description: "Track your impact with detailed insights.",
      icon: <FiBarChart />,
    },
  ];

  return (
    <>
      <HeaderMid />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen"
      >
        {/* Hero Section with Image Background */}
        <div className="hero min-h-[50vh] relative bg-gradient-to-br from-green-50 to-green-100">
          {/* Background image with low opacity */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1974')] bg-cover bg-center"></div>

          <div className="hero-content text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold text-green-800">
                Explore SustainaFood's Powerful Tools
              </h1>
              <p className="py-6 text-lg text-gray-700 max-w-2xl mx-auto">
                Discover how our AI-driven features help reduce food waste and
                support communities.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-md"
            >
              <img
                src="https://cdn-media-1.freecodecamp.org/images/1*D9PDIbwiUfWLB8zd7xPawQ.jpeg"
                alt="Food distribution"
                className="rounded-lg shadow-2xl object-cover h-[300px]"
              />
            </motion.div>
          </div>
        </div>

        {/* Feature Cards */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card bg-white shadow-md p-6 rounded-lg hover:shadow-xl transition"
              >
                <div className="text-4xl text-green-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
                <Link to="/features/detail" className="link link-primary mt-4">
                  Learn More
                </Link>
              </motion.div>
            ))}
          </div>
        </section>


      </motion.div>
      <Footer />
    </>
  );
}

export default Features;