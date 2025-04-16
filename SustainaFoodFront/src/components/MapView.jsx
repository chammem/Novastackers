import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import axiosInstance from "../config/axiosInstance";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage,
  FiTruck,
  FiCheck,
  FiArrowLeft,
  FiMap,
  FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import HeaderMid from "../components/HeaderMid";
import Footer from "../components/Footer";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const restaurantIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const charityIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const createNumberedIcon = (number) =>
  new L.DivIcon({
    className: "custom-number-icon",
    html: `<div class="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const ForceMapResize = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
};

// Component to fit map bounds to all markers
const FitToBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(locations);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, locations]);

  return null;
};

const MapView = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [optimizedStops, setOptimizedStops] = useState([]);
  const { batchId } = useParams();
  const [destination, setDestination] = useState(null);
  const [batch, setBatch] = useState(null);
  const [batchItems, setBatchItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [actionType, setActionType] = useState("pickup");

  const [businessGroups, setBusinessGroups] = useState({});

  // Add this function to group items by business
  const groupItemsByBusiness = (items) => {
    const groups = {};

    items.forEach((item) => {
      // Use business ID as the key
      const businessId =
        item.buisiness_id?._id ||
        (item.buisiness_id && typeof item.buisiness_id === "string"
          ? item.buisiness_id
          : null) ||
        item.business?._id ||
        null;

      if (!businessId) return;

      // Get or create the group
      if (!groups[businessId]) {
        groups[businessId] = {
          id: businessId,
          name:
            item.restaurantName ||
            (item.buisiness_id && item.buisiness_id.fullName) ||
            (item.business && item.business.fullName) ||
            "Unknown Business",
          location: item.restaurantLocation?.coordinates || null,
          items: [],
        };
      }

      // Add item to the group
      groups[businessId].items.push(item);
    });

    return groups;
  };

  // Move fetchBatchData outside the useEffect, making it available to the whole component
  const fetchBatchData = async () => {
    if (!batchId) return;

    setLoading(true);
    try {
      // Get route data first (this is working)
      const routeRes = await axiosInstance.get(
        `donations/batch-route-data/${batchId}`
      );
      console.log("📦 Route data:", routeRes.data);

      // Then try to get detailed batch data
      try {
        // Get user details first (same as in VolunteerDashboard)
        const userRes = await axiosInstance.get("/user-details");
        const userId = userRes.data.data._id;

        // Use the same endpoint as in VolunteerDashboard
        const batchesRes = await axiosInstance.get(
          `/donations/${userId}/batch-assignments`
        );

        // Find the specific batch from the list
        const batchData = batchesRes.data.find((b) => b._id === batchId);

        if (batchData) {
          setBatch(batchData);
          setBatchItems(batchData.items || []);
          console.log("📦 Batch data found:", batchData);
        } else {
          // If we can't find the batch, use the route data
          setBatch({
            _id: batchId,
            status: "assigned",
            items: routeRes.data.items || [],
          });
          setBatchItems(routeRes.data.items || []);
        }
      } catch (error) {
        console.log("Failed to get from batch assignments, using route data");
        setBatch({
          _id: batchId,
          status: "assigned",
          items: routeRes.data.items || [],
        });
        setBatchItems(routeRes.data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch batch details:", err);
      toast.error("Could not load batch information");
      setBatchItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
      },
      (err) => {
        console.error("Failed to get user location:", err);
        toast.warning("Could not get your location. Using default position.");
        setUserLocation([51.505, -0.09]); // London as fallback
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Call the fetchBatchData function when batchId changes
  useEffect(() => {
    fetchBatchData();
  }, [batchId]);

  useEffect(() => {
    const fetchAndOptimizeRoute = async () => {
      if (!userLocation || !batchId) return;

      try {
        const batchRouteRes = await axiosInstance.get(
          `donations/batch-route-data/${batchId}`
        );
        console.log("📦 Route response:", batchRouteRes.data);
        const { pickups, end } = batchRouteRes.data;
        setDestination([end[1], end[0]]); // Convert [lng, lat] → [lat, lng] for Leaflet

        // Check if all items are picked up or delivered
        const allItemsComplete = batchItems.every(
          (item) => item.status === "picked-up" || item.status === "delivered"
        );

        if (allItemsComplete) {
          console.log(
            "All items are picked up, using direct route to destination"
          );
          try {
            // Use the simple route endpoint instead of optimization
            const directResponse = await axiosInstance.post("/route", {
              start: [userLocation[1], userLocation[0]], // lng, lat
              end,
              mode: "driving-car",
            });

            const encodedPolyline = directResponse.data.routes[0].geometry;
            const decoded = polyline.decode(encodedPolyline);
            setRouteCoords(decoded);

            // Keep showing existing stops on the map but without optimizing
            setOptimizedStops(pickups);
            return;
          } catch (routeErr) {
            console.error("Failed to fetch direct route:", routeErr);
            // Just draw a straight line as fallback
            setRouteCoords([userLocation, [end[1], end[0]]]);
            return;
          }
        }

        // Otherwise, continue with optimization as normal
        const activePickups = pickups;
        console.log(`Showing all ${pickups.length} pickup points`);

        // We have active pickups to optimize
        const response = await axiosInstance.post("/optimized-route", {
          start: [userLocation[1], userLocation[0]], // lng, lat
          end,
          pickups: activePickups,
        });

        const { orderedWaypoints, encodedPolyline } = response.data;
        const decoded = polyline.decode(encodedPolyline);
        setRouteCoords(decoded);
        setOptimizedStops(orderedWaypoints || []);
      } catch (err) {
        console.error("Failed to fetch route:", err);
        toast.error("Could not optimize your route");
      }
    };

    fetchAndOptimizeRoute();
  }, [userLocation, batchId, batchItems]);

  useEffect(() => {
    if (batchItems.length > 0) {
      const groups = groupItemsByBusiness(batchItems);
      setBusinessGroups(groups);
      console.log("📦 Grouped items by business:", groups);
    }
  }, [batchItems]);

  const handleStartAction = async (item, type) => {
    if (!item || !item._id) {
      toast.error("Cannot perform action on this item");
      return;
    }

    setInProgress(true);
    setSelectedFood(item);
    setActionType(type);

    try {
      const endpoint = type === "pickup" ? "start-pickup" : "start-delivery";
      await axiosInstance.patch(`/food/${item._id}/${endpoint}`);
      toast.info(`${type === "pickup" ? "Pickup" : "Delivery"} code sent!`, {
        icon: type === "pickup" ? "🚚" : "📦",
      });
      setShowCodeInput(true);
    } catch (error) {
      console.error("Action error:", error);
      toast.error(`Failed to start ${type}`);
    } finally {
      setInProgress(false);
    }
  };

  const handleBatchPickup = async (businessId, businessName) => {
    if (!businessId || !batchId) {
      toast.error("Missing business or batch information");
      return;
    }

    setInProgress(true);

    try {
      // Use the new batch pickup endpoint
      await axiosInstance.patch(`/donations/batches/${batchId}/start-pickup`, {
        businessId,
      });

      toast.info(`Pickup code sent to ${businessName}!`, {
        icon: "🚚",
      });

      // Show code input for verification
      setActionType("pickup");
      setShowCodeInput(true);
      // Store the business ID to use in verification
      setSelectedFood({ businessId, name: businessName });
    } catch (error) {
      console.error("Batch pickup error:", error);
      toast.error(
        `Failed to start batch pickup: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setInProgress(false);
    }
  };

  const handleBatchDelivery = async () => {
    if (!batchId) {
      toast.error("Missing batch information");
      return;
    }

    setInProgress(true);

    try {
      // Use the new batch delivery endpoint
      await axiosInstance.patch(`/donations/batches/${batchId}/start-delivery`);

      toast.info("Delivery code sent to charity!", {
        icon: "📦",
      });

      // Show code input for verification
      setActionType("delivery");
      setShowCodeInput(true);
      // Store the batch ID to use in verification
      setSelectedFood({ batchId });
    } catch (error) {
      console.error("Batch delivery error:", error);
      toast.error(
        `Failed to start batch delivery: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setInProgress(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!selectedFood) return;
    setInProgress(true);

    try {
      if (actionType === "pickup" && selectedFood.businessId) {
        // Batch pickup verification
        await axiosInstance.post(`/donations/batches/${batchId}/verify-pickup`, {
          businessId: selectedFood.businessId,
          code,
        });

        toast.success(`Pickup confirmed for items from ${selectedFood.name}!`, {
          icon: "✅",
        });
      } else if (actionType === "delivery" && selectedFood.batchId) {
        // Batch delivery verification
        await axiosInstance.post(
          `/donations/batches/${batchId}/verify-delivery`,
          {
            code,
          }
        );

        toast.success("All items delivered successfully!", {
          icon: "✅",
        });
      } else {
        // Original single-item verification (fallback)
        const endpoint =
          actionType === "pickup" ? "verify-pickup" : "verify-delivery";
        await axiosInstance.post(`/food/${selectedFood._id}/${endpoint}`, {
          code,
        });

        toast.success(
          `${actionType === "pickup" ? "Pickup" : "Delivery"} confirmed!`,
          {
            icon: "✅",
          }
        );
      }

      setShowCodeInput(false);
      setCode("");

      // Refresh data
      await fetchBatchData();

      // Force route recalculation
      const currentLocation = [...userLocation];
      setUserLocation(null);
      setTimeout(() => {
        setUserLocation(currentLocation);
      }, 100);

      // Clear selection
      setSelectedItem(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid code");
    } finally {
      setInProgress(false);
    }
  };

  // Collect all marker locations for map bounds
  const allLocations = [];
  if (userLocation) allLocations.push(userLocation);
  if (destination) allLocations.push(destination);

  optimizedStops.forEach((stop) => {
    allLocations.push([stop[1], stop[0]]);
  });

  if (loading || !userLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
        <p className="text-lg">Loading map and route...</p>
      </div>
    );
  }

  return (
    <>
      <HeaderMid />

      {/* Page Title Section */}
      <div className="bg-primary text-primary-content py-6 px-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Batch Route Navigation</h1>
          <p className="text-primary-content/80">
            Follow the optimized route to efficiently complete all pickups and
            deliveries
          </p>
          {batch && (
            <div className="mt-2">
              <span className="badge badge-lg badge-outline badge-primary-content">
                Batch #
                {batch._id?.substring(batch._id.length - 5).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-280px)] max-w-7xl mx-auto px-4 py-6">
        {/* Map Section */}
        <div className="w-full lg:w-3/5 h-full bg-base-200 rounded-lg overflow-hidden shadow-md">
          <MapContainer
            center={userLocation}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <ForceMapResize />
            <FitToBounds locations={allLocations} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* User marker */}
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <div className="font-medium">Your Location</div>
                  <div className="text-xs text-gray-500">Starting point</div>
                </div>
              </Popup>
            </Marker>

            {/* Destination marker */}
            {destination && (
              <Marker position={destination} icon={charityIcon}>
                <Popup>
                  <div className="text-center">
                    <div className="font-medium">Final Destination</div>
                    <div className="text-xs text-gray-500">
                      Charity location
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Show ALL stops regardless of status */}
            {optimizedStops.map((point, index) => {
              // Find all batch items at this location
              const locationItems = batchItems.filter((item) => {
                if (!item.restaurantLocation?.coordinates) return false;
                const [lng, lat] = item.restaurantLocation.coordinates;
                return (
                  Math.abs(lng - point[0]) < 0.0001 &&
                  Math.abs(lat - point[1]) < 0.0001
                );
              });

              // Use first item or create a placeholder
              const displayItem = locationItems[0] || {
                name: `Pickup ${index + 1}`,
                status: "assigned",
                restaurantName: "Restaurant",
              };

              // IMPORTANT: No longer skipping any locations
              return (
                <Marker
                  key={`stop-${index}-${point[0]}-${point[1]}`}
                  position={[point[1], point[0]]}
                  icon={createNumberedIcon(index + 1)}
                  eventHandlers={{
                    click: () => displayItem && setSelectedItem(displayItem),
                  }}
                >
                  {/* Update the marker popup to show batch pickup button */}
                  <Popup>
                    <div>
                      <div className="font-medium">{displayItem.name}</div>
                      <div className="text-sm">Stop #{index + 1}</div>
                      <div className="text-xs mb-2">
                        From:{" "}
                        {displayItem.restaurantName ||
                          (displayItem.buisiness_id &&
                            displayItem.buisiness_id.fullName) ||
                          (displayItem.business &&
                            displayItem.business.fullName) ||
                          "Unknown"}
                      </div>

                      {locationItems.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-medium mb-1">
                            Items at this location: {locationItems.length}
                          </div>

                          {/* Check if any items need pickup */}
                          {locationItems.some(
                            (item) => item.status === "assigned"
                          ) && (
                            <>
                              <div className="text-xs">
                                {
                                  locationItems.filter(
                                    (item) => item.status === "assigned"
                                  ).length
                                }{" "}
                                items to pickup
                              </div>

                              {/* Use the business ID for batch pickup */}
                              {displayItem.buisiness_id && (
                                <button
                                  className="btn btn-xs btn-primary mt-1 w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const businessId =
                                      typeof displayItem.buisiness_id ===
                                      "object"
                                        ? displayItem.buisiness_id._id
                                        : displayItem.buisiness_id;
                                    const businessName =
                                      displayItem.restaurantName ||
                                      (displayItem.buisiness_id &&
                                        displayItem.buisiness_id.fullName) ||
                                      "this business";
                                    handleBatchPickup(businessId, businessName);
                                  }}
                                  disabled={inProgress}
                                >
                                  Pickup All Items
                                </button>
                              )}
                            </>
                          )}

                          {/* Show completed message if all picked up */}
                          {locationItems.every(
                            (item) =>
                              item.status === "picked-up" ||
                              item.status === "delivered"
                          ) && (
                            <div className="badge badge-sm badge-success w-full mt-1">
                              All items picked up
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Route polyline */}
            {routeCoords.length > 0 && (
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: "green", weight: 5 }}
              />
            )}
          </MapContainer>
        </div>

        {/* Batch Items Panel */}
        <div className="w-full lg:w-2/5 h-full flex flex-col">
          <div className="bg-base-100 p-4 rounded-lg shadow-md mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FiMap /> Batch Route
                </h2>
                <p className="text-sm text-base-content/70">
                  {batchItems.length} items in this batch
                </p>
              </div>
              <button
                className="btn btn-sm btn-outline gap-2"
                onClick={() => navigate("/volunteer")}
              >
                <FiArrowLeft /> Back to Dashboard
              </button>
            </div>

            {/* Batch Stats */}
            <div className="stats stats-sm bg-base-200 shadow-sm my-4 w-full">
              <div className="stat">
                <div className="stat-title text-xs">Pending</div>
                <div className="stat-value text-sm">
                  {
                    batchItems.filter(
                      (i) => i.status === "assigned" || i.status === "pending"
                    ).length
                  }
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-xs">Picked Up</div>
                <div className="stat-value text-sm">
                  {batchItems.filter((i) => i.status === "picked-up").length}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-xs">Delivered</div>
                <div className="stat-value text-sm">
                  {batchItems.filter((i) => i.status === "delivered").length}
                </div>
              </div>
            </div>

            {/* Batch Actions */}
            {batchItems.length > 0 && 
             batchItems.every(i => i.status === "picked-up") && (
              <div className="alert alert-success mt-4 flex justify-between items-center">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <h3 className="font-bold">All items picked up!</h3>
                    <div className="text-xs">Ready to deliver to charity</div>
                  </div>
                </div>
                <button 
                  className="btn btn-sm"
                  onClick={handleBatchDelivery}
                  disabled={inProgress}
                >
                  <FiCheck className="mr-1" /> Deliver All
                </button>
              </div>
            )}
          </div>

          {/* Items List Grouped by Business */}
          <div className="flex-1 bg-base-100 rounded-lg shadow-md p-4 overflow-y-auto">
            <h3 className="font-medium mb-3">Items by Business</h3>

            {Object.keys(businessGroups).length === 0 && (
              <div className="text-center py-6 text-base-content/60">
                <FiPackage className="mx-auto h-8 w-8 mb-2" />
                <p>No items found in this batch</p>
              </div>
            )}

            {Object.values(businessGroups).map((group, groupIndex) => (
              <div key={group.id || groupIndex} className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-sm">{group.name}</h4>
                  
                  {/* Batch pickup button */}
                  {group.items.some(item => item.status === "assigned") && (
                    <button 
                      className="btn btn-xs btn-primary"
                      onClick={() => handleBatchPickup(group.id, group.name)}
                      disabled={inProgress}
                    >
                      <FiTruck className="h-3 w-3 mr-1" /> Pickup All
                    </button>
                  )}
                </div>
                
                <div className="ml-2 pl-2 border-l-2 border-base-300">
                  {group.items.map((item, index) => (
                    <motion.div
                      key={item._id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`card ${
                        selectedItem?._id === item._id
                          ? "bg-primary/10 border border-primary"
                          : "bg-base-200"
                      } 
                        transition-all duration-200 hover:shadow-md cursor-pointer mb-2`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="card-body p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {item.name}
                              {item.status === "delivered" && (
                                <FiCheckCircle className="inline-block ml-2 text-success" />
                              )}
                            </h4>
                            <div className="text-xs text-base-content/70">
                              {item.category} • {item.quantity}
                            </div>
                          </div>
                          <div
                            className={`badge badge-${getStatusColor(item.status)}`}
                          >
                            {item.status}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Input Modal */}
      <AnimatePresence>
        {showCodeInput && (
          <div className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="modal-box"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                  {actionType === "pickup" ? (
                    <FiTruck className="w-8 h-8" />
                  ) : (
                    <FiCheck className="w-8 h-8" />
                  )}
                </div>
              </div>
              <h3 className="font-bold text-xl text-center">
                Enter {actionType === "pickup" ? "Pickup" : "Delivery"} Code
              </h3>
              <p className="py-4 text-center">
                Please enter the code provided by the{" "}
                {actionType === "pickup" ? "business" : "charity"} to confirm
                the {actionType}.
              </p>
              <div className="form-control w-full max-w-xs mx-auto">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="input input-bordered w-full text-center text-xl tracking-widest"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-action">
                <button className="btn" onClick={() => setShowCodeInput(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmCode}
                  disabled={inProgress || !code.trim()}
                >
                  {inProgress ? (
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                  ) : null}
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case "assigned":
    case "pending":
      return "info";
    case "picked-up":
      return "warning";
    case "delivered":
      return "success";
    default:
      return "neutral";
  }
};

export default MapView;
