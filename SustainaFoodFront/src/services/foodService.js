import axiosInstance from './axiosInstance';

const BASE_URL = '/api';
const MAX_RETRIES = 3;

const retryRequest = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.code === 'ERR_CONNECTION_REFUSED') {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

// Service to fetch food recommendations for the user
export const getFoodRecommendations = async (userId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/recommendations/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching food recommendations:', error);
    throw error;
  }
};

export const getAllFoodSales = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/food-sales`);
    return { data: Array.isArray(response.data) ? response.data : [] };
  } catch (error) {
    console.error('Error in getAllFoodSales:', error);
    return { data: [] };
  }
};

export const getFoodSalesByRole = (role) => {
  return axiosInstance.get(`${BASE_URL}/food-sales/role/${role}`);
};


