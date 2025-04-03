import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import axiosInstance from "../config/axiosInstance";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
  

const destination = [36.8450817, 10.1530522];

const ForceMapResize = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100); // Give the map time to load in the DOM
  }, [map]);

  return null;
};

const MapView = ({ destination }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
      },
      (err) => {
        console.error("Failed to get user location:", err);
      }
    );
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation) return;

      try {
        const response = await axiosInstance.post("/route", {
          start: [userLocation[1], userLocation[0]],
          end: [destination[1], destination[0]],
        });

        const encoded = response.data.routes?.[0]?.geometry;
        if (!encoded) return;

        const decodedCoords = polyline.decode(encoded);
        setRouteCoords(decodedCoords);
      } catch (err) {
        console.error("Failed to fetch route:", err);
      }
    };

    fetchRoute();
  }, [userLocation]);

  if (!userLocation) {
    return <div className="text-center py-10">Getting your location...</div>;
  }

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

export default MapView;
