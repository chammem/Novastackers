const kmeans = require('node-kmeans');

// Function to cluster food items into batches
exports.createBatches = async (foodItems) => {
  try {
    // Filter out food items with missing or invalid coordinates
    const validItems = foodItems.filter(item => 
      item.buisiness_id && 
      typeof item.buisiness_id.lat === 'number' && !isNaN(item.buisiness_id.lat) &&
      typeof item.buisiness_id.lng === 'number' && !isNaN(item.buisiness_id.lng)
    );
    
    console.log(`Total items: ${foodItems.length}, Valid items with coordinates: ${validItems.length}`);
    
    if (validItems.length === 0) {
      console.log("No food items with valid coordinates found");
      return [];
    }
    
    // Extract location data for clustering with explicit conversion to float
    const vectors = validItems.map(item => {
      return [
        parseFloat(item.buisiness_id.lat), 
        parseFloat(item.buisiness_id.lng)
      ];
    });
    
    // Verify all values are valid floats
    for (let i = 0; i < vectors.length; i++) {
      if (vectors[i].some(value => typeof value !== 'number' || isNaN(value))) {
        console.log(`Invalid vector at index ${i}:`, vectors[i]);
        // Replace invalid values with defaults or filter them out
        vectors[i] = vectors[i].map(value => 
          (typeof value === 'number' && !isNaN(value)) ? value : 0.0
        );
      }
    }
    
    // If we have only one valid item, skip clustering and just create a single batch
    if (validItems.length === 1) {
      console.log("Only one valid item - creating a single batch directly");
      return [{
        items: [validItems[0]._id],
        itemDetails: [validItems[0]],
        requiredCapacity: validItems[0].size || 'small',
        centerPoint: [validItems[0].buisiness_id.lat, validItems[0].buisiness_id.lng],
        itemCount: 1
      }];
    }
    
    // Determine number of clusters (simplistic approach)
    const numClusters = Math.min(Math.max(1, Math.ceil(validItems.length / 3)), 10);
    console.log(`Creating ${numClusters} clusters from ${validItems.length} items`);
    
    // Run k-means algorithm
    return new Promise((resolve, reject) => {
      kmeans.clusterize(vectors, { k: numClusters }, (err, result) => {
        if (err) {
          console.error("K-means clustering error:", err);
          return reject(err);
        }
        
        console.log("K-means result structure:", Object.keys(result));
        
        // The result is an array of cluster objects directly, not nested inside a 'clusters' property
        const batches = result.map((cluster, index) => {
          const batchItems = cluster.clusterInd.map(i => validItems[i]);
          
          // Calculate required capacity for batch
          const requiredCapacity = calculateBatchCapacity(batchItems);
          
          return {
            items: batchItems.map(item => item._id),
            itemDetails: batchItems,
            requiredCapacity,
            centerPoint: cluster.centroid,
            itemCount: batchItems.length
          };
        });
        
        resolve(batches.filter(batch => batch.items.length > 0));
      });
    });
  } catch (error) {
    console.error("Batch creation error:", error);
    throw error;
  }
};

// Helper function to determine the required capacity for a batch
const calculateBatchCapacity = (items) => {
  if (items.some(item => item.size === 'large')) {
    return 'large';
  } else if (items.some(item => item.size === 'medium')) {
    return 'medium';
  }
  return 'small';
};