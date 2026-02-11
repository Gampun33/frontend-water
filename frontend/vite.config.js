import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 🟢 1. นำเข้า path

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 🟢 2. บังคับให้ทุก Library ใช้ React ตัวเดียวกับโปรเจกต์หลัก
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
})