import { io } from 'socket.io-client';

// Determine the base URL based on the environment
const baseURL = import.meta.env.PROD 
  ? 'https://sustainafood-backend-fzme.onrender.com'
  : 'http://localhost:10000'; // Updated to port 10000 to match your server

const socket = io(baseURL, {
  withCredentials: true,
  autoConnect: false, // Connect manually when needed
  reconnectionAttempts: 5,
  timeout: 10000,
});

// Error handling
socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message);
});

export default socket;
