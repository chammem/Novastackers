import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
  '/api': 'http://127.0.0.1:8082', // Proxy API requests to the backend
  '/socket.io': {
    target: 'http://127.0.0.1:8082', // Proxy WebSocket connections to the backend
    ws: true,
    changeOrigin: true, // Ensure the origin header is updated
  },
},
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client', 'date-fns'], // Added 'react-dom/client'
    },
  },
})