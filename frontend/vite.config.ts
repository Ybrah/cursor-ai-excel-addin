import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync(path.resolve(process.env.HOME || process.env.USERPROFILE!, '.office-addin-dev-certs/localhost.key')),
      cert: fs.readFileSync(path.resolve(process.env.HOME || process.env.USERPROFILE!, '.office-addin-dev-certs/localhost.crt')),
    },
  },
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})
