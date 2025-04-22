import React, { useState } from "react";
import { motion } from "framer-motion";
import HeaderMid from "../HeaderMid";
import Footer from "../Footer";
import { useNavigate } from "react-router-dom";
import { 
  FiUser, 
  FiTruck, 
  FiShoppingBag, 
  FiHeart, 
  FiShield, 
  FiCoffee,
  FiArrowRight
} from "react-icons/fi";

function RoleChoice() {
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (selectedRole === "") return;
    navigate(`/register/${selectedRole}`);
  };

  const roles = [
    { 
      id: "restaurant", 
      title: "Restaurant", 
      description: "Share surplus food from your restaurant to reduce waste",
      icon: <FiCoffee className="h-8 w-8" />,
      color: "bg-green-100 text-green-600"
    },
    { 
      id: "supermarket", 
      title: "Supermarket", 
      description: "Donate unsold grocery items to those in need",
      icon: <FiShoppingBag className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600" 
    },
    { 
      id: "driver", 
      title: "Driver", 
      description: "Transport food donations to distribution points",
      icon: <FiTruck className="h-8 w-8" />,
      color: "bg-orange-100 text-orange-600"
    },
    { 
      id: "user", 
      title: "User", 
      description: "Access food assistance and support services",
      icon: <FiUser className="h-8 w-8" />,
      color: "bg-purple-100 text-purple-600"
    },
    { 
      id: "charity", 
      title: "Charity", 
      description: "Receive donations for your community programs",
      icon: <FiHeart className="h-8 w-8" />,
      color: "bg-pink-100 text-pink-600"
    },
    { 
      id: "admin", 
      title: "Admin", 
      description: "Manage platform operations and users",
      icon: <FiShield className="h-8 w-8" />,
      color: "bg-red-100 text-red-600"
    },
  ];

  return (
    <>
      <HeaderMid />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-base-200 py-16 px-4"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Join Our Community
            </h1>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Choose your role in the SustainaFood ecosystem and start making a difference today.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                whileTap={{ scale: 0.98 }}
                className={`card border-2 transition-all duration-300 ${selectedRole === role.id ? "border-primary" : "border-transparent"}`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="card-body">
                  <div className="flex items-center mb-4">
                    <div className={`w-14 h-14 rounded-full ${role.color} flex items-center justify-center mr-4`}>
                      {role.icon}
                    </div>
                    <h2 className="card-title text-xl">{role.title}</h2>
                  </div>
                  <p className="text-base-content/70">{role.description}</p>
                  
                  <div className="flex justify-end mt-4">
                    <div className={`form-control w-6 h-6 ${selectedRole === role.id ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}>
                      <input type="radio" name="role" className="radio radio-primary" checked={selectedRole === role.id} readOnly />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`btn btn-primary btn-lg gap-2 ${!selectedRole ? "btn-disabled" : ""}`}
              onClick={handleSubmit}
              disabled={!selectedRole}
            >
              Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : "..."} 
              <FiArrowRight />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
      
      <Footer/>
    </>
  );
}

export default RoleChoice;