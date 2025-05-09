import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiMapPin, FiCrosshair } from 'react-icons/fi';
import axiosInstance from '../../config/axiosInstance';

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    }
  });
  
  return null;
}

const LocationSelector = ({ onLocationSelect, initialLocation, address }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || { lat: 33.9715904, lng: -6.8498129 });
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  
  useEffect(() => {
    // If we have an address but no coordinates, try to geocode it
    if (address && !initialLocation && isMapLoaded) {
      geocodeAddress(address);
    }
  }, [address, initialLocation, isMapLoaded]);

  // Handle map click selection
  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng);
    onLocationSelect(latlng);
    
    // Optionally reverse geocode to get address from coordinates
    reverseGeocode(latlng.lat, latlng.lng);
  };
  
  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setSelectedLocation(location);
          onLocationSelect(location);
          
          // Center map on new location
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
          }
          
          // Get address from coordinates
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your current location. Please select manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };
  
  // Geocode address to get coordinates
  const geocodeAddress = async (addressObj) => {
    try {
      const addressString = `${addressObj.street}, ${addressObj.city}, ${addressObj.state} ${addressObj.zipCode}, ${addressObj.country}`;
      const response = await axiosInstance.get(`/location/geocode?address=${encodeURIComponent(addressString)}`);
      
      if (response.data.success && response.data.coordinates) {
        const { lat, lng } = response.data.coordinates;
        setSelectedLocation({ lat, lng });
        onLocationSelect({ lat, lng });
        
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };
  
  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await axiosInstance.get(`/location/reverse-geocode?lat=${lat}&lng=${lng}`);
      
      if (response.data.success && response.data.addressComponents) {
        onLocationSelect({
          lat,
          lng,
          addressDetails: response.data.addressComponents
        });
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">Select Delivery Location</h3>
        <button 
          type="button" 
          className="btn btn-sm btn-outline"
          onClick={handleGetCurrentLocation}
        >
          <FiCrosshair className="mr-1" /> Use My Location
        </button>
      </div>
      
      {/* Map container */}
      <div className="h-48 w-full rounded-md overflow-hidden border border-base-300">
        <MapContainer
          center={[selectedLocation.lat, selectedLocation.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map) => {
            mapRef.current = map;
            setIsMapLoaded(true);
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
          <MapClickHandler onLocationSelect={handleMapClick} />
        </MapContainer>
      </div>
      
      {/* Selected location info */}
      <div className="flex items-center text-sm text-base-content/70">
        <FiMapPin className="mr-2" />
        <span>Selected coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</span>
      </div>
    </div>
  );
};

export default LocationSelector;