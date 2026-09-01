import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      "/api": {
        target: "https://researchsync-p2ic.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
