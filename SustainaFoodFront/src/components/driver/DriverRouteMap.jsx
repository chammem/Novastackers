// Create new file: src/components/driver/DriverRouteMap.jsx
import React, { useEffect, useState, memo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiNavigation, FiTruck, FiPackage, FiHome } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../config/axiosInstance";
import { useNavigate } from "react-router-dom";
import polyline from "@mapbox/polyline";

// Fix default marker icons using local references for reliability
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Create custom marker icons
const createColoredIcon = (color, iconType) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; display: flex; 
           align-items: center; justify-content: center; border-radius: 50%; 
           border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
           <i class="${
             iconType === "driver"
               ? "fas fa-car"
               : iconType === "pickup"
               ? "fas fa-box"
               : "fas fa-home"
           }" style="color: white; font-size: 14px;"></i></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Create numbered marker for stop sequence
const createNumberedIcon = (number) =>
  L.divIcon({
    className: "custom-number-icon",
    html: `<div style="background-color: #4ade80; width: 30px; height: 30px; border-radius: 50%; 
           display: flex; align-items: center; justify-content: center; color: white; 
           font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });

// Create specific icon instances
const driverIcon = createColoredIcon("#1d4ed8", "driver"); // Blue
const pickupIcon = createColoredIcon("#15803d", "pickup"); // Green
const deliveryIcon = createColoredIcon("#b91c1c", "delivery"); // Red

// Component to auto-fit bounds with improved safety
const FitBounds = ({ locations }) => {
  const map = useMap();
  
  useEffect(() => {
    if (locations && locations.length > 1) {
      // Delay the bounds fitting slightly to ensure map is ready
      const timer = setTimeout(() => {
        try {
          const bounds = L.latLngBounds(locations);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        } catch (err) {
          console.warn("Error fitting bounds:", err);
          // Fallback to a simple setView if bounds fail
          if (locations.length > 0) {
            map.setView(locations[0], 13);
          }
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [map, locations]);
  
  return null;
};

// Improved map resize handler
const ForceMapResize = () => {
  const map = useMap();
  
  useEffect(() => {
    // First resize
    const initialResize = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    // Second resize to be extra safe
    const secondResize = setTimeout(() => {
      map.invalidateSize();
    }, 500);
    
    // Create an observer to detect container size changes
    if (typeof ResizeObserver !== 'undefined') {
      const container = map._container;
      const observer = new ResizeObserver(() => {
        map.invalidateSize();
      });
      
      if (container) {
        observer.observe(container);
      }
      
      return () => {
        observer.disconnect();
        clearTimeout(initialResize);
        clearTimeout(secondResize);
      };
    }
    
    return () => {
      clearTimeout(initialResize);
      clearTimeout(secondResize);
    };
  }, [map]);
  
  return null;
};

const DriverRouteMap = ({ driverId, userLocation }) => {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [stops, setStops] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRouteData = async () => {
      if (!driverId || !userLocation) return;

      setLoading(true);
      try {
        // Use the new endpoint to get deliveries with locations
        const deliveriesResponse = await axiosInstance.get(
          `/driver/${driverId}/map-deliveries`
        );

        if (
          !deliveriesResponse.data.success ||
          !deliveriesResponse.data.data ||
          deliveriesResponse.data.data.length === 0
        ) {
          setError("No active deliveries found");
          setLoading(false);
          return;
        }

        const deliveries = deliveriesResponse.data.data;

        // Extract locations for route optimization
        const pickupPoints = [];
        const deliveryPoints = [];
        const stopsData = [];

        // Prepare points for optimization
        deliveries.forEach((delivery, index) => {
          // Add pickup point if available and needed (based on status)
          if (
            (delivery.deliveryStatus === "driver_assigned" ||
              delivery.deliveryStatus === "pickup_ready") &&
            delivery.foodSale?.businessDetails?.location?.lat &&
            delivery.foodSale?.businessDetails?.location?.lng
          ) {
            const location = [
              delivery.foodSale.businessDetails.location.lng,
              delivery.foodSale.businessDetails.location.lat,
            ];

            pickupPoints.push(location);
            stopsData.push({
              type: "pickup",
              location: location,
              businessName:
                delivery.foodSale.businessDetails.fullName || "Business",
              description: delivery.foodSale.name || "Pickup Location",
              orderId: delivery._id,
              items: [
                {
                  _id: delivery._id,
                  name: delivery.foodSale.name || "Food item",
                  status: delivery.deliveryStatus,
                },
              ],
            });
          }

          // Add delivery point if available (regardless of status)
          if (delivery.deliveryAddress?.lat && delivery.deliveryAddress?.lng) {
            const location = [
              delivery.deliveryAddress.lng,
              delivery.deliveryAddress.lat,
            ];

            deliveryPoints.push(location);
            stopsData.push({
              type: "delivery",
              location: location,
              businessName: delivery.user?.fullName || "Customer",
              description: `${delivery.deliveryAddress.street || ""}, ${
                delivery.deliveryAddress.city || ""
              }`,
              orderId: delivery._id,
              items: [
                {
                  _id: delivery._id,
                  name: delivery.foodSale?.name || "Food item",
                  status: delivery.deliveryStatus,
                },
              ],
            });
          }
        });

        // Add driver's current location as starting point
        const allPoints = [
          [userLocation[1], userLocation[0]],
          ...pickupPoints,
          ...deliveryPoints,
        ];

        if (allPoints.length <= 1) {
          setError("Insufficient location data for routing");
          setLoading(false);
          return;
        }

        // Use ORS optimization if more than 2 points
        if (allPoints.length > 2) {
          try {
            // Optimize the route using the optimization endpoint
            const optimizationResponse = await axiosInstance.post(
              "/optimized-route",
              {
                start: [userLocation[1], userLocation[0]], // [lng, lat]
                end: deliveryPoints.length > 0 ? deliveryPoints[deliveryPoints.length - 1] : undefined, // End at driver location (can be changed)
                pickups: [...pickupPoints, ...deliveryPoints],
              }
            );

            const { orderedWaypoints, encodedPolyline } =
              optimizationResponse.data;

            // Decode the polyline
            if (encodedPolyline) {
              const decodedCoords = polyline.decode(encodedPolyline);
              setRouteCoords(decodedCoords);
            }

            // Reorder stops based on optimization
            if (orderedWaypoints && orderedWaypoints.length > 0) {
              // Check if we need to enforce pickup-before-delivery constraints
              let needConstraintEnforcement = false;

              // Group stops by orderId
              const orderMap = {};

              stopsData.forEach(stop => {
                if (!stop.orderId) return;

                if (!orderMap[stop.orderId]) {
                  orderMap[stop.orderId] = {};
                }

                if (stop.type === "pickup") {
                  orderMap[stop.orderId].pickup = stop;
                }

                if (stop.type === "delivery") {
                  orderMap[stop.orderId].delivery = stop;
                }
              });

              // Check if any order has pickup after delivery in the optimized route
              Object.values(orderMap).forEach(order => {
                if (!order.pickup || !order.delivery) return;

                const pickupIndex = orderedWaypoints.findIndex(wp => 
                  Math.abs(wp[0] - order.pickup.location[0]) < 0.0001 && 
                  Math.abs(wp[1] - order.pickup.location[1]) < 0.0001
                );

                const deliveryIndex = orderedWaypoints.findIndex(wp => 
                  Math.abs(wp[0] - order.delivery.location[0]) < 0.0001 && 
                  Math.abs(wp[1] - order.delivery.location[1]) < 0.0001
                );

                if (pickupIndex > deliveryIndex && pickupIndex !== -1 && deliveryIndex !== -1) {
                  needConstraintEnforcement = true;
                }
              });

              // If we need to fix the order, do it
              if (needConstraintEnforcement) {
                console.log("Fixing pickup-delivery sequence constraints");

                // Simple reordering - just put all pickups before all deliveries
                const driverStop = {
                  type: "driver",
                  location: [userLocation[1], userLocation[0]],
                  businessName: "Your Location",
                  description: "Starting Point",
                };

                const pickupStops = stopsData.filter(stop => stop.type === "pickup");
                const deliveryStops = stopsData.filter(stop => stop.type === "delivery");

                // If we have multiple orders, we need to assign numbers sequentially
                [...pickupStops, ...deliveryStops].forEach((stop, index) => {
                  stop.stopNumber = index + 1;
                });

                setStops([driverStop, ...pickupStops, ...deliveryStops]);
              } else {
                // Continue with your existing code for adding optimized stops
                const optimizedStops = [];

                // Add driver's location as first stop
                optimizedStops.push({
                  type: "driver",
                  location: [userLocation[1], userLocation[0]],
                  businessName: "Your Location",
                  description: "Starting Point",
                });

                // Add optimized waypoints
                orderedWaypoints.forEach((waypoint, index) => {
                  // Find the original stop data for this waypoint
                  const matchingStop = stopsData.find(
                    (stop) =>
                      Math.abs(stop.location[0] - waypoint[0]) < 0.0001 &&
                      Math.abs(stop.location[1] - waypoint[1]) < 0.0001
                  );

                  if (matchingStop) {
                    optimizedStops.push({
                      ...matchingStop,
                      stopNumber: index + 1,
                    });
                  }
                });

                setStops(optimizedStops);
              }
            } else {
              // Fallback: use original stops if no optimization
              setStops([
                {
                  type: "driver",
                  location: [userLocation[1], userLocation[0]],
                  businessName: "Your Location",
                  description: "Starting Point",
                },
                ...stopsData,
              ]);
            }
          } catch (optimizationError) {
            console.error("Route optimization error:", optimizationError);

            // Fallback: use simple direct route
            const fallbackRoute = {
              directMode: true,
              stops: [
                {
                  type: "driver",
                  location: [userLocation[1], userLocation[0]],
                  businessName: "Your Location",
                  description: "Starting Point",
                },
                ...stopsData,
              ],
            };

            setRouteData(fallbackRoute);
            setStops(fallbackRoute.stops);
          }
        } else {
          // Simple route with just 2 points
          try {
            const simpleRouteResponse = await axiosInstance.post("/route", {
              start: [userLocation[1], userLocation[0]], // [lng, lat]
              end: allPoints[1], // The other location point
              mode: "driving-car",
            });

            if (
              simpleRouteResponse.data &&
              simpleRouteResponse.data.routes &&
              simpleRouteResponse.data.routes[0]
            ) {
              const encodedPolyline =
                simpleRouteResponse.data.routes[0].geometry;
              if (encodedPolyline) {
                const decodedCoords = polyline.decode(encodedPolyline);
                setRouteCoords(decodedCoords);
              }
            }

            // Set basic stops
            setStops([
              {
                type: "driver",
                location: [userLocation[1], userLocation[0]],
                businessName: "Your Location",
                description: "Starting Point",
              },
              ...stopsData,
            ]);
          } catch (simpleRouteError) {
            console.error("Simple route error:", simpleRouteError);
            // Just use direct line
            setStops([
              {
                type: "driver",
                location: [userLocation[1], userLocation[0]],
                businessName: "Your Location",
                description: "Starting Point",
              },
              ...stopsData,
            ]);
          }
        }
      } catch (err) {
        console.error("Error fetching route data:", err);
        setError("Failed to fetch the route");
      } finally {
        setLoading(false);
      }
    };

    fetchRouteData();
  }, [driverId, userLocation]);

  // Extract all valid locations for map bounds
  let validLocations = [];
  if (stops && stops.length > 0) {
    validLocations = stops
      .filter(
        (stop) =>
          stop.location &&
          Array.isArray(stop.location) &&
          stop.location.length >= 2
      )
      .map((stop) => [stop.location[1], stop.location[0]]); // Convert from [lng, lat] to [lat, lng]
  }

  if (loading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-base-200 rounded-lg">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-3"></div>
          <p>Calculating optimal route...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-base-200 rounded-lg">
        <div className="text-center">
          <p className="text-error mb-2">{error}</p>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stops || stops.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-base-200 rounded-lg">
        <div className="text-center">
          <p>No active deliveries to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-md relative">
      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <ForceMapResize />
        <FitBounds locations={validLocations} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render all stops */}
        {stops.map((stop, index) => {
          if (
            !stop.location ||
            !Array.isArray(stop.location) ||
            stop.location.length < 2
          ) {
            return null;
          }

          const position = [stop.location[1], stop.location[0]]; // Convert [lng, lat] to [lat, lng]
          let icon;

          switch (stop.type) {
            case "driver":
              icon = driverIcon;
              break;
            case "pickup":
              icon = stop.stopNumber
                ? createNumberedIcon(stop.stopNumber)
                : pickupIcon;
              break;
            case "delivery":
              icon = stop.stopNumber
                ? createNumberedIcon(stop.stopNumber)
                : deliveryIcon;
              break;
            default:
              icon = null;
          }

          return (
            <Marker
              key={`${stop.type}-${index}`}
              position={position}
              icon={icon}
            >
              <Popup>
                <div className="font-semibold">
                  {stop.businessName || "Stop"}
                </div>
                <div className="text-sm">{stop.description || ""}</div>
                {stop.stopNumber && (
                  <div className="text-sm font-semibold">
                    Stop #{stop.stopNumber}
                  </div>
                )}

                {stop.items && stop.items.length > 0 && (
                  <div className="mt-2 text-sm">
                    <strong>Items:</strong>
                    <ul className="list-disc ml-4">
                      {stop.items.map((item) => (
                        <li key={item._id}>
                          {item.name} ({item.status})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {stop.orderId && (
                  <button
                    className="btn btn-xs btn-primary mt-2"
                    onClick={() => navigate(`/delivery-route/${stop.orderId}`)}
                  >
                    View Details
                  </button>
                )}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 text-xs mt-2"
                >
                  <FiNavigation className="mr-1" /> Navigate here
                </a>
              </Popup>
            </Marker>
          );
        })}

        {/* Route polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: "blue",
              weight: 4,
              opacity: 0.7,
              dashArray: null, // Solid line for optimized routes
            }}
          />
        )}

        {/* Simple direct lines if no optimized route */}
        {routeCoords.length === 0 && stops.length > 1 && (
          <Polyline
            positions={stops
              .filter(
                (stop) =>
                  stop.location &&
                  Array.isArray(stop.location) &&
                  stop.location.length >= 2
              )
              .map((stop) => [stop.location[1], stop.location[0]])}
            pathOptions={{
              color: "blue",
              weight: 4,
              opacity: 0.7,
              dashArray: "5, 10", // Dashed line for direct routes
            }}
          />
        )}
      </MapContainer>

      {/* Route stats overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2 text-sm">
        <div className="flex justify-between">
          <div>Stops: {stops.length - 1}</div>{" "}
          {/* -1 to exclude driver start position */}
          <div>Follow the numbered stops for optimal route</div>
        </div>
      </div>
    </div>
  );
};

export default memo(DriverRouteMap);
