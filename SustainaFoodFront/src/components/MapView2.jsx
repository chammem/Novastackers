import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import axiosInstance from "../config/axiosInstance";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";

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

const ForceMapResize = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);
  return null;
};

const MapView2 = ({ destination, transportMode }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const watchIdRef = useRef(null);

  // Get real-time location updates
  useEffect(() => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        
        const coords = [position.coords.latitude, position.coords.longitude];
        console.log("📍 New user location:", coords);
        setUserLocation(coords);
      },
      (err) => {
        console.error("Error watching location:", err);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  // Fetch route on location or destination change
  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation || !destination) return;

      try {
        const response = await axiosInstance.post("/route", {
          start: [userLocation[1], userLocation[0]],
          end: [destination[1], destination[0]],
          mode: transportMode || "driving-car" ,
        });
        
        const encoded = response.data.routes?.[0]?.geometry;
        if (encoded) {
          const decodedCoords = polyline.decode(encoded);
          setRouteCoords(decodedCoords);
        }
      } catch (err) {
        console.error("Failed to fetch route:", err);
      }
    };

    fetchRoute();
  }, [userLocation, destination]);

  if (!userLocation || !destination) {
    return <div className="text-center py-10">Loading map...</div>;
  }

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer center={userLocation} zoom={13} style={{ height: "100%", width: "100%" }}>
        <ForceMapResize />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <Marker position={userLocation}>
          <Popup>You are here</Popup>
        </Marker>

        <Marker position={destination}>
          <Popup>Destination</Popup>
        </Marker>

        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} pathOptions={{ color: "blue", weight: 5 }} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView2;
