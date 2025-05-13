import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd())
  
  return {
    server: {
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:8082',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: process.env.VITE_API_URL || 'http://localhost:8082',
          ws: true,
          changeOrigin: true,
        },
      },
    },
    plugins: [react()],
    define: {
      // Make environment variables available to the client
      'process.env.API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://sustainafood-backend-fzme.onrender.com'),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  }
})
