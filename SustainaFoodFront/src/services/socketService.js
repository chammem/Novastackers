import { io } from 'socket.io-client';

// Environment detection that works with Jest
const isProd = process.env.NODE_ENV === 'production';

// Determine the base URL based on the environment
const baseURL = isProd
  ? 'https://sustainafood-backend-fzme.onrender.com'
  : 'http://localhost:10000';

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
