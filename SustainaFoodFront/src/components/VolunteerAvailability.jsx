import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiCalendar, FiClock, FiCheck, FiSun, FiMoon, FiWatch } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../config/axiosInstance";
import HeaderMid from "./HeaderMid";
import { motion } from "framer-motion";

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const VolunteerAvailability = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const [selectedDays, setSelectedDays] = useState([]);

  // Fetch current availability
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/volunteer/availability/${user._id}`
        );

        if (response.data.success) {
          const availabilityData = response.data.data;

          // Initialize with empty arrays for all days
          const formattedData = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: [],
          };

          // Populate with data from API
          Object.keys(availabilityData).forEach((day) => {
            formattedData[day] = availabilityData[day];
          });

          setAvailability(formattedData);

          // Set selected days based on data
          const daysWithData = Object.keys(availabilityData).filter(
            (day) => availabilityData[day]?.length > 0
          );
          setSelectedDays(daysWithData);
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast.error("Failed to load your availability schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [user]);

  const handleDayToggle = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const addTimeSlot = (day) => {
    setAvailability(prev => ({
      ...prev,
      [day]: [...prev[day], { start: "09:00", end: "17:00" }],
    }));
  };

  const updateTimeSlot = (day, index, field, value) => {
    const updatedSlots = [...availability[day]];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    
    // Validate time range if this is an end time update
    if (field === 'end') {
      const startTime = updatedSlots[index].start;
      if (startTime && value && startTime >= value) {
        toast.warning("End time must be after start time");
        // Correct the end time (add 1 hour to start time)
        const [hours, minutes] = startTime.split(':');
        let newHour = parseInt(hours) + 1;
        if (newHour > 23) newHour = 23;
        updatedSlots[index].end = `${newHour.toString().padStart(2, '0')}:${minutes}`;
      }
    }
    
    setAvailability({ ...availability, [day]: updatedSlots });
  };

  const removeTimeSlot = (day, index) => {
    const updatedSlots = [...availability[day]];
    updatedSlots.splice(index, 1);
    setAvailability({ ...availability, [day]: updatedSlots });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      toast.error("You must be logged in to save your availability");
      return;
    }

    // Filter only days with time slots
    const availabilityData = {};
    DAYS_OF_WEEK.forEach((day) => {
      if (availability[day].length > 0) {
        availabilityData[day] = availability[day];
      }
    });

    // Check if availabilityData is empty 
    if (Object.keys(availabilityData).length === 0) {
      // Instead of sending empty data, send a placeholder to avoid the backend validation error
      // Add a placeholder empty slot to Monday that effectively clears the schedule
      availabilityData.Monday = [{ 
        start: "00:00", 
        end: "00:01",
        isPlaceholder: true // This flag can be used by your application to identify this as a special case
      }];
      
      // Ask for confirmation before submitting empty availability
      if (!window.confirm("You're clearing your availability schedule, which means you won't be assigned any pickup tasks. Continue?")) {
        return;
      }
    }

    try {
      setSaving(true);
      const response = await axiosInstance.post(
        `/volunteer/availability/${user._id}`,
        availabilityData
      );

      if (response.data.success) {
        if (availabilityData.Monday?.length === 1 && availabilityData.Monday[0].isPlaceholder) {
          toast.success("Your availability has been cleared. You won't receive pickup assignments until you update your schedule.");
        } else {
          toast.success("Availability saved successfully!");
        }
      } else {
        toast.error(response.data.message || "Failed to save availability");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      console.error("Response data:", error.response?.data);
      toast.error(`Failed to save: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <HeaderMid />
        <div className="mt-24 flex justify-center items-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <span className="ml-3 text-lg">Loading your availability schedule...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white overflow-hidden relative">
      <HeaderMid />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-40 right-10 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Creative header with visual impact */}
          <div className="mb-10 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3"
            >
              <FiCalendar className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent"
            >
              Your Volunteer Schedule
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 text-gray-600 max-w-lg mx-auto"
            >
              Define when you're available to help deliver food to those in need. Every moment you give makes a difference.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100"
          >
            {/* Visual time theme header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute -right-10 -bottom-10 w-60 h-60 border-4 border-white/30 rounded-full"></div>
                <div className="absolute left-40 top-0 w-12 h-12 border-2 border-white/40 rounded-full"></div>
                <div className="absolute left-20 bottom-5 w-20 h-20 border-2 border-white/20 rounded-full"></div>
              </div>
              
              <div className="relative flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FiClock className="w-5 h-5" /> Time Availability
                  </h2>
                  <p className="text-green-50 text-sm">Set the hours when you can help transport food</p>
                </div>
                
                <div className="flex gap-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 flex items-center gap-1">
                    <FiSun className="text-yellow-100" />
                    <span className="text-white text-sm">Daytime</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 flex items-center gap-1">
                    <FiMoon className="text-blue-100" />
                    <span className="text-white text-sm">Evening</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                {/* Visually enhanced days selection */}
                <div className="form-control mb-8">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">Select days you're available:</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <motion.label 
                        key={day}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`relative flex items-center justify-center p-3 rounded-xl cursor-pointer border-2 transition-all ${
                          selectedDays.includes(day) 
                            ? "bg-green-100 border-green-600 shadow-md" 
                            : "bg-white border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="absolute opacity-0"
                          checked={selectedDays.includes(day)}
                          onChange={() => handleDayToggle(day)}
                          name={`day-${day}`}
                          id={`day-${day}`}
                        />
                        <div className="flex flex-col items-center">
                          <span className={`font-medium ${selectedDays.includes(day) ? "text-green-800" : "text-gray-600"}`}>
                            {day.slice(0, 3)}
                          </span>
                          {selectedDays.includes(day) && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="mt-1 text-green-600"
                            >
                              <FiCheck className="w-4 h-4" />
                            </motion.div>
                          )}
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </div>

                {/* Clear button in a better position */}
                <div className="flex justify-end mb-6">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear all your availability settings?")) {
                        setSelectedDays([]);
                        setAvailability({
                          Monday: [],
                          Tuesday: [],
                          Wednesday: [],
                          Thursday: [],
                          Friday: [],
                          Saturday: [],
                          Sunday: [],
                        });
                        toast.info("Availability schedule cleared");
                      }
                    }}
                  >
                    <FiTrash2 /> Clear All
                  </motion.button>
                </div>
                
                {/* Day Time Slots with improved visuals */}
                {selectedDays.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {selectedDays.map((day) => (
                      <motion.div 
                        key={`section-${day}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100"
                      >
                        <div className="bg-gradient-to-r from-green-100 to-emerald-50 p-4 flex justify-between items-center">
                          <h3 className="font-semibold flex items-center gap-2 text-gray-800">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                              <FiClock className="w-4 h-4" />
                            </div>
                            {day}
                          </h3>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            onClick={() => addTimeSlot(day)}
                          >
                            <FiPlus className="w-4 h-4" /> Add Time
                          </motion.button>
                        </div>
                        
                        <div className="p-4">
                          {availability[day].length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                              <FiWatch className="w-10 h-10 mx-auto opacity-30 mb-2" />
                              <p>No time slots added yet</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {availability[day].map((slot, index) => (
                                <motion.div 
                                  key={`slot-${day}-${index}`}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 * index }}
                                  className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm"
                                >
                                  <div className="flex-1 flex items-center gap-2">
                                    <div className="form-control flex-1">
                                      <input
                                        type="time"
                                        id={`${day}-start-${index}`}
                                        name={`${day}-start-${index}`}
                                        value={slot.start}
                                        onChange={(e) =>
                                          updateTimeSlot(day, index, "start", e.target.value)
                                        }
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      />
                                    </div>
                                    <span className="text-gray-400">to</span>
                                    <div className="form-control flex-1">
                                      <input
                                        type="time"
                                        id={`${day}-end-${index}`}
                                        name={`${day}-end-${index}`}
                                        value={slot.end}
                                        onChange={(e) =>
                                          updateTimeSlot(day, index, "end", e.target.value)
                                        }
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                      />
                                    </div>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"
                                    onClick={() => removeTimeSlot(day, index)}
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </motion.button>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiCalendar className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-medium text-orange-800">No days selected</h3>
                    <p className="text-orange-700 mt-1">Please select the days when you're available to volunteer.</p>
                  </div>
                )}
                
                {/* Enhanced submit button */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-10"
                >
                  <button
                    type="submit"
                    name="submit-availability"
                    id="submit-availability"
                    className="w-full relative py-3 px-4 overflow-hidden group bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium rounded-xl shadow-lg hover:shadow-green-200/40 transition-all"
                    disabled={saving}
                  >
                    <span className="absolute right-0 top-0 w-12 h-12 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2"></span>
                    <span className="absolute left-0 bottom-0 w-8 h-8 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2"></span>
                    
                    <span className="relative flex items-center justify-center gap-2 text-lg">
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving your schedule...
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-5 h-5" /> {selectedDays.length === 0 ? "Clear Availability" : "Save Your Schedule"}
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default VolunteerAvailability;
