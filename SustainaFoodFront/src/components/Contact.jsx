import React, { useState } from "react";
import { motion } from "framer-motion";
import HeaderMid from "./HeaderMid";
import Footer from "./Footer";
import { toast } from "react-toastify";
import axiosInstance from "../config/axiosInstance";
import { FiMail, FiArrowRight } from "react-icons/fi";

function Contact() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post("/contact", formData);
      toast.success("Message sent successfully!");
      setFormData({ subject: "", message: "", email: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <HeaderMid />

      {/* HERO SECTION - Contact-focused */}
      <div className="relative overflow-hidden">
        <div className="hero min-h-[70vh] bg-gradient-to-br from-green-50 to-green-100 relative">
          {/* Background pattern with a subtle food-related image */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1974')] bg-cover bg-center"></div>

          <div className="hero-content p-8 flex-col lg:flex-row max-w-7xl mx-auto">
            {/* Hero image - Community engagement */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-md"
            >
              <img
                src="https://images.tmcnet.com/tmc/misc/articles/image/2021-sep/7798155850-AdobeStock_350143258_home_agent_F_SUPERSIZE.jpg"
                alt="Volunteers distributing food"
                className="rounded-lg shadow-2xl object-cover h-[350px]"
              />
            </motion.div>

            {/* Hero text - Contact introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <div className="badge badge-success mb-4">
                Get in Touch
              </div>
              <h1 className="text-5xl font-bold leading-tight bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Contact SustainaFood
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="py-6 text-lg text-gray-700"
              >
                Have questions, suggestions, or feedback? Reach out to us! We're here to help you join the mission of reducing food waste and supporting communities.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CONTACT FORM SECTION */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-800 text-center mb-8"
          >
            Send Us a Message
          </motion.h2>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Subject Selection */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="select select-bordered w-full bg-white border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
              >
                <option value="" disabled>
                  Select a subject
                </option>
                <option value="complaint">Complaint</option>
                <option value="gratitude">Gratitude</option>
                <option value="remark">Remark</option>
                <option value="suggestion">Suggestion</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="textarea textarea-bordered w-full bg-white border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
                placeholder="Write your message here..."
              ></textarea>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input input-bordered w-full bg-white border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn btn-success gap-2 ${isSubmitting ? "loading" : ""}`}
              >
                {isSubmitting ? "Sending..." : "Send Message"} <FiMail />
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Contact;