import axios from "axios";

const axiosInstance = axios.create({
    //baseURL: "http://localhost:8082/api", // Change this to your API URL
    baseURL: import.meta.env.VITE_API_BASE_URL,  // ✅ dynamic based on environment
    headers: { 
        "Content-Type": "application/json"
    },
    withCredentials: true, 
});

export default axiosInstance;
