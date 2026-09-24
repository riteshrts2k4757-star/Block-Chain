import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use '/' for Vercel web deployment (change to './' if building for Capacitor mobile app)
  base: '/',
})
