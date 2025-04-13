import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import axiosInstance from "../config/axiosInstance";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useParams } from "react-router-dom";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const destinationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
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

const MapView = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [optimizedStops, setOptimizedStops] = useState([]);
  const { batchId } = useParams();
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
      },
      (err) => console.error("Failed to get user location:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    const fetchAndOptimizeRoute = async () => {
      if (!userLocation || !batchId) return;
  
      try {
        const batchRouteRes = await axiosInstance.get(`donations/batch-route-data/${batchId}`);
        console.log("📦 Route response:", batchRouteRes.data);
        const { pickups, end } = batchRouteRes.data;
        setDestination([end[1], end[0]]); // Convert [lng, lat] → [lat, lng] for Leaflet

  
        const response = await axiosInstance.post("/optimized-route", {
          start: [userLocation[1], userLocation[0]], // lng, lat
          end,
          pickups
        });
  
        const { orderedWaypoints, encodedPolyline } = response.data;
        const decoded = polyline.decode(encodedPolyline);
        setRouteCoords(decoded);
        setOptimizedStops(orderedWaypoints);
      } catch (err) {
        console.error("Failed to fetch route:", err);
      }
    };
  
    fetchAndOptimizeRoute();
  }, [userLocation, batchId]);
  

  if (!userLocation) return <div className="text-center py-10">Getting your location...</div>;

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer center={userLocation} zoom={13} style={{ height: "100%", width: "100%" }}>
        <ForceMapResize />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

        <Marker position={userLocation} icon={userIcon}>
          <Popup>Your Location (Start)</Popup>
        </Marker>

        {optimizedStops.map((point, index) => (
          <Marker key={index} position={[point[1], point[0]]} icon={createNumberedIcon(index + 1)}>
            <Popup>Stop #{index + 1}</Popup>
          </Marker>
        ))}

        {destination && (
          <Marker position={destination} icon={destinationIcon}>
            <Popup>NGO Destination</Popup>
          </Marker>
        )}


        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords.map(([lat, lng]) => [lat, lng])} pathOptions={{ color: "green", weight: 5 }} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
