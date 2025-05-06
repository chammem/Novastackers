// Create new file: src/components/driver/AllDeliveriesMap.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import HeaderMid from '../HeaderMid';
import Footer from '../Footer';
import DriverRouteMap from './DriverRouteMap';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMap, FiList, FiMapPin, FiCompass } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AllDeliveriesMap = () => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  
  // Get user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude
        ]);
      },
      (error) => {
        console.error("Error getting location:", error);
        // Set a default location (Tunisia for example)
        setUserLocation([36.8065, 10.1815]);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
    );
    
    // Set up watchPosition for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation([
          position.coords.latitude,
          position.coords.longitude
        ]);
      },
      null,
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
    );
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return (
    <>
      <HeaderMid />
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FiMap className="text-primary" />
              All Deliveries Route
            </h1>
            <Link to="/driver-dashboard" className="btn btn-outline btn-sm">
              <FiArrowLeft className="mr-1" /> Back to Dashboard
            </Link>
          </div>
          
          <div className="mb-4 bg-base-100 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-2 text-sm">
              <FiCompass className="text-primary" />
              <span>
                This map shows the optimized route for all your active deliveries.
                Follow the blue line for the most efficient route.
              </span>
            </div>
          </div>
          
          <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-base-200">
              <h2 className="font-semibold">Your Optimized Route</h2>
            </div>
            
            {userLocation ? (
              <DriverRouteMap driverId={user._id} userLocation={userLocation} />
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="loading loading-spinner loading-lg text-primary mb-3"></div>
                  <p>Getting your location...</p>
                </div>
              </div>
            )}
            
            <div className="p-4 border-t border-base-200">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <span className="badge badge-sm badge-primary">
                    <FiMapPin className="mr-1" /> Pickups
                  </span>
                  <span className="badge badge-sm badge-secondary">
                    <FiMapPin className="mr-1" /> Deliveries
                  </span>
                </div>
                
                <Link to="/driver-dashboard" className="btn btn-sm btn-primary">
                  <FiList className="mr-1" /> View as List
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default AllDeliveriesMap;