import React, { useEffect, useState, useMemo, memo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FiNavigation } from "react-icons/fi";
import axiosInstance from "../../config/axiosInstance";
import { decode } from "@mapbox/polyline";

// Import standard marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Create simple colored variants for different marker types
const createColoredIcon = (color) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

// Simple colored dots to indicate different points
const driverDot = createColoredIcon("#1d4ed8"); // Blue for driver
const businessDot = createColoredIcon("#15803d"); // Green for restaurant
const customerDot = createColoredIcon("#b91c1c"); // Red for customer

// Component to auto-fit map to markers (memoized)
const FitBounds = memo(({ locations }) => {
  const map = useMap();

  useEffect(() => {
    // Only fit bounds when we have multiple locations and the map is ready
    if (locations && locations.length > 1 && map) {
      // Small delay to ensure map is ready
      setTimeout(() => {
        try {
          const bounds = L.latLngBounds(locations);
          map.fitBounds(bounds, { padding: [50, 50], animate: true });
          // Force a refresh of the map
          map.invalidateSize();
        } catch (err) {
          console.warn("Error fitting bounds:", err);
        }
      }, 200);
    }
  }, [map, locations]);

  return null;
});

// Create a map resizer component to handle window resize events
const MapResizer = () => {
  const map = useMap();

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      if (map) {
        map.invalidateSize();
      }
    };

    window.addEventListener("resize", handleResize);

    // Initial resize after a small delay
    setTimeout(handleResize, 300);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  return null;
};

// Add a function to fetch the route from the backend
const fetchRoute = async (start, end, mode = "driving-car") => {
  try {
    const response = await axiosInstance.post("/route", {
      start,
      end,
      mode,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
};

// Main component
const DeliveryRouteMap = ({ delivery, userLocation, routeMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [routePolyline, setRoutePolyline] = useState(null);

  // Get business location with fallbacks (memoized to prevent recalculation)
  const businessLocation = useMemo(() => {
    return delivery?.foodSale?.businessDetails?.location?.lat &&
      delivery?.foodSale?.businessDetails?.location?.lng
      ? [
          delivery.foodSale.businessDetails.location.lat,
          delivery.foodSale.businessDetails.location.lng,
        ]
      : null;
  }, [delivery]);

  // Get customer location (memoized)
  const customerLocation = useMemo(() => {
    return delivery?.deliveryAddress?.lat && delivery?.deliveryAddress?.lng
      ? [delivery.deliveryAddress.lat, delivery.deliveryAddress.lng]
      : null;
  }, [delivery]);

  // Determine destination based on route mode
  const destinationLocation =
    routeMode === "pickup" ? businessLocation : customerLocation;

  // Collect all valid locations for map bounds (memoized)
  const allLocations = useMemo(() => {
    return [
      userLocation,
      routeMode === "pickup" ? businessLocation : null,
      routeMode === "delivery" ? customerLocation : null,
    ].filter((location) => location !== null);
  }, [userLocation, businessLocation, customerLocation, routeMode]);

  // Calculate distance (memoized)
  const distance = useMemo(() => {
    if (!userLocation || !destinationLocation) return null;

    // Haversine formula to calculate distance between two points
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(destinationLocation[0] - userLocation[0]);
    const dLon = toRad(destinationLocation[1] - userLocation[1]);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLocation[0])) *
        Math.cos(toRad(destinationLocation[0])) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(1); // Return distance in km with 1 decimal
  }, [userLocation, destinationLocation]);

  // Calculate ETA (memoized)
  const eta = useMemo(() => {
    if (!distance) return null;
    const averageSpeedKmh = 15; // Average speed in km/h
    const timeHours = distance / averageSpeedKmh;
    const timeMinutes = timeHours * 60;

    const now = new Date();
    const eta = new Date(now.getTime() + timeMinutes * 60000);

    return {
      minutes: Math.round(timeMinutes),
      time: eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }, [distance]);

  // Fetch the route when userLocation or destination changes
  useEffect(() => {
    const getRoute = async () => {
      if (!userLocation || !destinationLocation) return;

      const routeData = await fetchRoute(
        [userLocation[1], userLocation[0]], // Convert to [lng, lat]
        [destinationLocation[1], destinationLocation[0]], // Convert to [lng, lat]
        "driving-car"
      );

      if (routeData && routeData.routes && routeData.routes[0]) {
        // Decode the geometry using the polyline decoder
        try {
          const decodedCoordinates = decode(routeData.routes[0].geometry);
          
          // Convert the decoded coordinates to Leaflet's expected format [lat, lng]
          const latLngs = decodedCoordinates.map(point => [point[0], point[1]]);
          
          setRoutePolyline(latLngs);
        } catch (error) {
          console.error("Error decoding route geometry:", error);
        }
      }
    };

    getRoute();
  }, [userLocation, destinationLocation]);

  // Set loading state
  useEffect(() => {
    // Hide loading indicator after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // If no user location yet, show loading
  if (!userLocation) {
    return (
      <div className="h-[450px] flex items-center justify-center bg-base-200 rounded-lg">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-3"></div>
          <p>Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[450px] w-full relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-200 z-20 rounded-lg">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary mb-3"></div>
            <p>Loading map...</p>
          </div>
        </div>
      )}

      {/* The map itself */}
      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
        zoomControl={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        dragging={true}
        easeLinearity={0.35}
        className="z-10 rounded-lg shadow-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <MapResizer />
        <FitBounds locations={allLocations} />

        {/* Driver marker - using standard marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div className="font-semibold">Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* Business/Restaurant marker - using standard marker */}
        {routeMode === "pickup" && businessLocation && (
          <Marker position={businessLocation}>
            <Popup>
              <div className="font-semibold">Restaurant</div>
              <div className="text-sm">
                {delivery?.foodSale?.businessDetails?.fullName || "Restaurant"}
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${businessLocation[0]},${businessLocation[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 text-sm mt-2"
              >
                <FiNavigation className="mr-1" /> Navigate here
              </a>
            </Popup>
          </Marker>
        )}

        {/* Customer marker - using standard marker */}
        {routeMode === "delivery" && customerLocation && (
          <Marker position={customerLocation}>
            <Popup>
              <div className="font-semibold">Delivery Address</div>
              <div className="text-sm">
                {delivery?.user?.fullName || "Customer"}
                <br />
                {delivery?.deliveryAddress?.street},{" "}
                {delivery?.deliveryAddress?.city}
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${customerLocation[0]},${customerLocation[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 text-sm mt-2"
              >
                <FiNavigation className="mr-1" /> Navigate here
              </a>
            </Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {routePolyline && (
          <Polyline
            positions={routePolyline}
            pathOptions={{ color: "blue", weight: 4, opacity: 0.7 }}
          />
        )}
      </MapContainer>

      {/* Map Legend - Simplified */}
      <div className="absolute top-3 right-3 z-20 bg-white bg-opacity-90 p-2 rounded-md shadow-md">
        <div className="text-sm font-semibold mb-1">Location Info</div>
        <div className="text-xs mb-1">
          {routeMode === "pickup" ? (
            <span>You → Restaurant</span>
          ) : (
            <span>You → Customer</span>
          )}
        </div>
      </div>

      {/* Distance and ETA Info */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white bg-opacity-90 p-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">
              Distance: {distance ? `${distance} km` : "-"}
            </p>
            <p className="text-sm">
              To {routeMode === "pickup" ? "restaurant" : "customer"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">ETA: {eta ? eta.time : "-"}</p>
            <p className="text-sm">{eta ? `(~${eta.minutes} min)` : ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DeliveryRouteMap);
