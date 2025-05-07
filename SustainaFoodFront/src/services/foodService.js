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

export const getAllFoodSales = async () => {
  try {
    const response = await axiosInstance.get('/food-sales');  // Changed endpoint
    return response;
  } catch (error) {
    console.error('Error in getAllFoodSales:', error);
    throw error;
  }
};

export const getFoodSalesByRole = async (role) => {
  try {
    const response = await axiosInstance.get(`/food-sales/role/${role}`);  // Changed endpoint
    return response;
  } catch (error) {
    console.error('Error in getFoodSalesByRole:', error);
    throw error;
  }
};


