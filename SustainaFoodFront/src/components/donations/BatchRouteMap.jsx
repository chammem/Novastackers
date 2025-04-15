import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom icons for different stop types
const startIcon = new L.Icon({
  iconUrl: "/start-marker.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const pickupIcon = new L.Icon({
  iconUrl: "/pickup-marker.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapController({ bounds, onLoad }) {
  const map = useMap();
  
  useEffect(() => {
    // Signal that map is loaded
    if (onLoad) {
      setTimeout(onLoad, 500);
    }
    
    if (bounds) {
      // Set timeout to allow map to initialize properly
      setTimeout(() => {
        try {
          map.fitBounds(bounds);
          // If bounds are too small (same location points), set a reasonable zoom
          if (map.getZoom() > 16) map.setZoom(16);
        } catch (err) {
          console.error("Error fitting map to bounds:", err);
          // Fallback to a default center
          map.setView([51.505, -0.09], 13);
        }
      }, 100);
    }
    
    // Force map to recalculate size on window resize
    const handleResize = () => {
      map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map, bounds, onLoad]);
  
  return null;
}

function BatchRouteMap({ bounds, stops, segments, isDirectMode, onLoad }) {
  return (
    <MapContainer
      bounds={bounds}
      style={{ height: "100%", width: "100%" }}
      zoom={13}
      minZoom={4}
      preferCanvas={true} // Use canvas rendering for better performance
      scrollWheelZoom={true}
      className="z-0"
    >
      {/* Use a faster tile provider */}
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        noWrap={true}
      />
      
      {/* Controller to handle map events */}
      <MapController bounds={bounds} onLoad={onLoad} />
      
      {/* Route polylines - simplified and optimized */}
      {!isDirectMode && segments && segments.map((segment, index) => {
        // Skip invalid segments
        if (!segment || !segment.geometry || !Array.isArray(segment.geometry.coordinates)) {
          return null;
        }
        
        // Aggressively simplify the number of points to improve performance
        let coordinates = segment.geometry.coordinates;
        if (coordinates.length > 100) {
          // More aggressive simplification for better performance
          const step = Math.ceil(coordinates.length / 100);
          coordinates = coordinates.filter((_, i) => i % step === 0 || i === coordinates.length - 1);
        }
        
        return (
          <Polyline
            key={index}
            positions={coordinates.map((coord) => 
              Array.isArray(coord) && coord.length >= 2 ? [coord[1], coord[0]] : [0, 0]
            )}
            color="#4F46E5"
            weight={5}
            opacity={0.7}
            smoothFactor={2} // Simplify displayed path for better performance
          />
        );
      })}

      {/* Markers for stops */}
      {stops.map((stop, index) => {
        // Skip invalid stops
        if (!stop || !stop.location || !Array.isArray(stop.location) || stop.location.length < 2) {
          return null;
        }
        
        // Only render the first and last stops + every 2nd stop if there are many
        if (stops.length > 10 && index !== 0 && index !== stops.length - 1 && index % 2 !== 0) {
          return null; // Skip to improve performance
        }
        
        return (
          <Marker
            key={index}
            position={[stop.location[1], stop.location[0]]}
            icon={stop.type === "start" ? startIcon : pickupIcon}
          >
            <Popup>
              <div className="font-semibold">Stop {index + 1}</div>
              <div>{stop.businessName || stop.description}</div>
              {stop.address && <div className="text-xs mt-1">{stop.address}</div>}
              {stop.items && stop.items.length > 0 && (
                <div className="mt-2">
                  <div className="font-semibold text-xs">Items: {stop.items.length}</div>
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default BatchRouteMap;