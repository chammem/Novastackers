import { io } from "socket.io-client";

// Create a socket connection to the backend
export const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8082", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Listen for connection events
socket.on("connect", () => {
  console.log("Socket connected successfully");
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});