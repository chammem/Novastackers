const kmeans = require("node-kmeans");
const geolib = require("geolib"); // You'll need to install this: npm install geolib

// Function to cluster food items into batches with distance constraints
exports.createBatches = async (foodItems) => {
  try {
    // Filter out food items with missing or invalid coordinates
    const validItems = foodItems.filter(
      (item) =>
        item.buisiness_id &&
        typeof item.buisiness_id.lat === "number" &&
        !isNaN(item.buisiness_id.lat) &&
        typeof item.buisiness_id.lng === "number" &&
        !isNaN(item.buisiness_id.lng)
    );

    console.log(
      `Total items: ${foodItems.length}, Valid items with coordinates: ${validItems.length}`
    );

    if (validItems.length === 0) {
      console.log("No food items with valid coordinates found");
      return [];
    }

    // Group items by restaurant
    const restaurantGroups = {};
    validItems.forEach((item) => {
      const restaurantId = item.buisiness_id._id.toString();
      if (!restaurantGroups[restaurantId]) {
        restaurantGroups[restaurantId] = [];
      }
      restaurantGroups[restaurantId].push(item);
    });

    // Constants for constraints
    const MAX_DISTANCE_KM = 2; // Maximum distance between any two points in a batch
    const MIN_ITEMS_PER_BATCH = 2; // Minimum items to form a valid batch
    const MAX_ITEMS_PER_BATCH = 6; // Maximum items per batch

    console.log("\n🔍 BATCH CREATION STARTED");
    console.log("==================================================");
    console.log(`Parameters: MAX_DISTANCE: ${MAX_DISTANCE_KM}km | MIN_ITEMS: ${MIN_ITEMS_PER_BATCH} | MAX_ITEMS: ${MAX_ITEMS_PER_BATCH}`);
    console.log(`Total food items: ${foodItems.length} | Valid items with coordinates: ${validItems.length}`);
    console.log(`Unique restaurants: ${Object.keys(restaurantGroups).length}`);

    // If we have only one valid restaurant, skip clustering and just create batches directly
    if (Object.keys(restaurantGroups).length === 1) {
      console.log("Only one valid restaurant - creating batches directly");
      const singleGroup = Object.values(restaurantGroups)[0];

      // Split into multiple batches if too many items
      const batches = [];
      for (let i = 0; i < singleGroup.length; i += MAX_ITEMS_PER_BATCH) {
        const batchItems = singleGroup.slice(i, i + MAX_ITEMS_PER_BATCH);
        batches.push({
          items: batchItems.map((item) => item._id),
          itemDetails: batchItems,
          requiredCapacity: calculateBatchCapacity(batchItems),
          centerPoint: [
            batchItems[0].buisiness_id.lat,
            batchItems[0].buisiness_id.lng,
          ],
          itemCount: batchItems.length,
        });
      }
      return batches;
    }

    // Create an array of restaurant information with their centroids
    const restaurants = Object.entries(restaurantGroups).map(
      ([restaurantId, items]) => {
        const latitudes = items.map((item) =>
          parseFloat(item.buisiness_id.lat)
        );
        const longitudes = items.map((item) =>
          parseFloat(item.buisiness_id.lng)
        );
        const centroidLat =
          latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
        const centroidLng =
          longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;

        return {
          id: restaurantId,
          items: items,
          centroid: { lat: centroidLat, lng: centroidLng },
        };
      }
    );

    // Distance-constrained clustering
    const batches = [];
    let unassignedRestaurants = [...restaurants];

    while (unassignedRestaurants.length > 0) {
      // Start a new batch with the first restaurant
      const currentBatch = [unassignedRestaurants[0]];
      const currentBatchItems = [...unassignedRestaurants[0].items];
      unassignedRestaurants.splice(0, 1);

      // Try to add nearby restaurants to this batch
      let foundCompatible = true;

      while (
        foundCompatible &&
        currentBatchItems.length < MAX_ITEMS_PER_BATCH &&
        unassignedRestaurants.length > 0
      ) {
        foundCompatible = false;

        // Find the closest compatible restaurant
        let closestIndex = -1;
        let minDistance = Infinity;

        for (let i = 0; i < unassignedRestaurants.length; i++) {
          const restaurant = unassignedRestaurants[i];

          // Check if adding this restaurant would violate max distance constraint
          let canAdd = true;
          for (const existingRestaurant of currentBatch) {
            const distance =
              geolib.getDistance(
                restaurant.centroid,
                existingRestaurant.centroid
              ) / 1000; // Convert to km

            console.log(`   Checking distance: ${restaurant.id.substring(0,8)}... to ${existingRestaurant.id.substring(0,8)}... = ${distance.toFixed(2)}km (max: ${MAX_DISTANCE_KM}km)`);
            
            if (distance > MAX_DISTANCE_KM) {
              console.log(`   ❌ Too far! Distance ${distance.toFixed(2)}km exceeds ${MAX_DISTANCE_KM}km limit`);
              canAdd = false;
              break;
            }
          }

          if (canAdd) {
            // Calculate average distance to all restaurants in current batch
            let totalDistance = 0;
            for (const existingRestaurant of currentBatch) {
              totalDistance +=
                geolib.getDistance(
                  restaurant.centroid,
                  existingRestaurant.centroid
                ) / 1000;
            }
            const avgDistance = totalDistance / currentBatch.length;

            if (avgDistance < minDistance) {
              minDistance = avgDistance;
              closestIndex = i;
            }
          }
        }

        // Add the closest compatible restaurant if found
        if (closestIndex !== -1) {
          const nextRestaurant = unassignedRestaurants[closestIndex];

          // Check if adding would exceed max items per batch
          if (
            currentBatchItems.length + nextRestaurant.items.length <=
            MAX_ITEMS_PER_BATCH
          ) {
            currentBatch.push(nextRestaurant);
            currentBatchItems.push(...nextRestaurant.items);
            unassignedRestaurants.splice(closestIndex, 1);
            foundCompatible = true;
          }
        }
      }

      // Add the batch if it has minimum required items
      if (currentBatchItems.length >= MIN_ITEMS_PER_BATCH) {
        // Calculate batch centroid
        const batchLats = currentBatchItems.map(
          (item) => item.buisiness_id.lat
        );
        const batchLngs = currentBatchItems.map(
          (item) => item.buisiness_id.lng
        );
        const batchCentroidLat =
          batchLats.reduce((sum, lat) => sum + lat, 0) / batchLats.length;
        const batchCentroidLng =
          batchLngs.reduce((sum, lng) => sum + lng, 0) / batchLngs.length;

        batches.push({
          items: currentBatchItems.map((item) => item._id),
          itemDetails: currentBatchItems,
          requiredCapacity: calculateBatchCapacity(currentBatchItems),
          centerPoint: [batchCentroidLat, batchCentroidLng],
          itemCount: currentBatchItems.length,
        });

        console.log(`\n✅ Created batch with ${currentBatchItems.length} items from ${currentBatch.length} restaurants:`);
        currentBatch.forEach(restaurant => {
          console.log(`   - Restaurant ${restaurant.id.substring(0,8)}... with ${restaurant.items.length} items at [${restaurant.centroid.lat.toFixed(4)}, ${restaurant.centroid.lng.toFixed(4)}]`);
        });

        // Get total batch distance (max distance between any two points)
        let maxDistance = 0;
        for (let i = 0; i < currentBatch.length; i++) {
          for (let j = i+1; j < currentBatch.length; j++) {
            const distance = geolib.getDistance(
              currentBatch[i].centroid,
              currentBatch[j].centroid
            ) / 1000;
            maxDistance = Math.max(maxDistance, distance);
          }
        }
        console.log(`   - Max distance between any two points: ${maxDistance.toFixed(2)}km`);
        console.log(`   - Required capacity: ${calculateBatchCapacity(currentBatchItems)}`);
      } else {
        // Handle "orphaned" items that couldn't form a batch
        // Add them to the batch with the closest centroid
        if (batches.length > 0 && currentBatchItems.length > 0) {
          let closestBatchIndex = 0;
          let minBatchDistance = Infinity;

          const orphanCentroid = {
            lat:
              currentBatchItems.reduce(
                (sum, item) => sum + item.buisiness_id.lat,
                0
              ) / currentBatchItems.length,
            lng:
              currentBatchItems.reduce(
                (sum, item) => sum + item.buisiness_id.lng,
                0
              ) / currentBatchItems.length,
          };

          for (let i = 0; i < batches.length; i++) {
            const batchCentroid = {
              lat: batches[i].centerPoint[0],
              lng: batches[i].centerPoint[1],
            };

            const distance =
              geolib.getDistance(orphanCentroid, batchCentroid) / 1000;

            if (
              distance < minBatchDistance &&
              batches[i].itemCount + currentBatchItems.length <=
                MAX_ITEMS_PER_BATCH
            ) {
              minBatchDistance = distance;
              closestBatchIndex = i;
            }
          }

          // Add orphaned items to closest batch
          if (minBatchDistance <= MAX_DISTANCE_KM) {
            // Update the batch
            const targetBatch = batches[closestBatchIndex];
            targetBatch.items = [
              ...targetBatch.items,
              ...currentBatchItems.map((item) => item._id),
            ];
            targetBatch.itemDetails = [
              ...targetBatch.itemDetails,
              ...currentBatchItems,
            ];
            targetBatch.itemCount += currentBatchItems.length;
            targetBatch.requiredCapacity = calculateBatchCapacity(
              targetBatch.itemDetails
            );

            // Recalculate centroid
            const allLats = targetBatch.itemDetails.map(
              (item) => item.buisiness_id.lat
            );
            const allLngs = targetBatch.itemDetails.map(
              (item) => item.buisiness_id.lng
            );
            targetBatch.centerPoint = [
              allLats.reduce((sum, lat) => sum + lat, 0) / allLats.length,
              allLngs.reduce((sum, lng) => sum + lng, 0) / allLngs.length,
            ];
          }
        }
      }
    }

    return batches;
  } catch (error) {
    console.error("Batch creation error:", error);
    throw error;
  }
};

// Helper function to determine the required capacity for a batch
const calculateBatchCapacity = (items) => {
  if (items.some((item) => item.size === "large")) {
    return "large";
  } else if (items.some((item) => item.size === "medium")) {
    return "medium";
  }
  return "small";
};
