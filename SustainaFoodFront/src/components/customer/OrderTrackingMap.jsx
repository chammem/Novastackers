import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axiosInstance from '../../config/axiosInstance';
import { socket } from '../../utils/socket';

const OrderTrackingMap = ({ orderId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapData, setMapData] = useState({
    driverLocation: null,
    restaurantLocation: null,
    deliveryLocation: null
  });

  console.log('OrderTrackingMap mounted with orderId:', orderId);

  useEffect(() => {
    const fetchStaticLocations = async () => {
      try {
        console.log('Fetching locations for order:', orderId);
        
        try {
          // Get static locations (restaurant and delivery)
          const response = await axiosInstance.get(`/orders/${orderId}/locations`);
          
          let updatedMapData = {
            driverLocation: null,
            restaurantLocation: null,
            deliveryLocation: null
          };
          
          // Extract static locations if available
          if (response.data?.success && response.data?.data) {
            const { restaurantLocation, deliveryLocation } = response.data.data;
            updatedMapData.restaurantLocation = restaurantLocation;
            updatedMapData.deliveryLocation = deliveryLocation;
          }
          
          // Try to get driver location, but don't fail if it errors
          try {
            const driverResponse = await axiosInstance.get(`/orders/${orderId}/driver-location`);
            
            if (driverResponse.data?.success && driverResponse.data?.driverLocation) {
              updatedMapData.driverLocation = driverResponse.data.driverLocation;
              console.log('Driver location found:', driverResponse.data.driverLocation);
            }
          } catch (driverErr) {
            console.warn('Driver location not available:', driverErr);
            // Continue without driver location
          }
          
          setMapData(updatedMapData);
          console.log('Map data set:', updatedMapData);
          setLoading(false);
        } catch (locationErr) {
          console.error('Error fetching locations:', locationErr);
          
          // Fallback with dummy data for testing
          console.log('Using fallback location data');
          setMapData({
            restaurantLocation: { lat: 36.8125, lng: 10.1765 }, // Example restaurant
            deliveryLocation: { lat: 36.8015, lng: 10.1865 },   // Example delivery location
            driverLocation: { lat: 36.8075, lng: 10.1815 }      // Example driver between them
          });
          
          setLoading(false);
        }
      } catch (err) {
        console.error('Error setting up map:', err);
        setError('Could not load location information. Please try again later.');
        setLoading(false);
      }
    };

    fetchStaticLocations();
  }, [orderId]);

  useEffect(() => {
    // Join the order room for this specific order
    socket.emit('join-order-room', orderId);
    console.log('Joined order room for tracking:', orderId);
    
    // Listen for driver location updates
    const handleDriverLocationUpdate = (data) => {
      console.log('Received driver location update:', data);
      if (data.orderId === orderId) {
        setMapData(prev => ({
          ...prev,
          driverLocation: data.location
        }));
      }
    };
    
    socket.on('driver-location-update', handleDriverLocationUpdate);
    
    return () => {
      socket.off('driver-location-update', handleDriverLocationUpdate);
      console.log('Left order room:', orderId);
    };
  }, [orderId]);

  // Create custom icons
  const createMarkerIcon = (emoji, bgColor = "#1d4ed8") => {
    return L.divIcon({
      html: `<div style="background-color: ${bgColor}; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px;">${emoji}</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  const restaurantIcon = createMarkerIcon('🍽️', "#15803d");
  const homeIcon = createMarkerIcon('🏠', "#b91c1c");
  const driverIcon = createMarkerIcon('🚗', "#1d4ed8");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-3">Loading location information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-error text-xl mb-2">⚠️</div>
        <p className="text-center">{error}</p>
        <button 
          className="btn btn-sm btn-outline mt-3"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Calculate center point between restaurant and delivery
  const getMapCenter = () => {
    // Prioritize driver location if available
    if (mapData.driverLocation) {
      return [mapData.driverLocation.lat, mapData.driverLocation.lng];
    } else if (mapData.restaurantLocation && mapData.deliveryLocation) {
      return [
        (mapData.restaurantLocation.lat + mapData.deliveryLocation.lat) / 2,
        (mapData.restaurantLocation.lng + mapData.deliveryLocation.lng) / 2
      ];
    } else if (mapData.restaurantLocation) {
      return [mapData.restaurantLocation.lat, mapData.restaurantLocation.lng];
    } else if (mapData.deliveryLocation) {
      return [mapData.deliveryLocation.lat, mapData.deliveryLocation.lng];
    }
    return [36.8065, 10.1815]; // Default center (Tunis)
  };

  return (
    <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
      <MapContainer 
        center={getMapCenter()} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater driverLocation={mapData.driverLocation} />
        
        {mapData.driverLocation && (
          <Marker 
            position={[mapData.driverLocation.lat, mapData.driverLocation.lng]} 
            icon={driverIcon}
          >
            <Popup>Driver Location</Popup>
          </Marker>
        )}
        
        {mapData.restaurantLocation && (
          <Marker 
            position={[mapData.restaurantLocation.lat, mapData.restaurantLocation.lng]} 
            icon={restaurantIcon}
          >
            <Popup>Restaurant Location</Popup>
          </Marker>
        )}

        {mapData.deliveryLocation && (
          <Marker 
            position={[mapData.deliveryLocation.lat, mapData.deliveryLocation.lng]}
            icon={homeIcon}
          >
            <Popup>Delivery Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

// Map updater to recenter on driver location
function MapUpdater({ driverLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (driverLocation) {
      map.setView([driverLocation.lat, driverLocation.lng], 14);
    }
  }, [driverLocation, map]);
  
  return null;
}

export default OrderTrackingMap;