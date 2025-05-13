// Local development URL
const LOCAL_API_URL = 'https://sustainafood-backend-fzme.onrender.com/api';

// Production URL (from environment or fallback to Render URL)
const PRODUCTION_API_URL = process.env.REACT_APP_API_URL || "https://sustainafood-backend-fzme.onrender.com";

// Determine which URL to use based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : LOCAL_API_URL;

export { API_BASE_URL, LOCAL_API_URL, PRODUCTION_API_URL };
export default API_BASE_URL;
