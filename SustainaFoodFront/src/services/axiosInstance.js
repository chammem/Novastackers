import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8082',
  timeout: 10000,
  withCredentials: true
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      console.error('Network error - Is the server running?');
      return Promise.reject(new Error('Server is not responding. Please try again later.'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
