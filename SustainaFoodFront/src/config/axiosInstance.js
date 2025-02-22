import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8082/api", // Change this to your API URL
    headers: { 
        "Content-Type": "application/json"
    }
});

export default axiosInstance;
