import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8082',
      '/socket.io': {
        target: 'http://localhost:8082',
        ws: true
      }
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client', 'date-fns'], // Added 'react-dom/client'
    },
  },
})
