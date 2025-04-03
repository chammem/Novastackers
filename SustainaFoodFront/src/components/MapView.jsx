import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axiosInstance from '../config/axiosInstance';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const destination = [36.8450817, 10.1530522];

const MapView = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const start = [longitude, latitude]; // ORS expects [lng, lat]
        const end = [destination[1], destination[0]];

        setUserLocation([latitude, longitude]);

        try {
          const res = await axiosInstance.post('/route', {
            start,
            end,
          });

          const coords = res.data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteCoords(coords);
        } catch (err) {
          console.error('Failed to fetch route:', err);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
      }
    );
  }, []);

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer center={userLocation || destination} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Marker for user's location */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Marker for destination */}
        <Marker position={destination}>
          <Popup>Destination</Popup>
        </Marker>

        {/* Route line */}
        {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default MapView;
