import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8082/api", // Change this to your API URL
    headers: { 
        "Content-Type": "application/json"
    },
    withCredentials: true, 
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });
  
export default axiosInstance;
