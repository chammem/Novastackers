const axios = require('axios');
const geolib = require('geolib');

const ORS_API_KEY = process.env.ORS_API_KEY; // Ensure your ORS API key is set in the environment variables

/**
 * Optimize route between multiple points using OpenRouteService API
 * @param {Array} points Array of [lng, lat] coordinates
 * @param {String} mode Transport mode (driving-car, cycling, etc)
 * @returns {Object} Optimized route details
 */
exports.optimizeRoute = async (points, mode = 'driving-car') => {
  try {
    if (!points || points.length < 2) {
      throw new Error('At least two points are required for routing');
    }
    
    // Check if all points are identical or very close
    if (arePointsEffectivelyIdentical(points)) {
      console.log('All locations are effectively at the same point - skipping optimization');
      return createDirectResponse(points, mode);
    }
    
    // For small number of points (under 4), we can just try all permutations
    if (points.length <= 4) {
      return await findBestRouteByPermutation(points, mode);
    } else {
      // For more points, use the optimization service with start point fixed
      return await optimizeWithAPI(points, mode);
    }
  } catch (error) {
    console.error('Route optimization error:', error);
    throw error;
  }
};

/**
 * Check if all points are effectively at the same location (within a small threshold)
 */
function arePointsEffectivelyIdentical(points) {
  if (points.length <= 1) return true;
  
  const threshold = 0.0001; // Approximately 10 meters
  const firstPoint = points[0];
  
  return points.every(point => 
    Math.abs(point[0] - firstPoint[0]) < threshold && 
    Math.abs(point[1] - firstPoint[1]) < threshold
  );
}

/**
 * Create a simplified direct response for identical/close points
 */
function createDirectResponse(points, mode) {
  // Just return a simplified route with start/end being the same point
  const firstPoint = points[0];
  
  return {
    route: {
      segments: [{
        geometry: { coordinates: points.map(p => p) },
        summary: { distance: 0, duration: 0 }
      }],
      totalDistance: 0,
      totalDuration: 0
    },
    points: points,
    totalDistance: 0
  };
}

/**
 * Find the best route by trying all permutations of middle points
 */
async function findBestRouteByPermutation(points, mode) {
  // Always start from first point (volunteer's location or first pickup)
  const start = points[0];
  const end = points[points.length - 1]; // Last point might be volunteer's end location
  const middlePoints = points.slice(1, points.length - 1);
  
  let bestRoute = null;
  let shortestDistance = Infinity;
  let bestPermutation = null;
  
  // Generate all permutations of middle points
  const permutations = middlePoints.length > 0 ? getPermutations(middlePoints) : [[]];
  
  // Special case: direct route if no middle points
  if (permutations.length === 0 || middlePoints.length === 0) {
    try {
      const routeData = await calculateRouteSegments([start, end], mode);
      bestRoute = routeData.route;
      shortestDistance = routeData.totalDistance;
      bestPermutation = [start, end];
    } catch (err) {
      console.error("Error calculating direct route:", err);
      throw new Error("Could not calculate a route between the points");
    }
  } else {
    // Try each permutation
    let anyValidRoute = false;
    
    for (const permutation of permutations) {
      try {
        // Construct the full route
        const routePoints = [start, ...permutation, end];
        
        // Request route for this permutation
        const routeData = await calculateRouteSegments(routePoints, mode);
        anyValidRoute = true;
        
        // Check if this is better than our current best
        if (routeData.totalDistance < shortestDistance) {
          shortestDistance = routeData.totalDistance;
          bestRoute = routeData.route;
          bestPermutation = routePoints;
        }
      } catch (err) {
        console.error("Error with permutation:", err);
        // Continue to next permutation
        continue;
      }
    }
    
    // If we couldn't find any valid route
    if (!anyValidRoute) {
      // As a fallback, if points are very close, create a simple direct route
      if (arePointsCloseEnough(points)) {
        console.log("Points are close - using simplified route");
        return createDirectResponse(points, mode);
      }
      throw new Error("Could not find a valid route between the points");
    }
  }
  
  // One more fallback check if bestRoute is still null
  if (!bestRoute) {
    return createDirectResponse(points, mode);
  }
  
  return {
    route: bestRoute,
    points: bestPermutation,
    distance: shortestDistance,
    duration: bestRoute.totalDuration
  };
}

/**
 * Check if points are close enough to use a simplified response
 */
function arePointsCloseEnough(points) {
  if (points.length <= 1) return true;
  
  const threshold = 0.005; // About 500 meters
  const firstPoint = points[0];
  
  return points.every(point => 
    Math.abs(point[0] - firstPoint[0]) < threshold && 
    Math.abs(point[1] - firstPoint[1]) < threshold
  );
}

/**
 * Use the OpenRouteService optimization API directly
 */
async function optimizeWithAPI(points, mode) {
  try {
    const response = await axios.post(
      'https://api.openrouteservice.org/v2/optimization',
      {
        jobs: points.slice(1, points.length - 1).map((point, index) => ({
          id: index + 1,
          location: point
        })),
        vehicles: [{
          id: 1,
          start: points[0],
          end: points[points.length - 1] || points[0]
        }]
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Process the optimized route
    const optimizedRoute = response.data;
    // Calculate the actual route using the optimized sequence
    const optimizedPoints = [
      points[0],
      ...optimizedRoute.routes[0].steps.map(step => points[step.job]),
      points[points.length - 1]
    ];
    
    return await calculateRouteSegments(optimizedPoints, mode);
  } catch (error) {
    console.error('API optimization error:', error);
    // Fall back to permutation approach if API fails
    return await findBestRouteByPermutation(points, mode);
  }
}

/**
 * Calculate route between a sequence of points
 */
async function calculateRouteSegments(points, mode) {
  let totalDistance = 0;
  let totalDuration = 0;
  const segments = [];
  
  // Calculate route for each segment
  for (let i = 0; i < points.length - 1; i++) {
    try {
      const response = await axios.post(
        `https://api.openrouteservice.org/v2/directions/${mode}`,
        {
          coordinates: [points[i], points[i + 1]]
        },
        {
          headers: {
            Authorization: ORS_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Check if we have valid routes
      if (!response.data || !response.data.routes || response.data.routes.length === 0) {
        throw new Error(`No route found for segment ${i}`);
      }
      
      const route = response.data.routes[0];
      segments.push(route);
      totalDistance += route.summary.distance;
      totalDuration += route.summary.duration;
    } catch (err) {
      console.error(`Error calculating segment ${i}:`, err);
      throw err;
    }
  }
  
  return {
    route: {
      segments,
      totalDistance,
      totalDuration
    },
    totalDistance,
    points
  };
}

/**
 * Get all permutations of an array
 */
function getPermutations(arr) {
  if (arr.length <= 1) return [arr];
  
  const result = [];
  
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const permutationsOfRemaining = getPermutations(remaining);
    
    for (const perm of permutationsOfRemaining) {
      result.push([current, ...perm]);
    }
  }
  
  return result;
}

/**
 * Get a route between two points using OpenRouteService with retry logic
 * @param {Object} start - Starting point { lat, lng }
 * @param {Object} end - Ending point { lat, lng }
 * @param {number} retries - Number of retries (default: 3)
 * @returns {Promise<Object>} The route data
 */
const getRoute = async (start, end, retries = 3) => {
  try {
    console.log("[DEBUG] Fetching route from ORS with start:", start, "end:", end);

    const response = await axios.get("https://api.openrouteservice.org/v2/directions/driving-car", {
      params: {
        api_key: ORS_API_KEY,
        start: `${start.lng},${start.lat}`,
        end: `${end.lng},${end.lat}`,
      },
    });

    console.log("[DEBUG] ORS response:", response.data);

    if (!response.data || !response.data.routes || response.data.routes.length === 0) {
      console.error("[DEBUG] No routes found in ORS response:", response.data);
      throw new Error("No routes found");
    }

    return response.data.routes[0];
  } catch (error) {
    console.error("[DEBUG] Error fetching route from ORS:", error.message);

    if (retries > 0) {
      console.log(`[DEBUG] Retrying... (${3 - retries + 1})`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * (4 - retries))); // Exponential backoff
      return getRoute(start, end, retries - 1);
    }

    throw new Error("Failed to fetch route from OpenRouteService after retries");
  }
};

/**
 * Check if two routes are in the same direction
 * @param {Object} route1 - First route data
 * @param {Object} route2 - Second route data
 * @returns {boolean} True if the routes are in the same direction, false otherwise
 */
const isSameDirection = (route1, route2) => {
  // Compare the start and end points of the routes
  const startDistance = geolib.getDistance(
    { latitude: route1.geometry.coordinates[0][1], longitude: route1.geometry.coordinates[0][0] },
    { latitude: route2.geometry.coordinates[0][1], longitude: route2.geometry.coordinates[0][0] }
  );

  const endDistance = geolib.getDistance(
    {
      latitude: route1.geometry.coordinates[route1.geometry.coordinates.length - 1][1],
      longitude: route1.geometry.coordinates[route1.geometry.coordinates.length - 1][0],
    },
    {
      latitude: route2.geometry.coordinates[route2.geometry.coordinates.length - 1][1],
      longitude: route2.geometry.coordinates[route2.geometry.coordinates.length - 1][0],
    }
  );

  // Define a threshold for similarity (e.g., 500 meters)
  const threshold = 500;

  return startDistance <= threshold && endDistance <= threshold;
};

module.exports = {
  getRoute,
  isSameDirection,
};