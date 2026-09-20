import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Same address for the page and the API, as in production: the backend serves /api.
    proxy: { '/api': 'http://localhost:8000' },
  },
})
