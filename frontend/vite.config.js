import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  // proxy only works in development, ignored in production build
  server: {
    port: 5173,
    proxy: mode === "development" ? {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      }
    } : {}
  }
}));