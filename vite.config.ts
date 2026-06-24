import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
<<<<<<< HEAD
=======
  base: '/po-builder/',
>>>>>>> a083ef1efc04d81c9d9879f259476ed598a6406d
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['perchromic-karlee-aggregative.ngrok-free.dev'],
  },
})
