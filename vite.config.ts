import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "https://jobai-production-7672.up.railway.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      // D-ID streaming proxy — routes /did/* to Railway backend
      "/did": {
        target: "https://interviewai-production-c272.up.railway.app",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
