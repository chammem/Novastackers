import React from "react";
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiMail,
  FiPhone,
  FiMapPin,
  FiHeart,
} from "react-icons/fi";

function Footer() {
  return (
    <footer className="bg-base-100 footer-wrapper shadow-inner">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <h2 className="text-2xl font-bold text-primary">SustainaFood</h2>
            </div>
            <p className="text-base-content/70 mt-2">
              Connecting surplus food with those who need it most, reducing
              waste while serving communities.
            </p>
            <div className="flex space-x-3 mt-4">
              <a
                href="#"
                aria-label="Facebook"
                className="btn btn-circle btn-sm btn-ghost"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="btn btn-circle btn-sm btn-ghost"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="btn btn-circle btn-sm btn-ghost"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="btn btn-circle btn-sm btn-ghost"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="footer-title mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="link link-hover">
                Home
              </Link>
              <Link to="/features" className="link link-hover">
                Features
              </Link>
              <Link to="/about" className="link link-hover">
                About Us
              </Link>
              <Link to="/contact" className="link link-hover">
                Contact
              </Link>
              <Link to="/login" className="link link-hover">
                Login
              </Link>
              <Link to="/role" className="link link-hover">
                Sign Up
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="md:col-span-1">
            <h3 className="footer-title mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FiMail className="text-primary" />
                <span>info@sustainafood.com</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start gap-2">
                <FiMapPin className="text-primary mt-1" />
                <span>
                  123 Green Street, Eco City,
                  <br />
                  Sustainability State, 12345
                </span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-1">
            <h3 className="footer-title mb-4">Subscribe to Newsletter</h3>
            <div className="form-control w-full">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email"
                  className="input input-bordered w-full pr-16"
                />
                <button className="btn btn-primary absolute top-0 right-0 rounded-l-none">
                  Subscribe
                </button>
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/70">
                  Get updates on our latest initiatives
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider mt-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-base-content/70 text-sm">
          <div>
            © {new Date().getFullYear()} SustainaFood. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <Link to="/privacy" className="link link-hover">
              Privacy Policy
            </Link>
            <Link to="/terms" className="link link-hover">
              Terms of Service
            </Link>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-1">
            Made with <FiHeart className="text-error" /> for a sustainable
            future
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
