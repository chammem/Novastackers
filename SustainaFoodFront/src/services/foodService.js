import axiosInstance from '../config/axiosInstance';


// Service to fetch food recommendations for the user
export const getFoodRecommendations = async (userId) => {
  try {
    const response = await axiosInstance.get(`/recommendations/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching food recommendations:', error);
    throw error;
  }
};

// Service to fetch all food sales
export const getAllFoodSales = async () => {
  try {
    const response = await axiosInstance.get('/food-sale');
    return response.data;
  } catch (error) {
    console.error('Error fetching food sales:', error);
    throw error;
  }
};

// Service to fetch food sales by role
export const getFoodSalesByRole = async (role) => {
  console.log(`Fetching food sales by role: ${role}`); // Log the role being fetched
  try {
    const response = await axiosInstance.get(`/food-sale/role/${role}`);
    console.log('API Response:', response.data); // Log the API response
    return response.data;
  } catch (error) {
    console.error('Error fetching food sales by role:', error.response || error.message); // Log the error details
    throw error;
  }
};


