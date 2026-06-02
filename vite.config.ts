import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/v1": {
        target: "https://cardly-backend-718707317854.asia-southeast1.run.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});