import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../config/axiosInstance";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const addTimeSlot = (day) => {
    setAvailability({
      ...availability,
      [day]: [...availability[day], { start: "09:00", end: "17:00" }],
    });
  };

  const updateTimeSlot = (day, index, field, value) => {
    const updatedSlots = [...availability[day]];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
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

    try {
      setSaving(true);
      const response = await axiosInstance.post(
        `/volunteer/availability/${user._id}`,
        availabilityData
      );

      if (response.data.success) {
        toast.success("Availability saved successfully!");
      } else {
        toast.error(response.data.message || "Failed to save availability");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save your availability schedule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-3 text-lg">
          Loading your availability schedule...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto bg-base-100 shadow-lg rounded-lg p-6"
    >
      <motion.h2
        className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <FiCalendar className="text-primary" /> Set Your Volunteer Availability
      </motion.h2>

      <form onSubmit={handleSubmit}>
        {/* Rest of the form remains the same as in your component */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">
            Select days you're available:
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <label
                  className={`btn btn-sm ${
                    selectedDays.includes(day) ? "btn-primary" : "btn-outline"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                  />
                  {day}
                </label>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rest of your component with time slots UI */}
        <AnimatePresence>
          {selectedDays.map((day) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              {/* Time slots UI remains the same */}
              <div className="bg-base-200 p-4 rounded-lg">
                {/* Day header with add button */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FiClock className="text-primary" /> {day}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => addTimeSlot(day)}
                  >
                    <FiPlus /> Add Time Slot
                  </motion.button>
                </div>

                {/* Time slots */}
                <AnimatePresence>
                  {availability[day].length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-center text-base-content/70 py-2"
                    >
                      No time slots added. Click "Add Time Slot" to specify
                      times.
                    </motion.p>
                  ) : (
                    availability[day].map((slot, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 mb-2"
                      >
                        <div className="form-control flex-1">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              updateTimeSlot(
                                day,
                                index,
                                "start",
                                e.target.value
                              )
                            }
                            className="input input-bordered w-full"
                          />
                        </div>
                        <span className="text-base-content/50">to</span>
                        <div className="form-control flex-1">
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              updateTimeSlot(day, index, "end", e.target.value)
                            }
                            className="input input-bordered w-full"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, color: "#f56565" }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          className="btn btn-circle btn-sm btn-ghost"
                          onClick={() => removeTimeSlot(day, index)}
                        >
                          <FiTrash2 />
                        </motion.button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="submit"
            className="btn btn-primary btn-lg gap-2"
            disabled={selectedDays.length === 0 || saving}
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              <>
                <FiCheck /> Save Availability
              </>
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default VolunteerAvailability;
