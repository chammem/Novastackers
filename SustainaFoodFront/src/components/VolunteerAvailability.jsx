import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiCalendar, FiClock, FiCheck } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../config/axiosInstance";
import HeaderMid from "./HeaderMid";

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
    <div className="min-h-screen bg-base-200">
      <HeaderMid />
      <div className="container mx-auto px-4 py-24">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold flex justify-center gap-2 mb-6">
              <FiCalendar className="text-primary" /> Set Your Volunteer Availability
            </h2>
            
            <form onSubmit={handleSubmit}>
              {/* Days Selection */}
              <div className="form-control mb-8">
                <label className="label">
                  <span className="label-text font-medium">Select days you're available:</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <label 
                      key={day}
                      className={`btn btn-sm ${
                        selectedDays.includes(day) ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        name={`day-${day}`}
                        id={`day-${day}`}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Day Time Slots */}
              {selectedDays.map((day) => (
                <div key={`section-${day}`} className="mb-6">
                  <div className="bg-base-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FiClock className="text-primary" /> {day}
                      </h3>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => addTimeSlot(day)}
                      >
                        <FiPlus /> Add Time Slot
                      </button>
                    </div>
                    
                    {availability[day].length === 0 ? (
                      <p className="text-sm text-center text-base-content/70 py-2">
                        No time slots added. Click "Add Time Slot" to specify times.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {availability[day].map((slot, index) => (
                          <div 
                            key={`slot-${day}-${index}`} 
                            className="flex items-center gap-2"
                          >
                            <div className="form-control flex-1">
                              <input
                                type="time"
                                id={`${day}-start-${index}`}
                                name={`${day}-start-${index}`}
                                value={slot.start}
                                onChange={(e) =>
                                  updateTimeSlot(day, index, "start", e.target.value)
                                }
                                className="input input-bordered w-full"
                              />
                            </div>
                            <span className="text-base-content/50">to</span>
                            <div className="form-control flex-1">
                              <input
                                type="time"
                                id={`${day}-end-${index}`}
                                name={`${day}-end-${index}`}
                                value={slot.end}
                                onChange={(e) =>
                                  updateTimeSlot(day, index, "end", e.target.value)
                                }
                                className="input input-bordered w-full"
                              />
                            </div>
                            <button
                              type="button"
                              className="btn btn-circle btn-sm btn-ghost text-error"
                              onClick={() => removeTimeSlot(day, index)}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Submit Button */}
              <div className="form-control mt-8">
                <button
                  type="submit"
                  name="submit-availability"
                  id="submit-availability"
                  className="btn btn-primary btn-lg mx-auto w-full max-w-xs gap-2"
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
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerAvailability;
