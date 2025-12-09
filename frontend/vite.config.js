import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // hoặc '0.0.0.0'
    allowedHosts: [
      'boarishly-ruthenious-versie.ngrok-free.dev',
      '.ngrok-free.app',
      '.ngrok-free.dev'
    ]
  }
})