import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8082',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export default axiosInstance;
