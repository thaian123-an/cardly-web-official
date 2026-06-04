import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/v1": {
        target: "https://cardly-backend-1028715078909.asia-southeast1.run.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});