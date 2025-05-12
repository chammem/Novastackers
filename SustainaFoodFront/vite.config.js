import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8082', // Fixed missing slash in URL
      '/socket.io': {
        target: 'http://localhost:8082',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      // Remove external configuration as it's causing module resolution issues
      // external: ['react', 'react-dom', 'react-dom/client', 'date-fns']
    },
  },
  resolve: {
    // Add alias for React to ensure it's properly resolved
    alias: {
      'react': '@modules/react',
      'react-dom': '@modules/react-dom',
    },
  },
})