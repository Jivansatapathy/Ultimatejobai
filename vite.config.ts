import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": {
        target: "https://jobai-production-7672.up.railway.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
      // D-ID streaming proxy
      "/did": {
        target: "https://jobai-production-7672.up.railway.app",
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
  build: {
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("firebase")) return "firebase";
          if (id.includes("pdfjs-dist")) return "pdfjs";
          if (id.includes("@tensorflow-models/face-detection")) return "tf-face-model";
          if (id.includes("@tensorflow/tfjs-backend-webgl")) return "tf-webgl";
          if (id.includes("@tensorflow/tfjs-converter")) return "tf-converter";
          if (id.includes("@tensorflow/tfjs-core")) return "tf-core";
          if (id.includes("@tensorflow/tfjs")) return "tfjs";
          if (id.includes("@mediapipe")) return "mediapipe";
          // if (id.includes("recharts")) return "charts"; // Removed to prevent TDZ circular dependency errors with react-smooth across chunks
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("@tanstack/react-query")) return "query";
          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("scheduler")
          ) {
            return "react-vendor";
          }
        },
      },
    },
  },
}));
