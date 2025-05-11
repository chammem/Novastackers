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

function About() {
    const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ meals: 0, partners: 0, pounds: 0 });

  return (
    <>
      <HeaderMid />

      {/* HERO SECTION - Redesigned with background image */}
      <div className="relative overflow-hidden">
        <div className="hero min-h-[80vh] bg-gradient-to-br from-primary/5 to-primary/20 relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974')]"></div>

          <div className="hero-content p-8 flex-col lg:flex-row-reverse max-w-7xl mx-auto">
            {/* Hero image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-lg"
            >
              <img
                src="https://www.netsolutions.com/wp-content/uploads/2022/10/Building-an-Online-Food-Ordering-App_-16-Essential-Features.webp"
                alt="Volunteers distributing food"
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
              Fighting Food Waste
              </div>
              <h1 className="text-5xl font-bold leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              About SustainaFood
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="py-6 text-lg"
              >
                <span className="text-3xl">SustainaFood</span> is a platform dedicated to reducing food waste by connecting supermarkets, restaurants, and charities. Using AI-driven solutions, we optimize food collection, sorting, and redistribution to ensure surplus food reaches those in need while minimizing environmental impact.
                Join the act, make a difference !!
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4"
              >
                <Link to="/role" className="btn btn-success gap-2">
                  Join Our Mission <FiArrowRight />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* PARTNERS BANNER */}
      <div className="bg-base-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-4 text-sm font-medium text-base-content/60">
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



      <Footer />
    </>
  );
}
export default About;