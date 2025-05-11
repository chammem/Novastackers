// src/services/mysteryPackApi.js
import axiosInstance from './axiosInstance';

const BASE_URL = '/api';

export const getMysteryPacks = () => {
  return axiosInstance.get(`${BASE_URL}/mystery-packs`);
};

export const getFoodSales = () => {
  return axiosInstance.get(`${BASE_URL}/food-sales`);
};

const mysteryPackApi = {
  getMysteryPacks,
  getFoodSales
};

export default mysteryPackApi;
