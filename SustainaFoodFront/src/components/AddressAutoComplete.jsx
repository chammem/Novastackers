import React, { useState, useEffect, useRef } from "react";
import axios from "../config/axiosInstance";

const AddressAutoComplete = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  // Fetch suggestions from backend
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) return setResults([]);

      try {
        const res = await axios.get(`/search?q=${query}`);
        setResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 300); // debounce
    return () => clearTimeout(timeout);
  }, [query]);

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setShowDropdown(false);
    if (onSelect) onSelect(place);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        className="input input-bordered w-full"
        placeholder="Search your address"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {showDropdown && results.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border mt-1 rounded-lg shadow z-10 max-h-60 overflow-y-auto">
          {results.map((place, idx) => (
            <li
              key={idx}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(place)}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutoComplete;
