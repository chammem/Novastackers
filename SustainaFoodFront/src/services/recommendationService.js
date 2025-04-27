import axiosInstance from '../config/axiosInstance';

/**
 * Fetch recommendations for a user based on their purchase history or preferences.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to an array of recommended items.
 */
export const getRecommendations = async (userId) => {
  try {
    const response = await axiosInstance.get(`/recommendations/${userId}`);
    return response.data.recommendations;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};