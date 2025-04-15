import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axiosInstance";
import { toast } from "react-toastify";
import {
  FiMapPin,
  FiClock,
  FiNavigation,
  FiArrowLeft,
  FiCheckSquare,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Suspense, lazy } from "react";

// Create a lazy-loaded Map component
const LazyMap = lazy(() => import("./BatchRouteMap"));

function BatchRouteDetails() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [transportMode, setTransportMode] = useState("driving-car");
  const [mapLoading, setMapLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.warning("Could not get your current location");
        }
      );
    }
  }, []);

  // Fetch route data when we have user location
  useEffect(() => {
    if (!batchId) return;

    const fetchRouteData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.post(
          `/donations/batches/${batchId}/route`,
          {
            startPoint: userLocation,
            mode: transportMode,
          }
        );
        setRouteData(res.data);
      } catch (err) {
        console.error("Error fetching route:", err);
        toast.error("Failed to load route details");
      } finally {
        setLoading(false);
      }
    };

    // If we have user location or after a 2-second timeout, get the route
    const timeoutId = setTimeout(() => {
      if (!userLocation) {
        toast.info("Using default starting point");
      }
      fetchRouteData();
    }, 2000);

    if (userLocation) {
      clearTimeout(timeoutId);
      fetchRouteData();
    }

    return () => clearTimeout(timeoutId);
  }, [batchId, userLocation, transportMode]);

  useEffect(() => {
    if (!loading && routeData) {
      // Small delay before showing the map to allow the rest of UI to render
      const timer = setTimeout(() => setShowMap(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, routeData]);

  const handleTransportModeChange = (mode) => {
    setTransportMode(mode);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner text-primary mb-4"></div>
          <p>Calculating the most efficient route...</p>
        </div>
      </div>
    );
  }

  if (!routeData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-base-200 p-8 rounded-lg shadow-lg text-center">
          <FiMapPin className="mx-auto text-5xl text-error mb-4" />
          <h2 className="text-2xl font-bold">Route Not Available</h2>
          <p className="my-4">
            We couldn't calculate a route for this batch. Please try again
            later.
          </p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <FiArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if we have a direct mode response (fallback with no route segments)
  const isDirectMode = routeData.route.directMode;

  // Handle map data carefully to avoid errors
  let bounds;
  let validStopLocations = [];

  // First collect all valid stop locations
  if (routeData.route.stops && routeData.route.stops.length > 0) {
    validStopLocations = routeData.route.stops
      .filter(
        (stop) =>
          stop.location &&
          Array.isArray(stop.location) &&
          stop.location.length >= 2
      )
      .map((stop) => [stop.location[1], stop.location[0]]);
  }

  if (
    !isDirectMode &&
    routeData.route.segments &&
    routeData.route.segments.length > 0
  ) {
    // Extract coordinates from segments if available
    const allCoordinates = routeData.route.segments.flatMap((segment) => {
      if (
        segment &&
        segment.geometry &&
        Array.isArray(segment.geometry.coordinates)
      ) {
        return segment.geometry.coordinates
          .map((coord) =>
            Array.isArray(coord) && coord.length >= 2
              ? [coord[1], coord[0]]
              : null
          )
          .filter((coord) => coord !== null);
      }
      return [];
    });

    if (allCoordinates.length > 0) {
      bounds = L.latLngBounds(allCoordinates);
      // Add padding to bounds
      bounds = bounds.pad(0.2); // 20% padding
    }
  }

  // If we don't have proper bounds from segments, use stop locations
  if (!bounds && validStopLocations.length > 0) {
    bounds = L.latLngBounds(validStopLocations);
    bounds = bounds.pad(0.2); // 20% padding
  }

  // For a single point, create a reasonable bound around it
  if (validStopLocations.length === 1) {
    const center = validStopLocations[0];
    bounds = L.latLngBounds([
      [center[0] - 0.01, center[1] - 0.01],
      [center[0] + 0.01, center[1] + 0.01],
    ]);
  }

  // Last resort fallback
  if (!bounds) {
    bounds = L.latLngBounds([[51.505, -0.09], [51.555, -0.03]]);
  }

  // Format distance and duration
  const formatDistance = (meters) => {
    return meters > 1000
      ? `${(meters / 1000).toFixed(1)} km`
      : `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {isDirectMode ? "Pickup Locations" : "Optimized Route"}
            </h1>
            <p className="text-base-content/70">
              Batch #{batchId.substring(0, 8)} • {routeData.route.stops.length}{" "}
              stops
              {routeData.route.uniqueLocations === 1 && " (same location)"}
            </p>
          </div>
          <button
            className="btn btn-outline mt-4 md:mt-0"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft /> Back to Batch
          </button>
        </div>

        {/* Transport mode selector - Only show if not in direct mode */}
        {!isDirectMode && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              className={`btn btn-sm ${
                transportMode === "driving-car" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => handleTransportModeChange("driving-car")}
            >
              🚗 Car
            </button>
            <button
              className={`btn btn-sm ${
                transportMode === "cycling-regular"
                  ? "btn-primary"
                  : "btn-outline"
              }`}
              onClick={() => handleTransportModeChange("cycling-regular")}
            >
              🚲 Bicycle
            </button>
            <button
              className={`btn btn-sm ${
                transportMode === "foot-walking" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => handleTransportModeChange("foot-walking")}
            >
              🚶 Walking
            </button>
          </div>
        )}

        {/* Route summary */}
        <div className="stats bg-base-200 shadow w-full mb-6">
          <div className="stat">
            <div className="stat-figure text-primary">
              <FiMapPin className="text-2xl" />
            </div>
            <div className="stat-title">Total Distance</div>
            <div className="stat-value text-primary">
              {isDirectMode
                ? "N/A"
                : formatDistance(routeData.route.totalDistance)}
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <FiClock className="text-2xl" />
            </div>
            <div className="stat-title">Estimated Time</div>
            <div className="stat-value text-secondary">
              {isDirectMode
                ? "N/A"
                : formatDuration(routeData.route.totalDuration)}
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure text-accent">
              <FiCheckSquare className="text-2xl" />
            </div>
            <div className="stat-title">Stops</div>
            <div className="stat-value">{routeData.route.stops.length}</div>
          </div>

          {isDirectMode && (
            <div className="alert alert-info mb-6">
              <FiMapPin className="text-xl" />
              <span>
                All items are at the same or nearby locations. No route
                optimization needed.
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Map component - Make it toggleable */}
      <div className="mb-4">
        <button
          className="btn btn-sm btn-outline w-full"
          onClick={() => setShowMap((prev) => !prev)}
        >
          {showMap ? "Hide Map" : "Show Map"}
        </button>
      </div>

      {showMap ? (
        <div className="relative h-[500px] rounded-xl overflow-hidden shadow-lg mb-8">
          {mapLoading && (
            <div className="absolute inset-0 bg-base-200 bg-opacity-75 flex items-center justify-center z-10">
              <div className="loading loading-spinner text-primary"></div>
              <span className="ml-2">Loading map...</span>
            </div>
          )}

          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center bg-base-200">
                <div className="loading loading-spinner"></div>
                <span className="ml-2">Loading map...</span>
              </div>
            }
          >
            <LazyMap
              bounds={bounds}
              stops={routeData.route.stops}
              segments={!isDirectMode ? routeData.route.segments : []}
              isDirectMode={isDirectMode}
              onLoad={() => setMapLoading(false)}
            />
          </Suspense>
        </div>
      ) : (
        <div className="alert alert-info mb-8">
          <FiMapPin className="text-xl" />
          <span>Click "Show Map" to view the route on a map</span>
        </div>
      )}

      {/* Stop list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-base-100 rounded-xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-4">Pickup Locations</h2>
        <ol className="relative border-l border-base-300">
          {routeData.route.stops.map((stop, index) => (
            <li key={index} className="mb-10 ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-base-100 bg-primary text-primary-content">
                {index + 1}
              </span>
              <div className="p-4 bg-base-200 rounded-lg shadow-sm">
                <h3 className="flex items-center text-lg font-semibold">
                  {stop.type === "start" ? (
                    <>
                      <FiNavigation className="mr-2" />
                      Your Location
                    </>
                  ) : (
                    <>
                      <FiMapPin className="mr-2" />
                      {stop.businessName}
                    </>
                  )}
                </h3>
                {stop.address && (
                  <p className="text-base-content/70 mt-1">{stop.address}</p>
                )}

                {/* Display items at this stop if available */}
                {stop.items && stop.items.length > 0 && (
                  <div className="mt-3 p-3 bg-base-100 rounded-md">
                    <h4 className="text-sm font-medium">Items to pick up:</h4>
                    <ul className="mt-1 space-y-1">
                      {stop.items.map((item, i) => (
                        <li key={i} className="text-sm flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                          {item.foodName}
                          {item.quantity && (
                            <span className="ml-1 text-xs opacity-75">
                              ({item.quantity} {item.unit || "units"})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Only show route information if not in direct mode and we have segments */}
                {!isDirectMode &&
                  index < routeData.route.stops.length - 1 &&
                  routeData.route.segments &&
                  routeData.route.segments[index] &&
                  routeData.route.segments[index].summary && (
                    <div className="mt-3 flex items-center text-sm text-base-content/70">
                      <FiClock className="mr-1" />
                      {formatDuration(
                        routeData.route.segments[index].summary.duration
                      )}
                      <span className="mx-2">•</span>
                      {formatDistance(
                        routeData.route.segments[index].summary.distance
                      )}
                    </div>
                  )}
              </div>
            </li>
          ))}
        </ol>
      </motion.div>
    </div>
  );
}

export default BatchRouteDetails;
